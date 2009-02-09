# this is incucuna




class ShareSpace
  def application_by_request_uri(request)
    return request.env['REQUEST_URI'].match(/^\/([^\/]*)/)[1]
  end
  
  def moje
    render :text => "Hello World"
  end
end