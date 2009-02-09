#S##	 * AC Fry - JavaScript Framework v1.0
#	 *
#	 * Remote backend implementation - Ruby on Rails
#	 *
#	 * (c)2006 Petr Krontorad, April-Child.com
#	 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
#	 * http://www.april-child.com. All rights reserved.
#	 * See the license/license.txt for additional details regarding the license.
#	 * Special thanks to Matt Groening and David X. Cohen for all the robots.
#	

class ClassName < ParentClass
  def initialize(args)
    
  end
  
  
end

class ACBackend < ApplicationController
  
  after_filter :wrap_result
  
  @xml_output = false
  
  def raise_error(message)
    render(:text => "#E##{message}")
    logger.warn message
  end

  def prepare_result(obj, omit_declaration=false)
    result = []
    if obj.respond_to?(:each) and obj.respond_to?(:values_at)
      # array
      result << '<?xml version="1.0" encoding="UTF-8"?><r>' unless omit_declaration
      obj.each do |key, value|
        if value == nil
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
    else
      if obj.respond_to?(:capitalize)
        # string
        if omit_declaration
          result << "<![CDATA[#{obj.to_s}]]>"
        else
          result << "#S##{obj.to_s}"
        end
      else
        # object
        result << '<?xml version="1.0" encoding="UTF-8"?><r>' unless omit_declaration
        obj.instance_variables.each do |name|
          tag_name = name.sub(/[@]/, '')
          result << "<#{tag_name}>#{prepare_result(obj.instance_variable_get(name), true)}</#{tag_name}>"
        end
        result << '</r>' unless omit_declaration
        @xml_output = true
      end
    end
    return result.join
  end

  def set_result(obj)
    result = prepare_result(obj)
    render(:text => prepare_result(obj))
    logger.info result
  end

  def wrap_result
    response.headers['Content-Type'] = 'text/xml; charset=UTF-8' if @xml_output
  end

end




