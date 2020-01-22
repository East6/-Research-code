var express = require('express');
var app = express();
var path = require('path');
//下の3行はexpressでpostされたデータを扱いたいから
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//var io = require('socket.io')(app);
var fs = require('fs');// 使わなくね?(HTTPサーバのポート指定をしたら)

var Client = require('ssh2').Client;

//エラーで,サーバが落ちないようにする
process.on('uncaughtException', function(err) {
  console.log("以下のエラーが生じました(ここでは,エラーでサーバが落ちないようにしている)")
  console.log(err);
});


//expressを用いて，get,postメソッドをさばく
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/register.html'));
});
app.post('/', function (reqest, response) {
    console.log(reqest.body);
    console.log(reqest.body.username);
    //postされた値で，centosにユーザ登録をする
    SSH_registration(reqest.body.username);
});
app.listen(80, function () {
});

//ssh登録をするための関数(ssh2モジュール)
function SSH_registration(username){
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
        //sshで命令する方法
        //stream.write(`コマンド\n`)
        stream.write('whoami\n')
        //stream.write('useradd tasikame2\n');
        stream.write('useradd ' + username + '\n');
        stream.end('exit\n');//connectionを切る
      });
    }).connect({
      host: '10.0.2.53',
      port: 22,
      username: 'root',
      //privateKey: require('fs').readFileSync('~/.ssh/ToGakka2/id_rsa')
      privateKey: require('fs').readFileSync('/Users/yonaminehigashi/.ssh/ToGakka2/id_rsa')
    });  
}
