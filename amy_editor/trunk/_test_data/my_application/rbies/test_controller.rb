class TestController < ApplicationController

  def index
  end
  
  def moje
    render :text=>'Hello World'
  end

end