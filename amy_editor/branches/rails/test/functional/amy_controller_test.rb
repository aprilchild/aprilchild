require File.dirname(__FILE__) + '/../test_helper'
require 'amy_controller'

# Re-raise errors caught by the controller.
class AmyController; def rescue_action(e) raise e end; end

class AmyControllerTest < Test::Unit::TestCase
  def setup
    @controller = AmyController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  # Replace this with your real tests.
  def test_truth
    assert true
  end
end
