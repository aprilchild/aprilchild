class Playground::EntranceController < Playground::BaseController

  before_filter :authorize, :except => [:login, :register]

  layout "playground/root"

  def index
  end

  def login
    session[:application_id] = nil
    if request.post?
      application = Www::Application.authenticate(params[:name], params[:password])
      logger.error(application)
      if application
        session[:application_id] = application.id
        flash[:notice] = "Welcome to the application <strong>#{application.name}</strong>."
        redirect_to(:action => 'index')
      else
        flash[:notice] = "Invalid application name/password combination"
      end
    end
  end

  def logout
    if request.post?
      session[:application_id] = nil
      flash[:notice] = "You have left the application toolkit."
      redirect_to(:action => 'login')
    end
  end
  
  def register
    @application = Www::Application.new(params[:application])
    if request.post? and @application.save
      flash.now[:notice] = "Application #{@application.name} created!"
      session[:application_id] = @application.id
      redirect_to(:action => 'index')
    end
  end

end
