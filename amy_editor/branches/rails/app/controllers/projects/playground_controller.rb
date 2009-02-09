
class Projects::PlaygroundController < Amy::AbstractProjectController

  def project_conf
    {
      :name => 'Amy Playground',
  		:protocol_version => '1.0',
  		:authentication_scheme => 'anyone',
  		:authentication_params => ''
    }
  end
  
  def setup_resource_manager
    @resource_manager = Amy::Projects::FileResourceManager.new :basepath => File.join(RAILS_ROOT, 'data/playground_test_data'), :omit_files => /^\./
  end
  
  def authenticate_user(username, password)
    'open-ticket'
  end
  
  def is_authenticated(ticket)
    true
  end

  def can_user_create(ticket, uri)
    true
  end
  
  def can_user_read(ticket, uri)
    true
  end

  def can_user_write(ticket, uri)
    true
  end
  
  def new_collection_resource(ticket, path, label)
    setup_resource_manager
    @resource_manager.create_collection(path, label)
  end

  def new_resource(ticket, path, label, content)
    setup_resource_manager
    @resource_manager.create(path, label, content)
  end
  
  def get_resource(ticket, path, act_as_preview=false)
    setup_resource_manager
    content = @resource_manager.load(path)
    return content unless act_as_preview
    render :text => content
    response.content_type = @resource_manager.content_type(path)
  end
  
  def set_resource(ticket, path, content)
    setup_resource_manager
    @resource_manager.save(path, content)
  end
  
  
end
