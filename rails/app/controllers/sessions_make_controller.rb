class SessionsMakeController < ApplicationController
  def new
    @cookie_name = cookies[:username]

    @user = User.find_by(name: cookies[:username].downcase)
    #debugger
    #debugger
    if @user.login_status == 1
      @user.login_status = 0
      @user.save
      session[:user_id] = @user.id
      redirect_to user_url(@user)
    end

  end

  def create
    # paramsの代わりにcookieにしたい
    # ここは使わない(デバック用で使っていた)
    @user = User.find_by(name: params[:session][:name].downcase)
    #@user = User.find_by(name: cookies[:username].downcase)
    #debugger
    if @user.login_status == 1
      @user.login_status = 0
      @user.save
      session[:user_id] = @user.id
      redirect_to user_url(@user)
    else 
      render 'new'
    end
  end
end
