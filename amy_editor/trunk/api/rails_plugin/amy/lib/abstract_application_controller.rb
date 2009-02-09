module Amy
  class AbstractApplicationController < ActionController::Base
    act_as_fry
    act_as_amy

    before_filter :authorize
    
    protected

      # private helpers
      def strip_filename(name)
        name.gsub('..', '').gsub('/', '')
      end    
    
    public
    
    def get_framework_files
      %w(ac.fry.data.calendar.js ac.fry.ui.support.js ac.fry.ui.form.js widget/ac.tabpane.js widget/ac.menu.js widget/ac.searchbox.js widget/ac.tree.js widget/ac.tableview.js widget/ac.outlineview.js widget/ac.window.js widget/ac.browser.js widget/ac.stub.bocombo.js widget/ac.filechooser.js widget/ac.accordion.js 3rdparty/SWFUpload/mmSWFUpload.js 3rdparty/base64/base64.js chap/ac.chap.js chap/ac.chap.view.js chap/ac.chap.settings.js)
    end

    def get_application_files
      %w(amy/locale.js amy/helper.js amy/model.js amy/model.user.js amy/model.projects.js amy/model.bundles.js amy/model.collaboration.js amy/view.js amy/controller.js amy/controller.commands.js amy/controller.ui.js amy/controller.user.js amy/controller.bundles.js amy/controller.projects.js amy/controller.collaboration.js amy/wizards.js)
    end

    def get_framework_root
      File.join(RAILS_ROOT, 'public/javascripts/fry/')
    end

    def get_application_root
      File.join(RAILS_ROOT, 'public/javascripts/')
    end  

    def index
      @app_options = {
        :app_id => 'amy',
        :backend_controller => '/amy',
        :main_style => '/mm/style/amy.css',
        :title => "Amy Editor",
        :on_load_hook => "$('no-js-notice').rs();",
        :author => 'All: Petr Krontorád, April-Child.com',
        :copyright => 'Petr Krontorád, April-Child.com (http://www.april-child.com)',
        :inline_styles => "textarea.editable, pre {" + ((request.env['HTTP_USER_AGENT'].match(/intosh/).nil? && request.env['HTTP_USER_AGENT'].match(/WebKit/).nil?) ? "font:11px 'Courier New', 'Courier', monospaced;" : "font:11px 'Courier', monospaced;") + '}'
      }
    end

    # authorization
    def authorize
      Amy::Session.amy_token = cookies[:amy_token]
      begin
        session = Amy::Session.new.authorize
  			@amy_user = Amy::User.new.load_from_session session
  		rescue
  	  end
  	  unless @amy_user
    		@amy_user = Amy::User.new
    		unless @amy_user.is_authorized
          @amy_user.make_default
        end
        session = @amy_user.create_session
  		end
  	  cookies[:amy_token] = {:value => Amy::Session.amy_token, :expires => 20.years.from_now, :path => '/'}
    end

    def amy_support_path
      @amy_user.support_path
    end    
    
  end
end
