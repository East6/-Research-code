# gakak2のサーバ側の
#  /root/ShellScript/make_sshkey.sh 
#  には以下のシェルスクリプトが記述されている
#-------------------------------------------------------------------

#!/bin/bash

#第1引数(ユーザ名)のホームディレクトリに .ssh フォルダを作成する
mkdir /home/${1}/.ssh

#sshkeyを作成する
ssh-keygen -P "" << EOF
/home/${1}/.ssh/id_rsa
EOF

#公開鍵のサーバ側の設定
cat /home/${1}/.ssh/id_rsa.pub >> /home/${1}/.ssh/authorized_keys
chmod 700 /home/${1}/.ssh
chmod 600 /home/${1}/.ssh/authorized_keys

#rootで実行しているので，ファイルの権限をユーザに変更
chown ${1}:${1} /home/${1}/.ssh
chown ${1}:${1} /home/${1}/.ssh/authorized_keys

#処理が終わったことを，通知(同期的に処理させるために)
node /root/Node_js/notice_FinishSHELL.js

exit 0
