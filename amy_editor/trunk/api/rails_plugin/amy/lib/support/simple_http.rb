#++
#     *------------------------------------------------------------------------------------------
#     Simple HTTP Library
#
#     Built on the technologies developed and maintained by April-Child.com
#     Copyright (c)2007 Petr Krontorad, April-Child.com.
# 
#     Author: Petr Krontorad, petr@krontorad.com
# 
#     All rights reserved.
# *------------------------------------------------------------------------------------------
#--

require 'zlib'
require 'socket'
require 'cgi'
include Socket::Constants


module Amy
  module Support
    class SimpleHTTP
    
      SUPPORTED_METHODS = %w(GET POST PROPFIND OPTIONS PUT MKCOL MOVE COPY)
    
      class << self
      
        def send_post(hostname, url_path, data={})
          send('POST', hostname, 80, url_path, data)
        end
      
        def send_get(hostname, url_path, data={})
          send('GET', hostname, 80, url_path, data)
        end
      
        def send(method, hostname, port, url_path, data={}, headers={})
          method.upcase!
          method = 'GET' unless SUPPORTED_METHODS.include?(method)
          s_data = []
          unless data.respond_to?(:values)
            # plain string data sent (eg. contents of body in PUT method)
            s_data = data
          else
            data.each do |key, value|
              value = '' if value.nil?
              s_data << "#{key}=#{CGI::escape(value)}"
            end
            s_data = s_data.join('&')
          end
          if 'GET' == method && 0 != s_data.length
            url_path = url_path + "?#{s_data}"
            s_data = ''
          end
          status_code = ''
    			content_type = 'application/x-www-form-urlencoded'
    			if headers.has_key?('Content-Type')
    				content_type = headers['Content-Type']
    				headers.delete('Content-Type')
    			end

          socket = Socket.new(AF_INET, SOCK_STREAM, 0)
          begin
            sockaddr = Socket.pack_sockaddr_in(port, hostname)
            socket.connect(sockaddr)
            socket.write("#{method} #{url_path} HTTP/1.1\r\n")
            socket.write("Host: #{hostname}\r\n")
            socket.write("Content-Type: #{content_type}\r\n")
            socket.write("Content-Length: #{s_data.length}\r\n")
            socket.write("Accept-Encoding: compress, gzip\r\n")
            socket.write("User-Agent: Gecko MSIE AppleWebKit KHTML Opera Win Mac Linux (April-Child.com simple HTTP client)\r\n")
            headers.each {|name, value| socket.write("#{name}: #{value}\r\n")}
            socket.write("Connection: close\r\n\r\n")
            socket.write(s_data)
            response = socket.read
          rescue => e
            response = ''
            status = 'HTTP/1.1 500 Internal server error or host unreachable.'
            status_code = 500
          end
          headers = {}
          body = ''
          if ix = response.index("\r\n\r\n")
            raw_headers = response[0, ix].split("\r\n")
            status = raw_headers.shift
            status_code = status.match(/\d{3}/).to_s
            raw_headers.each do |header|
              pair = header.split(':')
              headers[pair[0].downcase.strip] = pair[1].strip
            end
            body = decode_body(headers, response[ix+4..-1])
          end
          {:status => status, :status_code => status_code.to_i, :headers => headers, :body => body}
        end
      
        private
          def decode_body(headers, str, eol="\r\n")
            tmp = str
            add = eol.length
            str = ''
            if headers['transfer-encoding'] && 'chunked' == headers['transfer-encoding']
              while 0 != tmp.length
                tmp = tmp.lstrip
                pos = tmp.index(eol)
                break if pos.nil?
                len = tmp[0, pos].hex
                if headers['content-encoding']
                  str << Zlib::Inflate.new(Zlib::MAX_WBITS + 32).inflate(tmp[pos+add, len])
                else
                  str << tmp[pos+add, len]
                end
                tmp = tmp[len+pos+add..-1]
              end
            elsif headers['content-encoding']
              str = Zlib::Inflate.new(Zlib::MAX_WBITS + 32).inflate(tmp[0..-1])
            else
              str = tmp
            end
            str
          end      
      end
    end
  end
end

# response = Amy::Support::SimpleHTTP.send_post('www.april-child.com', '/amy/backend/amy.php', {:a => 'list_bundles'})
# puts "Status code: #{response[:status_code]} - whole: #{response[:status]}"
# response[:headers].each {|name, value| puts "#{name}: #{value}\n"}
# puts response[:body]



# response = Amy::Support::SimpleHTTP.send_post('amy.imac', '/projects/playground.php', {:a => 'load_resource', :path => '/prototype.js'})
# puts "Status code: #{response[:status_code]} - whole: #{response[:status]}"
# response[:headers].each {|name, value| puts "#{name}: #{value}\n"}
# puts response[:body]


# response = Amy::Support::SimpleHTTP.send('POST', 'amy-rails.imac', 80, '/projects/playground', {:a => 'description'})
# puts "Status code: #{response[:status_code]} - whole: #{response[:status]}"
# response[:headers].each {|name, value| puts "#{name}: #{value}\n"}
# puts response[:body]

