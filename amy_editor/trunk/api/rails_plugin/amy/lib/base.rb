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
#     Library base
# 
#     *------------------------------------------------------------------------------------------
#--

$:.unshift File.expand_path(File.dirname(__FILE__))

require 'action_controller'
require 'action_view'

module Amy

  VERSION = '1.0'

  SUPPORT_PATH = File.join(RAILS_ROOT, 'data/amy_support/')
  
  class Base
    class << self
      def setup
        # Extending Rails
        ActionController::Base.send(:include, Amy)
        ActionView::Base.send(:include, Amy::Helpers)
        
        require 'abstract_application_controller'
        require 'abstract_project_controller'
        
        conf = ActiveRecord::Base.configurations['amy_editor']
        # dynamically loading proper database driver
        if 'mysql' == conf['adapter']
          require File.join(File.dirname(__FILE__), "support/mysql")
        else
          require File.join(File.dirname(__FILE__), "support/pg")
        end
        Amy::Support::Db.connection_credentials = ActiveRecord::Base.configurations['amy_editor']
        Amy::Support::Db.get_connection
        # previous might yield errors, check for postgres gem installed if using `postgres', if any other error occures, well.. solve it:)
      end
    end
  end

  class << self
    def append_features(base)
      super
      base.extend(ClassMethods)
    end
  end

  module ClassMethods
    
    # def act_as_amy_project(options = {})
    #   include Amy::InstanceMethods
    # end
    
    def act_as_amy(options = {})
      include Amy::InstanceMethods
    end

  end
  
  module InstanceMethods   
    
    def amy_support_path
      File.join(RAILS_ROOT, "vendor/plugins/amy/support/")
    end
    
    
    def amy_load_theme(name, format = :js)
    	theme_path = amy_support_path + "themes/#{name}.amTheme"
    	raise RuntimeError, "Theme `#{name}' not found at `#{theme_path}'." unless File.exist?(theme_path)
    	case format
  	  when :js
      	theme = YAML::load(File.open(theme_path))
      	out = "$class('ac.chap.theme.#{name} < ac.chap.Theme');\n"
      	out << "ac.chap.theme.#{name}.prototype.initDefinition = function(){ $call(this, 'ac.chap.Theme.initDefinition');"
      	theme['definition'].each do |key, value|
      		if 'T' == key[0..0] || 'C' == key[0..0]
      			key = "colorScheme[ac.chap.#{key}]"
      	  end
      	  out << "this.#{key} = '#{value}';\n"
    	  end
    	  out << "}\n"
        # puts out
        out
	    when :yaml
      	YAML::load(theme_path)
      when :source
        File.read(theme_path)
      end
    end
    
    def amy_list_bundles
  		bundles_path = File.join(amy_support_path, '/bundles/')
  		raise RuntimeError, "There is no bundles directory available." unless File.directory?(bundles_path)
  		bundles = []
  		Dir.foreach(bundles_path) do |f|
  		  next unless '.' != f[0..0] && File.directory?(bundles_path + f)
  		  yaml = YAML::load(File.open(bundles_path + f + '/info.amBundle'))
  		  yaml['id'] = f
  		  # getting list of templates
  		  templates_path = bundles_path + f + '/templates/'
  		  templates = []
  		  if File.directory?(templates_path)
  		    Dir.foreach(templates_path) do |ff|
  		      next if '.' == ff[0..0]
  		        content = File.read(templates_path + ff).split("\n")
  		        templates << content[0]
  	      end
  	    end
  	    yaml['templates'] = templates
  		  bundles << yaml
  	  end
  	  bundles
    end

    def amy_load_bundle(name, language = 'default', host_os = 'Mac', format = :js)
      bundle = Amy::Bundle.new(amy_support_path, name, host_os)
      case format
      when :js
        bundle_def = bundle.dump_definition
        out =  "$class('ac.chap.#{name.capitalize}KeyMap < ac.chap.KeyMap');\n"
        out << "ac.chap.#{name.capitalize}KeyMap.prototype.initDefinition = function()\n"
        out << "{\n"
        out << "var _ = '\\n';\n"
        out << "this.compile(\n\"\""
        bundle_def['keymap'].split("\n").each do |line|
          line.strip!
          next if '' == line || '#' == line[0..0]
          out << '+_+ "' + ('K'==line[0..0] ? '' : "\t") + line + "\"\n"
        end
        out << ")};\n\n"
        out << "$class('ac.chap.lang.#{name.capitalize}#{language.capitalize} < ac.chap.Language');\n"
        out << "ac.chap.lang.#{name.capitalize}#{language.capitalize}.prototype.initDefinition = function() {\n"
        out << "$call(this, 'ac.chap.Language.initDefinition');\n"
        lang_def = bundle_def['languages'][0]
        bundle_def['languages'].each do |lang|
          lang_def = lang if language == lang['id']
        end
        lang_def['definition'].each do |key, value|
          unless value.kind_of?(Array)
            if key =~ /Quote|multiRowComment/
              out << "this.#{key}=\"" + value.gsub(/\\/, "\\\\\\").gsub('"', '\"') + '"' + ";\n"
            else
              out << "this.#{key}=#{value};\n"
            end
          end
        end
        lang_def['definition']['chunkRules'].each do |rule|
          out << "this.chunkRules.push(#{rule});\n"
        end
        out << "}\n\n"
        out << "ac.chap.get#{name.capitalize}Snippets = function() {\nvar snippets = []; var snippet = {};\n"
        bundle_def['snippets'].each do |snippet|
          out << "snippet = {"
          out << "key_activation:'#{snippet['key_activation']}'," if snippet['key_activation']
          out << "tab_activation:'" + snippet['tab_activation'].gsub("'", "'+\"'\"+'") + "'," if snippet['tab_activation']
          out << "code: '" + snippet['code'].gsub("\n", "\\n").gsub("'", "'+\"'\"+'").gsub("\\u", "'+'u") + "'" if snippet['code']
          out << "};\n"
          out << "snippets.push(snippet);"
        end
        out << "\nreturn snippets;\n}"
        out
      when :yaml
        bundle
      end
    end    

    def amy_create_editing_component(options = {})
      component = {}
      component[:theme_name] = options[:theme]
      component[:theme] = amy_load_theme options[:theme]
      component[:bundle] = amy_load_bundle options[:bundle], options[:language] || 'default'
      component[:host_os] = options[:host_os]
      component
    end

  end

end
