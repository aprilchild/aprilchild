require File.dirname(__FILE__) + '/../../test_helper'
require 'projects/playground_controller'

# Re-raise errors caught by the controller.
class Projects::PlaygroundController; def rescue_action(e) raise e end; end

class Projects::PlaygroundControllerTest < Test::Unit::TestCase
  def setup
    @controller = Projects::PlaygroundController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  # Replace this with your real tests.
  def test_truth
    assert true
  end
end
