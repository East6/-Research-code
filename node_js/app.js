var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');// 使わなくね?(HTTPサーバのポート指定をしたら)

var Client = require('ssh2').Client;

var request = require('request');//curlコマンドを使えるようにするように

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
    console.log("-----------------------------------ユーザ名を送ったけど,取れるかな-------------------")


    //エラーで,サーバが落ちないようにする
    //ssh2認証で失敗したときに,ここでエラーが出る --> 失敗したと,ユーザに通知する
    process.on('uncaughtException', function(err) {
      console.log(err);
      //　認証失敗したと,ユーザsocket通信を行う
      socket.emit('SSH Sertification status', { SSH_Sertification_status: false});
    });
    try{
      //ユーザが秘密鍵を選択したとき,ここの中が実行される

      // ssh認証を行う
      //ssh2接続を試みる  始まり-----------------------------
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

          //rails側のユーザ(今の所 higashi)に対して，login_session を1にするコードを記述した
          const promise = POST_method();
          promise.then(function(){
            console.log("postは成功したはず")
          }).catch(function(error){
            console.log("----------------postは失敗したっぽい--------------------")
            console.log(error)
          });
          //socket.ioで成功したという信号を送る(ユーザ名も)
          socket.emit('SSH Sertification status', { SSH_Sertification_status: true , name: privatekey_data['name']}); 

          stream.end('ls -l\nexit\n');
        });
      }).connect({
        host: '10.0.2.53',
        port: 22,
        username: privatekey_data['name'],
        privateKey: privatekey_data['PrivateKey']
      });  
      //ssh2接続を試みる  終わり-----------------------------

    } catch(e){
      //秘密鍵を指定していないときに,ここの中が実行される

      console.log("おそらく認証のエラーが出ました。------------------")
      console.log(e)
      console.log("おそらく認証のエラーが出ました。------------------")
      //認証エラーしたときにここが実行される(秘密鍵ファイルでないとき)
      ////socket.ioで失敗したという信号を送る
      socket.emit('SSH Sertification status', { SSH_Sertification_status: "no-privatekey"});
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
      username: privatekey_data['name'],
      privateKey: privatekey_data['PrivateKey']
    });  
}

//POSTするための関数(requestモジュール)
function POST_method(){
  return new Promise(function(resolve, reject){//通信するには,非同期処理を書かないといけないらしい
    var options = {
      url: 'http://localhost:3000/login',
      method: 'POST',
      form:{"name":privatekey_data['name']}
    }
    request(options, function (error, response, body) {
      if(!error && response.statusCode == 200){
        //var Response_Cookie  = response.headers['set-cookie'];
        //resolve(Response_Cookie);
        resolve()
      } else{
        reject(response.statusCode)
        //reject(response)
        //reject(error)
      }
    })
  });
}
