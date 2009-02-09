#++
#     ------------------------------------------------------------------------------------------
#     == Amy Editor ==
#     Collaborative Text and Source Code Editor for Developers
# 
#     Built on the technologies developed and maintained by April-Child.com
#     Copyright (c)2007,2008 Petr Krontorad, April-Child.com.
# 
#     Author: Petr Krontorad, petr@krontorad.com
# 
#     All rights reserved.
#     *------------------------------------------------------------------------------------------
# 
#     Project library
# 
#     *------------------------------------------------------------------------------------------
#--

require 'uri'
require 'rexml/document'


module Amy
  module Projects
    class RemoteProject

      attr_accessor :url, :name, :protocol_version, :authentication_scheme, :authentication_params
    
      def initialize(url, ticket=nil)
        @url, @ticket = url, ticket
        load!
      end

      # this trick is either evil or extraordinary beautiful :) it overcomes single-threaded rails application nature - it allows another request for locally stored projects which would be impossible since the mongrel thread is already occupied by project manager controller.
      def self.set_for_local_access
        # let's modify any call to remote host using SimpleHTTP.send - we will invoke appropriate controller action instead, since project controller is residing in our application.
        Amy::Support::SimpleHTTP.module_eval <<-"end_eval", __FILE__, __LINE__

          def self.send(method, host, port, url_path, data={}, headers={})
            class_name = url_path[1..-1].classify + 'Controller'
            begin
              require File.join(RAILS_ROOT, 'app/controllers' + url_path + '_controller')
              eval("Kernel::" + class_name + ".module_eval('def set_params_from_external(p={});@params=p;end; def compress_output;end')")
              eval('@@local_controller = Kernel::' + class_name + '.new')
            rescue => e
              # puts e
              return {:status_code => 500, :status => "HTTP/1.1 500 Project controller `" + class_name + "' could not been loaded.", :headers => {}, :body => ''}
            end
            @@local_controller.set_params_from_external(data)
            response = ActionController::CgiResponse.new(nil)
            @@local_controller.response = response
            # puts data.inspect
            begin
              @@local_controller.send(data[:a])
            rescue =>e
              # puts e
              # puts e.backtrace.join(\"\\n\")
            end
            # puts response.inspect
            status_code = response.headers['Status'] ? response.headers['Status'].match(/[0-9]{3}/).to_s : '500'
            headers = {}
            response.headers.each do |k, v|
              headers[k.downcase] = v
            end
            return {:status_code=>status_code.to_i, :status=>response.headers['Status'], :body=>response.body, :headers=>headers}
          end
        end_eval
      end
      
      def self.set_for_remote_access
        load File.join(RAILS_ROOT, 'vendor/plugins/amy/lib/support/simple_http.rb')
      end
      
    
      def load!
        url = URI.parse(@url)
        response = Amy::Support::SimpleHTTP.send('POST', url.host, url.port, url.path, {:a => 'description'})
        # puts response.inspect
        raise RuntimeError, "Invalid status code `#{response[:status_code]}' returned from server `#{url.host}'." unless 200 == response[:status_code]
        descriptor_xml = response[:body].strip
        raise RuntimeError, "Unable to load project descriptor from `#{url.host}#{url.path}': `#{descriptor_xml}'." if 0 == descriptor_xml.length || '#E#' == descriptor_xml[0,3]
        project = REXML::Document.new(descriptor_xml)
        # puts descriptor_xml
        @name = project.elements["//configuration/name"].text
        @protocol_version = project.elements["//configuration/protocol_version"].text
        @authentication_scheme = project.elements["//configuration/authentication_scheme"].text
        raise RuntimeError, "Unsupported project protocol version `#{@protocol_version}'." unless '1.0' == @protocol_version
        # checking authorization scheme
        is_authenticated = false
        auth_params = ''
        case @authentication_scheme
        when 'anyone'
          is_authenticated = true
        when 'readonly'
          is_authenticated = true
        when 'external_login_page'
          auth_params = project.elements["//configuration/authentication_params"].text
        when 'external_login_handler'
          auth_params = project.elements["//configuration/authentication_params"].text
        when 'facebook'
        when 'openid'
        else
          raise RuntimeError, "Unsupported authentication scheme `#{@authentication_scheme}'"
        end
        @authentication_params = auth_params
      end
    
      def authenticate(username, password, request_params={})
        @ticket = self.authenticate(@url, username, password, request_params)
      end
    
      def is_authenticated
        !@ticket.nil?
      end
    
      def open
        raise RuntimeError, "Not authenticated." unless is_authenticated
        return self.open(@url, @ticket)
      end
    
      def create_folder_resource(path, label)
        raise RuntimeError, "Not authenticated." unless is_authenticated
        return self.create_folder_resource(@url, @ticket, path, label)
      end

      def create_resource(path, label, content)
        raise RuntimeError, "Not authenticated." unless is_authenticated
        return self.create_resource(@url, @ticket, path, label, content)
      end

      def load_resource(path)
        raise RuntimeError, "Not authenticated." unless is_authenticated
        return self.load_resource(@url, @ticket, path)
      end

      def preview_resource(path)
        raise RuntimeError, "Not authenticated." unless is_authenticated
        return self.preview_resource(@url, @ticket, path)
      end

      def save_resource(path, content)
        raise RuntimeError, "Not authenticated." unless is_authenticated
        return self.save_resource(@url, @ticket, path, content)
      end

    
      class << self
        def authenticate(project_url, username, password, request_params={})
          url = URI.parse(project_url)
          response = Amy::Support::SimpleHTTP::send('POST', url.host, url.port, url.path, request_params.merge({:a => 'authenticate', 'username' => username, 'password' => password}))
          raise RuntimeError, "Invalid status code `#{response[:status_code]}' returned from server `#{url.host}'." unless 200 == response[:status_code]
          response = response[:body].strip
  		    raise RuntimeError, "Unable to authenticate project, no content returned from `#{url.host}#{url.path}'." if 0 == response.length
  		    if '#S#' == response[0,3]
  		      return response[3..-1]
  	      end
  	      raise RuntimeError, response[3..-1]
        end
      
        def open(project_url, ticket)
          url = URI.parse(project_url)
          # puts "opening:"
          response = Amy::Support::SimpleHTTP::send('POST', url.host, url.port, url.path, {:a => 'open', 'ticket' => ticket})
          # puts response.inspect
          raise RuntimeError, "Invalid status code `#{response[:status_code]}' returned from server `#{url.host}'." unless 200 == response[:status_code]
          response = response[:body].strip
  		    raise RuntimeError, "Unable to open project, no content returned from `#{url.host}#{url.path}'." if 0 == response.length
  		    if '#S#' == response[0,3]		      
            # puts response[3..-1]
            data = {:resources => [], :opened_resources => []}
  		      xml =  REXML::Document.new(response[3..-1])
  		      resources = xml.root.elements['//resources']
  		      resources.each do |resource|
  		        ser_resource = {}
  		        resource.each do |property|
  		          ser_resource[property.name] = property.text
  	          end
  	          data[:resources] << ser_resource
  	        end
  	        return data
  	      end
  	      raise RuntimeError, response[3..-1]
        end
      
        def create_folder_resource(project_url, ticket, path, label)
          url = URI.parse(project_url)
          label = label.gsub('/', '').strip
          response = Amy::Support::SimpleHTTP::send('POST', url.host, url.port, url.path, {:a => 'create_folder_resource', 'ticket' => ticket, 'path' => path, 'label' => label})
          raise RuntimeError, "Invalid status code `#{response[:status_code]}' returned from server `#{url.host}'." unless 200 == response[:status_code]
          content = response[:body].strip
  		    raise RuntimeError, "Unable to create project folder resource, no content returned from `#{url.host}#{url.path}'." if 0 == content.length
  		    if response[:headers]['content-type'] && response[:headers]['content-type'].index('text/xml')
  		      return {:flush => true, :content => content}
  		    end
  		    if '#S#' == content[0,3]
  		      return {:flush => false, :content => content[3..-1]}
  	      end
  	      raise RuntimeError, "Error while creating project folder resource: Message from `#{url.host}#{url.path}': #{content[3..-1]}."
        end
      
        def create_resource(project_url, ticket, path, label, content)
          url = URI.parse(project_url)
          label = label.gsub('/', '').strip
          response = Amy::Support::SimpleHTTP::send('POST', url.host, url.port, url.path, {:a => 'create_resource', 'ticket' => ticket, 'path' => path, 'label' => label, 'content' => content})
          raise RuntimeError, "Invalid status code `#{response[:status_code]}' returned from server `#{url.host}'." unless 200 == response[:status_code]
          content = response[:body].strip
  		    raise RuntimeError, "Unable to create project resource, no content returned from `#{url.host}#{url.path}'." if 0 == content.length
  		    if response[:headers]['content-type'] && response[:headers]['content-type'].index('text/xml')
  		      return {:flush => true, :content => content}
  		    end
  		    if '#S#' == content[0,3]
  		      return {:flush => false, :content => content[3..-1]}
  	      end
  	      raise RuntimeError, "Error while creating project resource: Message from `#{url.host}#{url.path}': #{content[3..-1]}."        
        end
      
        def load_resource(project_url, ticket, path)
          url = URI.parse(project_url)
          response = Amy::Support::SimpleHTTP::send('POST', url.host, url.port, url.path, {:a => 'load_resource', 'ticket' => ticket, 'path' => path})
          # puts response.inspect
          raise RuntimeError, "Invalid status code `#{response[:status_code]}' returned from server `#{url.host}'." unless 200 == response[:status_code]
          content = response[:body].strip
  		    raise RuntimeError, "Unable to load project resource, no content returned from `#{url.host}#{url.path}'." if 0 == content.length
  		    if response[:headers]['content-type'] && response[:headers]['content-type'].index('text/xml')
  		      return {:flush => true, :content => content}
  		    end
  		    if '#S#' == content[0,3]
  		      return {:flush => false, :content => content[3..-1]}
  	      end
  	      raise RuntimeError, "Error while loading project resource: Message from `#{url.host}#{url.path}': #{content[3..-1]}."        
        end
      
        def preview_resource(project_url, ticket, path)
          url = URI.parse(project_url)
          response = Amy::Support::SimpleHTTP::send('POST', url.host, url.port, url.path, {:a => 'preview_resource', 'ticket' => ticket, 'path' => path})
          raise RuntimeError, "Invalid status code `#{response[:status_code]}' returned from server `#{url.host}'." unless 200 == response[:status_code]
          return {:content_type => response[:headers]['content-type'], :content => response[:body]};
        end
      
        def save_resource(project_url, ticket, path, content)
          url = URI.parse(project_url)
          response = Amy::Support::SimpleHTTP::send('POST', url.host, url.port, url.path, {:a => 'save_resource', 'ticket' => ticket, 'path' => path, 'content' => content})
          raise RuntimeError, "Invalid status code `#{response[:status_code]}' returned from server `#{url.host}'." unless 200 == response[:status_code]
          content = response[:body].strip
  		    raise RuntimeError, "Unable to save project resource, no content returned from `#{url.host}#{url.path}'." if 0 == content.length
  		    if '#S#' == content[0,3]
  		      return true
  	      end
  	      raise RuntimeError, "Error while saving project resource: Message from `#{url.host}#{url.path}': #{content[3..-1]}."        
        end

      end
    end
  end
end