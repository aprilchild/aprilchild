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
#     Filesystem resources library
# 
#     *------------------------------------------------------------------------------------------
#--

require 'mime/types'

module Amy
  module Projects
    class FileResourceManager < AbstractResourceManager
    
      private
        def full_path(path)
          @configuration[:basepath] + path.gsub('..', '')
        end
      
        def fix_content_type(path)
          content_type = MIME::Types.of(path).to_s
          content_type.blank? ? 'text/plain' : content_type
        end
      public
    
      def exists(path)
        File.directory?(full_path(path)) || File.exist?(full_path(path))
      end
    
      def is_collection(path)
        File.directory?(full_path(path))
      end
    
      def create(path, label, content, params={})
        File.open(full_path(path)+"/#{label}", 'w') {|f| f.write content}
      end
    
      def create_collection(path, label, params={})
        Dir.mkdir(full_path(path))
      end
    
      def load(path)
        path = full_path(path)
        return File.read(path) unless File.directory?(path)
        # reading directory contents
        r = []
        Dir.foreach(path) do |f|
          next if '.' == f || '..' == f
          next if @configuration[:omit_files] && f =~ @configuration[:omit_files]
          f_path = "#{path}/#{f}"
          r2 = {}
          r2[:basename] = f;
  				is_collection = File.directory?(f_path)
  				r2[:is_collection] = is_collection ? '1' : '0';
  				r2[:size] = is_collection ? 0 : File.size(f_path)
  				r2[:date_created] = is_collection ? 0 : File.ctime(f_path).to_i
  				r2[:date_modified] = is_collection ? 0 : File.ctime(f_path).to_i
  				r2[:content_type] = fix_content_type(f_path)
  				r2[:version] = 1;
  				r << r2
        end
        r
      end
    
      def save(path, content, params={})
        File.open(full_path(path), 'w') {|f| f.write content}
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
        fix_content_type(full_path(path))
      end
    end
  end
end