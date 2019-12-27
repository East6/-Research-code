class SessionsController < ApplicationController

  def new
  end

  def create
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
  end

  def destroy
    # ログイン保持状態のセッションを切る
    session.delete(:user_id)
    render 'new' # ログイン(signup)ページをgetする(ログインページを開く)
  end
end
