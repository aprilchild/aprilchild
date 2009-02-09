# AC Fry - JavaScript Framework v1.0
#
# Remote backend example - Ruby On Rails.
#
# (c)2006 Petr Krontorad, April-Child.com
# Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
# http://www.april-child.com. All rights reserved.
# See the license/license.txt for additional details regarding the license.
# Special thanks to Matt Groening and David X. Cohen for all the robots.


# Requires Fry plugin installed.

class FryRemoteExampleController < ActionController::Base
  
  act_as_fry
  
  # no_data action
  def no_data
    # we return nothing, it is considered a MISTAKE and will result in error on client-side
  end

  # invalid_action action
  def invalid_action
	  raise_error "Error when performing: #{request.parameters['str']}"
  end
  
  # reverse_string action
  def reverse_string
    set_result "#{request.parameters['str'].reverse}"
  end
  
  # get_array action
  def get_array
    set_result %w{first second third}
  end

  # get_nested_array action
  def get_nested_array
    set_result ({
        :is => 'this?',
        :nested => %w{ first second third }
    })
  end
  
  # get_assoc_array action
  def get_assoc_array
    set_result ({
      :first  => 'AAA',
      :second => 'BBB',
      :third  => 'CCC'
    })
  end
  
  # get_object action
  def get_object
    obj = TestFryObject.new
    obj.greetings = 'Hello from Ruby object ... !'
    set_result obj
  end
  
  # get_basket action
  def get_basket
    basket = TestFryBasket.new
    basket.orderId = 'JB-007'
    basket.products = [
      {:productId=>2, :quantity=>56, :name=>'Aston Martin'},
      {:productId=>6, :quantity=>22, :name=>'BMW'},
      {:productId=>7, :quantity=>18, :name=>'Fry'},
      {:productId=>1, :quantity=>98, :name=>'Leela'}
    ]
    set_result basket
  end
end


class TestFryObject
  attr_accessor :greetings
end

class TestFryBasket
  attr_accessor :orderId
  attr_accessor :products
end