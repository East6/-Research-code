// gakak2のサーバ側の
//  /root/Node_js/notice_FinishSHELL.js
//  には以下のnode.js　スクリプトが記述されている
//-------------------------------------------------------------------

const io = require('socket.io-client');

// 処理が終わったことを通知したい(この通知をトリガーに同期的に処理させる)
const socket = io('http://10.0.2.42:80');
socket.emit('message',{ finish_process: true});

// トリガー通知ができたことを確認する 通知を受け取る
socket.on('confirm communicate', function(confirm_data){
    if (confirm_data['result'] == true){
      //ソケットを終了する
      socket.close();
    }
});