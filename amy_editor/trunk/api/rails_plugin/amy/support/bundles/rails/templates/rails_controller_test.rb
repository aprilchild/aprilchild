$AMY{name}_controller_test.rb;Rails controller test
# 
#	Created on $AMY{date_created} by $AMY{user_nickname} 
#

require File.dirname(__FILE__) + '/../test_helper'
require '$AMY{name}_controller'

# Re-raise errors caught by the controller.
class $AMY{camelize:name}Controller; def rescue_action(e) raise e end; end

class $AMY{camelize:name}ControllerTest < Test::Unit::TestCase
  def setup
    @controller = $AMY{camelize:name}Controller.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  # Replace this with your real tests.
  def test_truth
    assert true
  end
end
