class SessionsController < ApplicationController
  skip_before_action :verify_authenticity_token # CSRFtokenでsessionを使っているので，切る

  def new
    redirect_to 'http://localhost:80'
  end


  def create
    #debugger
    #user = User.find_by(name: params[:session][:name].downcase)
    user = User.find_by(name: params[:name].downcase)
    #debugger
    user.login_status = 1
    user.save
    render 'new'

    """
    user = User.find_by(email: params[:session][:email].downcase)
    #if user && user.authenticate(params[:session][:password])
    if user
      # ログイン成功
      session[:user_id] = user.id
      redirect_to user_url(user)
    else
      # ログイン失敗
      render 'new' #newアクション(singupuページをgetした時の処理)に行く {routeより}
    end
    """
  end

  def destroy
    # ログイン保持状態のセッションを切る
    session.delete(:user_id)
    render 'new' # ログイン(signup)ページをgetする(ログインページを開く)
  end
end
