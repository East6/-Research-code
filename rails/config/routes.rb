Rails.application.routes.draw do
  root   :to      => 'homes#new'
  get    'signup' => 'users#new'
  get    'login'  => 'sessions#new'
  post   'login'  => 'sessions#create'
  delete 'logout' => 'sessions#destroy'
  resources :users              # RESTful URLに応答する　らしい!!! (便利ーー)
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  get    'login-status' => 'sessions_make#new'
  post   'login-status' => 'sessions_make#create'
end
