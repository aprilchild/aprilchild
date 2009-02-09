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
#     Project controller library
# 
#     *------------------------------------------------------------------------------------------
#--

require "digest/md5"

module Amy
  class AbstractProjectController < ActionController::Base

    act_as_fry
    act_as_amy

    attr_reader :user_ticket
    
    def setup_project
      @user_ticket = @params['ticket'] || nil
      @session_storage_path = File.join(RAILS_ROOT, 'tmp/sessions/')
    end
    
    private
    
      def generate_project_xml_description_header
        xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><project><configuration>"
        project_conf.each {|key, value| xml << "<#{key}><![CDATA[#{value}]]></#{key}>"}
        xml << "</configuration>"
        xml
      end
      
      def generate_project_xml_description_footer
        "</project>"
      end
    
      def generate_random_ticket
        offset = rand(11)
        return Time.now.to_i.to_s + Digest::MD5.hexdigest(rand(4434783).to_s + Time.now.to_i.to_s)[offset..(offset+21)]
      end
      
      def session_path(ticket)
        @session_storage_path + Digest::MD5.hexdigest(ticket) + "_projticket"
      end
      
      def exists_session_data(ticket)
        File.exist?(session_path(ticket))
      end

      def store_session_data(ticket, data={})
        puts session_path(ticket)
        File.open(session_path(ticket), 'w') do |f|
          Marshal.dump(data, f)
        end
      end
      
      def retrieve_session_data(ticket)
        return false unless exists_session_data(ticket)
        data = nil
        File.open(session_path(ticket)) do |f|
          data = Marshal.load(f)
        end
        data
      end

    protected
      
      def project_conf
        {
          :name => 'Generic Amy Project',
      		:protocol_version => '1.0',
      		:authentication_scheme => 'external_login_handler', # external_login_page, facebook, openid, readonly, anyone
      		:authentication_params => ''
        }
      end
      
      def get_opened_resources(ticket)
        []
      end
      
      def new_collection_resource(ticket, path, label)
        raise RuntimeError, "Action not implemented."
      end

      def new_resource(ticket, path, label, content)
        raise RuntimeError, "Action not implemented."
      end
      
      def get_resource(ticket, path, act_as_preview=false)
        raise RuntimeError, "Action not implemented."
      end
      
      def set_resource(ticket, path, content)
        raise RuntimeError, "Action not implemented."
      end
    
      # CRUD scheme
      def can_user_create(ticket, uri)
        false
      end
      
      def can_user_read(ticket, uri)
        false
      end
      
      def can_user_write(ticket, uri)
        false
      end

      def can_user_delete(ticket, uri)
        false
      end
      
      # Authentication
      def authenticate_user(username, password)
        ''
      end
      
      def is_authenticated(ticket)
        false
      end
      
    public

      # Actions
    def description
      setup_project
      xml = generate_project_xml_description_header
      xml << generate_project_xml_description_footer
      response.headers['Content-Type'] = 'text/xml; charset=UTF-8'
      render :text => xml
    end
    
    def authenticate
      setup_project
      begin
        if ticket = authenticate_user(@params['username'], @params['password'])
          return set_result(ticket)
        else
          return raise_error('Empty or invalid ticket returned.')
        end
      rescue => e
      end
      raise_error "Authentication failure."
    end
    
    def open
      setup_project
      ticket = @params['ticket']
      return raise_error("Unauthenticated.") unless is_authenticated(@params['ticket'])
      xml = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?><project><resources>"
      # puts "Open"
      if can_user_read(ticket, '/')
        # puts "Can read"
        resources = get_resource(ticket, '/')
        # puts resources.inspect
        if resources.respond_to?(:indices)
          resources.each do |resource|
            xml << '<resource>'
            resource.each {|key, value| xml << "<#{key}><![CDATA[#{value}]]></#{key}>"}
            xml << '</resource>'
          end
        end
        opened_resources = get_opened_resources(ticket)
        xml << '</resources><opened_resources>'
        if opened_resources.respond_to?(:indices)
          opened_resources.each do |resource|
            xml << '<resource>'
            resource.each {|key, value| xml << "<#{key}><![CDATA[#{value}]]></#{key}>"}
            xml << '</resource>'
          end
        end
        xml << '</opened_resources>'
      else
        xml << '</resources>'
      end
      xml << '</project>'
      set_result xml
    end
    
    def create_folder_resource
      setup_project
      return raise_error("Unauthenticated.") unless is_authenticated(@params['ticket'])
      return raise_error("Insufficient privileges.") unless can_user_write(@params['ticket'], @params['path'])
      set_result new_collection_resource(@params['ticket'], @params['path'], @params['label'])
    end
    
    def create_resource
      setup_project
      return raise_error("Unauthenticated.") unless is_authenticated(@params['ticket'])
      return raise_error("Insufficient privileges.") unless can_user_write(@params['ticket'], @params['path'])      
      set_result new_resource(@params['ticket'], @params['path'], @params['label'], @params['content'])
    end
    
    def load_resource
      setup_project
      return raise_error("Unauthenticated.") unless is_authenticated(@params['ticket'])
      return raise_error("Insufficient privileges.") unless can_user_read(@params['ticket'], @params['path'])
      set_result get_resource(@params['ticket'], @params['path'])
    end

    def preview_resource
      setup_project
      return raise_error("Unauthenticated.") unless is_authenticated(@params['ticket'])
      return raise_error("Insufficient privileges.") unless can_user_read(@params['ticket'], @params['path'])
      get_resource(@params['ticket'], @params['path'], true)
    end

    def save_resource
      setup_project
      return raise_error("Unauthenticated.") unless is_authenticated(@params['ticket'])
      return raise_error("Insufficient privileges.") unless can_user_write(@params['ticket'], @params['path'])
      if set_resource(@params['ticket'], @params['path'], @params['content'])
        set_result true
      else
        raise_error "Unable to save."
      end
    end
      
  end
end