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
#     Project manager controller
# 
#     *------------------------------------------------------------------------------------------
#--

require 'uri'

class AmyProjectManagerController < Amy::AbstractApplicationController

  before_filter :check_if_local_access_preferred
  
  private
    def check_if_local_access_preferred
      host = request.env['HTTP_X_FORWARDED_HOST'] ? request.env['HTTP_X_FORWARDED_HOST'] : request.env['HTTP_HOST']
      unless host.index(':')
        host = host + ':80'
      end      
      host = host.split(':')
      project_url = URI.parse(@params['url'])
      if host[0] == project_url.host && host[1].to_i == project_url.port
        Amy::Projects::RemoteProject.set_for_local_access 
      else
        Amy::Projects::RemoteProject.set_for_remote_access
      end
      true
    end
    
  public
  
  def project_check
    begin
      set_result Amy::Projects::RemoteProject.new(@params['url'])
    rescue => e
      raise_error "Project could not been loaded due an error: `#{e}'."
    end
  end
  
  def project_authenticate
    begin
      set_result Amy::Projects::RemoteProject.authenticate(@params['url'], @params['username'], @params['password'])
    rescue => e
      raise_error "Project could not been authenticated due an error: `#{e}'"
    end
  end
  
  def project_open
    begin
      set_result Amy::Projects::RemoteProject.open(@params['url'], @params['ticket'])
    rescue => e
      raise_error "Project could not been opened due an error: `#{e}'"
    end
  end

  def project_create_folder_resource
    begin
      result = Amy::Projects::RemoteProject.create_folder_resource(@params['url'], @params['ticket'], @params['path'], @params['label'])
      if result[:flush]
        response.content_type = 'text/xml; charset=UTF-8'
        return render(:text => result[:content])
      end
      set_result result[:content]
    rescue => e
      raise_error "Project folder resource `#{@params['label']}' at `#{@params['path']}' could not been created due an error: `#{e}'."
    end
  end

  def project_create_resource
    begin
      result = Amy::Projects::RemoteProject.create_resource(@params['url'], @params['ticket'], @params['path'], @params['label'], @params['content'])
      if result[:flush]
        response.content_type = 'text/xml; charset=UTF-8'
        return render(:text => result[:content])
      end
      set_result result[:content]
    rescue => e
      raise_error "Project resource `#{@params['label']}' at `#{@params['path']}' could not been created due an error: `#{e}'."
    end
  end
  
  def project_load_resource
    begin
      result = Amy::Projects::RemoteProject.load_resource(@params['url'], @params['ticket'], @params['path'])
      if result[:flush]
        response.content_type = 'text/xml; charset=UTF-8'
        return render(:text => result[:content])
      end
      set_result result[:content]
    rescue => e
      raise_error "Project resource at `#{@params['path']}' could not been loaded due an error: `#{e}'."
    end
  end
  
  def project_preview_resource
    begin
      resource = Amy::Projects::RemoteProject.preview_resource(@params['url'], @params['ticket'], @params['path'])
      response.content_type = resource[:content_type]
      return render(:text => resource[:content])
    rescue => e
      raise_error "Project resource preview at `#{@params['path']}' could not been loaded due an error: `#{e}'."
    end
  end  

  def project_save_resource
    begin
      set_result Amy::Projects::RemoteProject.save_resource(@params['url'], @params['ticket'], @params['path'], @params['content'])
    rescue => e
      raise_error "Project resource at `#{@params['path']}' could not been saved due an error: `#{e}'."
    end
  end

end
