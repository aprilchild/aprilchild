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
#     Resources library
# 
#     *------------------------------------------------------------------------------------------
#--

module Amy
  module Projects
    class AbstractResourceManager
      @configuration = nil
    
      def initialize(configuration={})
        @configuration = configuration
      end
    
      def exists(path)
        false
      end
    
      alias exist exists
      alias exist? exists
      alias exists? exists
    
      def is_collection(path)
        false
      end
    
      alias is_collection? is_collection
    
      def create(path, label, content, params={})
        false
      end
    
      def create_collection(path, label, params={})
        false
      end
    
      def load(path)
        nil
      end
    
      def save(path, content, params={})
        false
      end
    
      def copy(path, destination_path)
        false
      end
    
      def move(path, destination_path)
        false
      end
    
      def delete(path)
        false
      end
    
      def content_type(path)
        'text/plain'
      end
      
    
    end
  
    class Resource
    end
  end
end