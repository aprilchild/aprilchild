class ChapController < ApplicationController
  act_as_amy
  act_as_fry

  def get_application_files
    %w(fry/chap/ac.chap.js fry/chap/ac.chap.view.js fry/chap/ac.chap.settings.js)
  end


  def index
   @editor = amy_create_editing_component :theme => 'Black', :bundle => 'ruby', :language => 'default', :host_os => (request.env['HTTP_USER_AGENT'].match(/intosh/).nil? ? 'Windows' : 'Mac')
    # @editor = amy_create_editing_component :theme => 'LAZY', :bundle => 'ruby', :language => 'default', :host_os => (request.env['HTTP_USER_AGENT'].match(/intosh/).nil? ? 'Windows' : 'Mac')
  end
  
end
