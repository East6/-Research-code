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

  //SSH_registractionのサーバ側の処理が終わったのを通知
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
          //const cookie = await response.cookie("username",reqest.body.username);
          const redirect = await response.redirect('/cookie');
        }
        douki_prosess();
    })

  });

});
//cookieを反映させるために
app.get('/cookie',function(res,req){
  req.redirect('/download');
});

//ダウンロードするパス
app.get('/download',function (req,res){

  console.log("------------------------ブラウザに秘密鍵をダウンロード------------------------");
  console.log('--------------------------------------------' + req.cookies.username + '_rsa')
  const public_file = '/home/ie-user/WEB-Service/put__sshlogin-for_browser__webservice-password_login/node_js/temporary_key/' + req.cookies.username + '_rsa'
  res.download(public_file);
});

http.listen(80, function () {//socket.ioを用いるために,「app」を「http」に変更
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