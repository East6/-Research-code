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
  fs.readFile(__dirname + '/register.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
  if(req.method === 'POST') {//POSTメソッドがきた時に実行される
    console.log("post情報が送られてきたよ");

    //-------------------------------------[このサイトから参考(理解していない..)](https://algorithm.joho.info/programming/javascript/node-js-post/)
    var body = '';
    // data受信イベントの発生時に断片データ(chunk)を取得
    // body 変数に連結
    req.on('data', function(chunk) {
        body += chunk;
    });
    // 受信完了(end)イベント発生時
    req.on('end', function() {
      console.log(body);
      res.end();
    });
    //---------------------------------------

  }
}

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
        //sshで命令する方法
        //stream.write(`コマンド\n`)
        stream.write('whoami\n')
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

SSH_Sertification();