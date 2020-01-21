//var app = require('http').createServer(handler)
//var io = require('socket.io')(app);
var fs = require('fs');// 使わなくね?(HTTPサーバのポート指定をしたら)

var Client = require('ssh2').Client;

//エラーで,サーバが落ちないようにする
process.on('uncaughtException', function(err) {
  console.log("以下のエラーが生じました(ここでは,エラーでサーバが落ちないようにしている)")
  console.log(err);
});

//ssh認証をするための関数(ssh2モジュール)
function SSH_Sertification(){
    var conn = new Client();
    conn.on('ready', function() {
      console.log('Client :: ready');
      conn.shell(function(err, stream) {
        if (err) throw err;
        stream.on('close', function() {
          console.log('Stream :: close');
          conn.end();
        }).on('data', function(data) {
          console.log('OUTPUT: ' + data);
        });
        //stream.end('ls -l\nexit\n');
      });
    }).connect({
      host: '10.0.2.53',
      port: 22,
      username: 'ie-user',
      //privateKey: require('fs').readFileSync('~/.ssh/ToGakka2/id_rsa')
      privateKey: require('fs').readFileSync('/Users/yonaminehigashi/.ssh/ToGakka2/id_rsa')
    });  
}

SSH_Sertification();