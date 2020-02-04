class AddLoginStatusToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :login_status, :integer
  end
end
