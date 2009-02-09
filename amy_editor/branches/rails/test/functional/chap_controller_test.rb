require File.dirname(__FILE__) + '/../test_helper'
require 'chap_controller'

# Re-raise errors caught by the controller.
class ChapController; def rescue_action(e) raise e end; end

class ChapControllerTest < Test::Unit::TestCase
  def setup
    @controller = ChapController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  # Replace this with your real tests.
  def test_truth
    assert true
  end
end
