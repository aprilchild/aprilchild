#++
#     *------------------------------------------------------------------------------------------
#     MySQL Library
#
#     Built on the technologies developed and maintained by April-Child.com
#     Copyright (c)2007 Petr Krontorad, April-Child.com.
# 
#     Author: Petr Krontorad, petr@krontorad.com
# 
#     All rights reserved.
# *------------------------------------------------------------------------------------------
#--

require_library_or_gem 'mysql'

module Amy
  module Support
    class Db
      @@connection = nil
      cattr_accessor :connection_credentials

      class << self
        def get_connection
          raise RuntimeError, 'No connection credentials setup. Make sure Amy library is loaded correctly.' unless @@connection_credentials
          if @@connection.nil?
            @@connection = Mysql.real_connect(@@connection_credentials['host'] ? 'localhost' : @@connection_credentials['host'], @@connection_credentials['username'], @@connection_credentials['password'], @@connection_credentials['database'], @@connection_credentials['port'] ? 3306 : @@connection_credentials['port'])
            @@connection.options(Mysql::SET_CHARSET_NAME, @@connection_credentials['encoding'])
            @@connection.query("SET NAMES #{@@connection_credentials['encoding']}")
            
            # res = @@connection.query("SELECT * FROM amy_users")
            # puts res.methods.inspect
            # while row = res.fetch_hash
            #   puts row.inspect
            # end
            
          end
          @@connection
        end
        
        def close_connection
          @@connection.close if @@connection
        end
        
        def find(sql_query)
          unless get_connection.nil?
            sql_query.gsub!('amy.', 'amy_')
            res = @@connection.query(sql_query)
            return nil if res.nil?
            rows = []
            while row = res.fetch_hash
              rows << row
            end
            return rows
          end
          nil
        end
        
        def find_scalar(sql_query)
          if rows = find(sql_query)
            if 0 < rows.length
              return rows[rows.keys[0]]
            end
          end
          nil
        end
        
        def find_first(sql_query)
          if rows = find(sql_query)
            if 0 < rows.length
              return rows[0]
            end
          end
          nil
        end
        
        def last_error
          return @@connection.error if @@connection
          return "No active connection."
        end
        
        def quote_literal(str)
          @@connection.quote(str)
        end

      end
    end
  end
end