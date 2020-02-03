const app = require('express')();

//cookieをよば出すために
const cookieParser = require('cookie-parser')
app.use(cookieParser())

//socket.ioを用いるために
const http = require('http').Server(app);
const io = require('socket.io')(http);

var path = require('path');
//下の3行はexpressでpostされたデータを扱いたいから
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var fs = require('fs');// 使わなくね?(HTTPサーバのポート指定をしたら)

var Client = require('ssh2').Client;

var request = require('request');//curlコマンドを使えるようにするように

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

  // postの値をcookieに保存する
  response.cookie("username", reqest.body.username);
  //postされた値で，centosにユーザ登録をする
  SSH_registration(reqest.body.username);

  //SSH_registractionのサーバ側の処理が終わったのを通知 [同期的に処理するために]
  io.on('connection', function(socket){
    //メッセージを受けとる準備
    console.log("----------------メッセージを受けとる準備をしている----------------")

    //メッセージを受け取った時の処理
    socket.on('message', function(data){
      //同期処理をしたい
      async function douki_prosess(){
        //代入したら,同期的に処理をしているらしいから，代入している
        const get = await get_RsaKey(reqest.body.username,'/home/ie-user/WEB-Service/put__sshlogin-for_browser__webservice-password_login/node_js/temporary_key/' + reqest.body.username + '_rsa');
        const emit = await socket.emit('confirm communicate',{result: true});
      }
      douki_prosess();


      // gakka2 -> gakka1 に秘密鍵がダウンロードされていたら, リダイレクトする
      //再帰関数
      function saiki_redirect(){
        setTimeout(() => {
          console.log("再帰ウェー")
          if(fs.existsSync('/home/ie-user/WEB-Service/put__sshlogin-for_browser__webservice-password_login/node_js/temporary_key/' + reqest.body.username + '_rsa') == true){
            response.redirect('/cookie');
          }else{
            saiki_redirect()
          }
        },2000);
      }
      saiki_redirect();
    })

  });

});
//cookieを反映させるために
app.get('/cookie',function(req,res){
  res.redirect('/download');
});

//ダウンロードするパス
app.get('/download',function (req,res){
  //io.on('connection', function(socket){
    console.log("------------------------ブラウザに秘密鍵をダウンロード------------------------");
    console.log('--------------------------------------------' + req.cookies.username + '_rsa')
    const praivate_file = '/home/ie-user/WEB-Service/put__sshlogin-for_browser__webservice-password_login/node_js/temporary_key/' + req.cookies.username + '_rsa'
    

    res.cookie('redirect', true);
    //res.download(praivate_file);////////////////////////////////////////////////////////////////////////////////////////

    //res.set({
    //  'Content-Type': 'text/plain',
    //  'Location': 'http://10.0.2.42:3000/login-status'
    //});

    //res.writeHead(302,  {Location: "http://teamtreehouse.com"})


    //rails側に,登録す
    const promise = POST_method(req);
    promise.then(function(){
      console.log("postは成功したはず")

      //res.redirect(302,'http://10.0.2.42:3000/login-status')///////////////////////////////////////////////////////////////////////////////////////////////////////
      res.download(praivate_file);

      ////res.download(praivate_file);
      //res.end(praivate_file);

    //　認証ページへリダイレクトするために (res. は一回しか使えない!) websocketを用いる
    //io.on('connection', function(socket){
    //  //クライアント(javascrpt)にデートォ送信
    //  socket.emit('redirect call',{redirect_call:true})
    //  
    //})

    }).catch(function(error){
      console.log("----------------postは失敗したっぽい--------------------")
      console.log(error)
    });
  //})
});

//railsの認証ページへのリダイレクト用のpath
//app.get('redirect_rails',function (req,res){
//  console.log("-------------------------認証ページへリダイレクトする--------------------------");
//  res.redirect(302,'http://10.0.2.42:3000/login-status')
//});

http.listen(81, function () {//socket.ioを用いるために,「app」を「http」に変更
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

        // 公開鍵を作成する(gakka2サーバにシェルスクリプトを用意)
        stream.write('sh /root/ShellScript/make_sshkey.sh ' + username +'\n');


        stream.end('exit\n');//connectionを切る
      });
    }).connect({
      host: '10.0.2.53',
      port: 22,
      username: 'root',
      privateKey: require('fs').readFileSync('/root/.ssh/ToGakka2/id_rsa')
    });  
}

//秘密鍵を取得するための関数(ssh2モジュール)
async function get_RsaKey(username,savepath){
  var conn = new Client();
  conn.on('ready', function() {
    console.log('Client :: ready');
    conn.sftp(function(err, sftp) {
      if (err) throw err;
      //リモート(gakka2)のファイルをダウンロートする
      console.log('----------------------gakka2からgakka1にダウンロードするよ----------------------------');
      sftp.fastGet('/home/'+ username +'/.ssh/id_rsa',savepath,function(err){
        if (err) throw err;
        conn.end();
      });
    });
  }).connect({
    host: '10.0.2.53',
    port: 22,
    username: 'root',
    privateKey: require('fs').readFileSync('/root/.ssh/ToGakka2/id_rsa')
  });
}

//POSTするための関数(requestモジュール)
///rails側で，ユーザを作成してもらう
function POST_method(req){
  //デバッグ
  console.log("----------------------------postする値は------------------------------");
  console.log(req.cookies.username)
  return new Promise(function(resolve, reject){//通信するには,非同期処理を書かないといけないらしい
    var options = {
      url: 'http://localhost:3000/users',
      method: 'POST',
      form:{"name":req.cookies.username}
    }
    request(options, function (error, response, body) {
      if(!error && 200<=response.statusCode<300){
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