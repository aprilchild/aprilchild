#++
#     *------------------------------------------------------------------------------------------
#     PostgreSQL Library
#
#     Built on the technologies developed and maintained by April-Child.com
#     Copyright (c)2007 Petr Krontorad, April-Child.com.
# 
#     Author: Petr Krontorad, petr@krontorad.com
# 
#     All rights reserved.
# *------------------------------------------------------------------------------------------
#--

require 'postgres'

module Amy
  module Support
    class Db
      @@connection = nil
      cattr_accessor :connection_credentials

      class << self
        def get_connection
          raise RuntimeError, 'No connection credentials setup. Make sure Amy library is loaded correctly.' unless @@connection_credentials
          if @@connection.nil?
            @@connection = PGconn.connect(@@connection_credentials['host'] ? 'localhost' : @@connection_credentials['host'], @@connection_credentials['port'] ? 5432 : @@connection_credentials['port'], "", "", @@connection_credentials['database'], @@connection_credentials['username'], @@connection_credentials['password'])
            @@connection.set_client_encoding('UTF8')
          end
          @@connection
        end
        
        def close_connection
          @@connection.close if @@connection
        end
        
        def find(sql_query)
          unless get_connection.nil?
            res = @@connection.exec(sql_query)
            results = res.result
            rows = []
            if results.length > 0
              fields = res.fields
              results.each do |row|
                hashed_row = {}
                row.each_index do |cel_index|
                  column = row[cel_index]
                  # case res.type(cel_index)
                  #   when TIMESTAMPTZOID, TIMESTAMPOID
                  #     column = cast_to_time(column)
                  #   when NUMERIC_COLUMN_TYPE_OID
                  #     column = column.to_d if column.respond_to?(:to_d)
                  # end
                  hashed_row[fields[cel_index]] = column
                end
                rows << hashed_row
              end
            end
            res.clear
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
          PGconn.escape(str)
        end

      end
    end
  end
end