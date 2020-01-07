var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');// 使わなくね?(HTTPサーバのポート指定をしたら)

var Client = require('ssh2').Client;


//エラーで,サーバが落ちないようにする
process.on('uncaughtException', function(err) {
  console.log("以下のエラーが生じました(ここでは,エラーでサーバが落ちないようにしている)")
  console.log(err);
});

//HTTPサーバを起動している
app.listen(80);// HTTP サーバのポートを指定する
function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}

// socket関数?が繋がった時に処理をする??
io.on('connection', function (socket) {
  // クライアントへデータ送信
  //socket.emit('news', { hello: 'world' });
  // クライアントから秘密鍵のデータを受信
  socket.on('SSH PrivateKey', function (data) {
    privatekey_data = data;
    console.log(privatekey_data);
    // ssh認証を行う
    try{
      SSH_Sertification();
      //認証が成功した時(エラーが出ない時)にここが実行される
      console.log("認証okです")
      ////socket.ioで成功したという信号を送る
    } catch(e){
      //認証エラーが出た時の処理
      console.log("おそらく認証のエラーが出ました。------------------")
      console.log(e)
      console.log("おそらく認証のエラーが出ました。------------------")
      //認証エラーしたときにここが実行される
      ////socket.ioで失敗したという信号を送る
      socket.emit('SSH Sertification status', { SSH_Sertification_status: false });
      console.log("socke.emitをしたよ")
    }
  });
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
      privateKey: privatekey_data['PrivateKey']
    });  
}
