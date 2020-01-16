class SessionsMakeController < ApplicationController
  def new
    #redirect_to login_url
  end
  def create
    user = User.find_by(name: params[:session][:name].downcase)
    #debugger
    if user.login_status == 1
      user.login_status = 0
      user.save
      session[:user_id] = user.id
      redirect_to user_url(user)
    else 
      render 'new'
    end
  end
end
