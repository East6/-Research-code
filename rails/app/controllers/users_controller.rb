class UsersController < ApplicationController
  skip_before_action :verify_authenticity_token # CSRFtokenでsessionを使っているので，切る

  #show　アクションはログインしているユーザだけ，実行できるようにする
  def logged_in_user #ログインしているユーザか確認
    unless !session[:user_id].nil?
      redirect_to login_url
    end
    #debugger
  end
  before_action :logged_in_user, only: [:show] #showアクションが実行する前に実行するアクション
  # show アクションを，正しいユーザ(ログインしているユーザのページだけ見れるように)が見れるようにする
  def correct_user
    @user = User.find(params[:id]) #postされたユーザの情報をデータベースから取ってくる
    unless @user == User.find_by(id: session[:user_id]) # 現在ログインしているユーザ と post(ユーザのページを見たい)　が違うか確認
      render 'show_denger'
    end
  end
  before_action :correct_user, only: [:show]



  def new
    @user = User.new
  end

  def show
    @user = User.find(params[:id])
  end
  def show_denger
  end

  # /user　へのpostをすると,createアクションが呼ばられうらしい
  def create
    #debugger
    user = User.new(name: params[:name].downcase)
    if user.save
      user.login_status = 1
      user.save
    end

  ##  @user = User.new(user_params)
  ##  if @user.save
  ##    #ユーザをセーブ(新規登録?)できた時の処理を書く
  ##    session[:user_id] = @user.id# 登録した際に，ログインするようにする
  ##    redirect_to user_url(@user)   # ログインしているユーザのページを表示するところに飛ぶ
  ##  else
  ##    render 'new' # 失敗した時の実装はまだ
  ##  end
  end

  private

    def user_params
      params.require(:user).permit(:name, :email, :password_digest)
    end

end
