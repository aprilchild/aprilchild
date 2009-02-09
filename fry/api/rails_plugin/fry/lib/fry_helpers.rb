#++
#  Fry Framework - JavaScript library
#  Rails plugin
#  Copyright(c)2007 Petr Krontorád, AprilChild.com
#--

# Helper extensions

module Fry
  module Helpers

    def fry_include(options = {})
      app_id = options[:app_id] || 'fry_mvc_app'
      app_version = options[:app_version] || '1.0'
      backend_controller = options[:backend_controller] || '/fry_mvc_app'
      lang = options[:lang] || 'en'
      if options[:loader]
        return '<script type="text/javascript" loader="true" src="' + backend_controller + '/load_mvc" charset="utf-8"></script>'
      end
      if options[:client_conf]
        return <<CODE_HTML
<script type="text/javascript" charset="utf-8">// reserving `#{app_id}` namespace
var #{app_id} = {};
// Client application configuration for Fry Framework.
var client = {
  conf: {
    locale:'#{lang}',
    progid:'#{app_id}-#{app_version}',
    fry: {
      backendURL:'#{backend_controller}/?/',
      theme:'#{options[:theme]||'apple'}'
    },
    environment:'rails'
  },

  onload:function()
  {
    #{options[:on_load_hook]}
    $include('load_framework');
    $include('load_application');
  }
};</script>
CODE_HTML
      end
    end
    
    def fry_common(options = {})
      out = '<script type="text/javascript" src="/javascripts/fry/3rdparty/firebug/firebug.js" charset="utf-8"></script>'
      out << '<script type="text/javascript" src="/javascripts/fry/ac.fry.js" charset="utf-8"></script>'
      if options[:libraries]
        options[:libraries].each do |library|
          out << '<script type="text/javascript" src="/javascripts/fry/ac.fry.' + library + '.js" charset="utf-8"></script>'
        end
      end
      if options[:onload]
        out << '<script type="text/javascript" charset="utf-8">$__tune.event.addListener(self, ' + "'load', #{options[:onload]});</script>"
      end
      out
    end

    def fry_mvc_app(options = {})
      app_id = options[:app_id] || 'fry_mvc_app'
      app_version = options[:app_version] || '1.0'
      backend_controller = options[:backend_controller] || '/fry_mvc_app'
      lang = options[:lang] || 'en'
      if not options[:end]
        out = <<CODE_HTML
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
                    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="#{lang}" lang="#{lang}">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta name="Author" content="#{options[:author]||''}" />
		<meta name="Copyright" content="#{options[:copyright]||''}" />

		<title>#{options[:title]||'Fry MVC Application'}</title>

		<link href="/javascripts/fry/mm/style/ac.ui.css" rel="stylesheet" type="text/css" />
		<link href="/javascripts/fry/mm/style/theme/apple/theme-apple.css" rel="stylesheet" type="text/css" />
		<link href="#{options[:main_style]?options[:main_style]:'/stylesheets/'+app_id+'.css'}" rel="stylesheet" type="text/css" />

    <script type="text/javascript" charset="utf-8">
		  // reserving `#{app_id}` namespace
			var #{app_id} = {};
			// Client application configuration for Fry Framework.
    	var client =
    	{
    		conf:
    		{
			    locale:'#{lang}',
    			progid:'#{app_id}-#{app_version}',
    			fry:
    			{
    				backendURL:'#{backend_controller}/?/',
				    theme:'#{options[:theme]||'apple'}'
			    },
			    environment:'rails'
        },

        onload:function()
        {
          #{options[:on_load_hook]}
					$include('load_framework');
					$include('load_application');
        }


      };
      </script>
CODE_HTML
      out << fry_include(:backend_controller => backend_controller, :loader => true)
      out = out + <<CODE_HTML
		  <style type="text/css">
		    #{options[:inline_styles] || ''}
		  </style>

	</head>
	<body scroll="no">
CODE_HTML
      else
        out = <<CODE_HTML
	</body>
</html>
CODE_HTML
      end
      out
    end
    
  end
end

