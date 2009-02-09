#++
#  Fry Framework - JavaScript library
#  Rails plugin
#  Copyright(c)2007 Petr Krontorád, AprilChild.com
#--

# Base plugin code.

$:.unshift File.expand_path(File.dirname(__FILE__))

require 'action_controller'
require 'action_view'

module Fry

  VERSION = '1.0'
  
  def self.append_features(base)
    super
    base.extend(ClassMethods)
    base.before_filter :prepare_parameters
  end
  
  def prepare_parameters
  end
  
  module ClassMethods
    def act_as_fry(options = {})
      include Fry::InstanceMethods
    end
  end
  
  module InstanceMethods   
    private
    
    def prepare_parameters
      new_params = {}
      request.parameters.each do |key, value|
        if "(a)" == key[-3..-1]
          new_value = []
          value[1..-2].split("],[").each do |piece|
            new_value << piece.sub('`§~§[]§~§`', "],[")
          end
          new_params[key[0..-4]] = new_value
        elsif "(o)" == key[-3..-1]
          new_value = Fry::StandardObject.new
          value[1..-2].split("],[").each do |piece|
            piece.sub!('`§~§[]§~§`', "],[")
            continue unless index = piece.index("=")
            eval "new_value.#{piece[0..index-1]} = piece[index+1..-1]"
          end
          new_params[key[0..-4]] = new_value
        else
          new_params[key] = value
        end
      end
      @params = new_params
    end

    def prepare_result(obj, omit_declaration=false)
      result = []
      if obj.respond_to?(:each) and obj.respond_to?(:values_at)
        # array, hash
        result << '<?xml version="1.0" encoding="UTF-8"?><r>' unless omit_declaration
        obj.each do |key, value|
          if value.nil?
            result << "<__fry_array_item>#{prepare_result(key, true)}</__fry_array_item>"
          else
            if value.respond_to?(:each) and value.respond_to?(:values_at)
              tag_name = '__fry_array_item'
              tag_name = key.to_s unless key.respond_to?(:integer?)
              result << "<#{tag_name}>#{prepare_result(value, true)}</#{tag_name}>"
            else
              result << "<#{key.to_s}><![CDATA[#{value}]]></#{key.to_s}>"
            end
          end
        end
        @xml_output = true
        result << '</r>' unless omit_declaration
      elsif obj.respond_to?(:capitalize) || obj.kind_of?(TrueClass) || obj.kind_of?(FalseClass)
        # string
        if omit_declaration
          result << "<![CDATA[#{obj.to_s}]]>"
        else
          result << "#S##{obj.to_s}"
        end
      else
        # object
        result << '<?xml version="1.0" encoding="UTF-8"?><r>' unless omit_declaration
        if obj.instance_of?(Fry::StandardObject)
          obj.values.each do |name, value|
            result << "<#{name}>#{prepare_result(value, true)}</#{name}>"
          end
        else
          obj.instance_variables.each do |name|
            tag_name = name.sub(/[@]/, '')
            result << "<#{tag_name}>#{prepare_result(obj.instance_variable_get(name), true)}</#{tag_name}>"
          end
        end
        result << '</r>' unless omit_declaration
        @xml_output = true
      end
      return result.join
    end
    
    public

    def index
      if @params.include?('a')
        send(@params['a'])
      end
    end

    def raise_error(message)
      render(:text => "#E##{message}")
      logger.warn message
    end

    def set_result(obj)
      @xml_output = false
      result = prepare_result(obj)
      render(:text => prepare_result(obj))
      #logger.info result
      response.headers['Content-Type'] = 'text/xml; charset=UTF-8' if @xml_output
      compress_output if GZIP_SUPPORTED
    end
    
    #predefined Fry actions
    FRY_MVC_FILES = %w(3rdparty/firebug/firebug.js ac.fry.js ac.fry.keyboard.js ac.fry.ui.js ac.fry.xml.js ac.fry.data.js ac.fry.ui.widget.js ac.fry.mvc.js)  
    
    def load_mvc
      base = get_framework_root
      out = ""
      FRY_MVC_FILES.each do |file|
        out << File.open(base+file).read.to_s
        out << "\nfry.__production_mode = true;\n" if 'ac.fry.js' == file
      end
      render :text => out
      compress_output if GZIP_SUPPORTED
      response.headers['Content-Type'] = 'text/javascript; charset=utf-8'
    end
    
    def get_framework_root
      File.join(RAILS_ROOT, 'public/javascripts/fry/')
    end
    
    def get_framework_files
      %w(ac.fry.data.calendar.js ac.fry.ui.support.js ac.fry.ui.form.js widget/ac.tabpane.js widget/ac.menu.js widget/ac.searchbox.js widget/ac.tree.js widget/ac.window.js 3rdparty/SWFUpload/mmSWFUpload.js)
    end
    
    def load_framework
      base = get_framework_root
      out = ""
      get_framework_files().each do |file|
        out << File.open(base+file).read.to_s
      end
      render :text => out
      compress_output if GZIP_SUPPORTED
      response.headers['Content-Type'] = 'text/javascript; charset=utf-8'
    end

    def get_application_files
      %w(locale.js helper.js controller.js model.js view.js)
    end

    def get_application_root
      File.join(RAILS_ROOT, 'public/javascripts/')
    end

    def load_application
      base = get_application_root
      out = ""
      get_application_files().each do |file|
        out << File.open(base+file).read.to_s
      end
      out << "\nif ('undefined'!=typeof fry && 'undefined'!=typeof fry.script){fry.script.register();}"
      render :text => out
      compress_output if GZIP_SUPPORTED
      response.headers['Content-Type'] = 'text/javascript; charset=utf-8'
    end
    
    def theme
      render :text => File.open(File.join(get_framework_root, 'theme/apple.js')).read.to_s
      compress_output
      response.headers['Content-Type'] = 'text/javascript; charset=utf-8'
    end
    
  end
     
  class StandardObject
    attr_accessor :values
    
    def initialize
      @values = {}
    end

    def method_missing(method_id, *args)
      method_name = method_id.id2name
      if "=" == method_name[-1..-1]
        #setter
        @values[method_name[0..-2]] = args[0]
      else
        #getter
        @values[method_name]
      end
    end
  end

end
