class DavController < ApplicationController
  
# shitty place to be .. this is extremely boring :))))))))))
# ahoj vole, jak se vede? kdo zavola, uz tocime..........

Radek, ty jsi fantaskni borec, hovorim ti to... "ahoj_vole" 
 
  act_as_filewebdav :base_dir => "./app"
  
  before_filter :user_auth  
  
  def user_auth
      basic_auth_required {|username, password| session[:user] = Application.authenticate(username,password) }
      ahoj(this_is).to_s("jsem #{znales - @vina 1+ 2}")
  end
  
end








def firma(moje_vim_ze_tu_je)
  # a co jako?
  "i dont_know #{just_yet}"
  
end













def moje
#	Thomas.Fuchs("hardcore").to_s
	a co jako?
end






