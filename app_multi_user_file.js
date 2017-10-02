// 다중 사용자 + 회원가입 + security password [ md5 는 예전 암호화방식. 이젠 안씀. => sha256으로 대체]
var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session); // session을 파일로 저장하기 위한 모듈 load
// 이 모듈은 독립적으로 동작하지 못하고, express-session 과 함께 동작시켜야 함. 따라서 인자로 session 전달
var bodyParser = require('body-parser'); // for app.post
//var md5 = require('md5'); // 과거의 암호화[단방향 해쉬] 작업을 위한 모듈 : npm install md5 --save => 이제 안씀
var sha256 = require('sha256');// 현재의 암호화[단방향 해쉬] 작업을 위한 모듈 : npm install sha256 --save
var bkfd2Password = require("pbkdf2-password"); // npm install --save pbkdf2-password
var hasher = bkfd2Password();
// => 단방향 해쉬를 여러번 반복하여 더 안정성을 높인 방법 :https://www.npmjs.com/package/pbkdf2-password
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'DSFJI#@!$LSDF&%#$', // session id 값 쿠키 랜덤값이랑 같게 넣어도됌.
    resave: false, 
    saveUninitialized: true,
    store: new FileStore() // session 을 파일로 저장하기 위한 설정
    // session 파일을 저장할 수 있는 directory인 "sessions"이 자동 생성됨.[ nodejs/sessions ]
}));

////////// count application 만들기
app.get('/count', function(req, res){
    if(req.session.count){
        req.session.count++;    
    }else{
        req.session.count = 1;
    }
    res.send('count : '+req.session.count);
});


////////// log-in 기능 구현하기 => 이 방법은 보안 매우 취약

app.get('/auth/login', function(req, res){
    var output =`
    <h1>Login</h1>    
    <form action="/auth/login" method="post">
            <p>
                <input type="text" name="username" placeholder="username">
            </p>
            <p>
                <input type="password" name="password" placeholder="password">
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
    `;
    res.send(output);
});

app.post('/auth/login', function(req, res){
    var uname = req.body.username;
    var pwd = req.body.password; // 사용자가 입력한 비밀번호
    for(var i=0; i<users.length; i++){ // user.length : user 수
        var user = users[i];
        if(uname == user.username){ // db에 저장되어있는 id 니? && hasher의 callback 끝나기전에 loop 다 도는거 방지위해 return
            return hasher({password:pwd, salt:user.salt}, function(err, pass ,salt, hash){// pbkdf2 암호화 기법 이용
                if(hash === user.password){ // 로그인 위해 입력한 암호를 hash한 값과 db에 저장된 hash된 암호가 같니?
                    req.session.displayName = user.displayName; // session을 굽는다.
                    req.session.save(function(){
                        res.redirect('/welcome');
                    });
                }else{
                    res.send('Who are you? <a href="/auth/login">login</a>');
                }
            });
        };
        /*
        //if(uname === user.username && pwd === user.password){ // 암호와 이전
        //if(uname === user.username && md5(pwd+user.salt) === user.password){ // 입력한 값을 암호화하여 이미 암호화된 db pw와 비교
        if(uname === user.username && sha256(pwd+user.salt) === user.password){ // 입력한 값을 암호화하여 이미 암호화된 db pw와 비교
            req.session.displayName = user.displayName; 
            return req.session.save(function(){ // session이 저장된 후 redirect 진행하여 안정성높임.
                res.redirect('/welcome'); // 이렇게 안하면 저장되는동안 for문이 다 돌아버려 맨 마지막 res.send 실행해버릴수있음
                // for 문 돌다가 사용자 찾으면 return 만나 loop 빠져나와 call back 함수 실행하고 redirect 진행.
            });
        }
        */
    }
    res.send('Who are you? <a href="/auth/login">login</a>');
});

////////////  logout 기능 구현

app.get('/auth/logout', function(req, res){
    delete req.session.displayName;
    req.session.save(function(){ // save 되기전에 redirect 가 먼저 실행되는것을 방지.
        res.redirect('/welcome');
    });
});

/////////////  회원가입 기능 구현

app.get('/auth/register', function(req, res){
    var output =`
    <h1>Register</h1>    
    <form action="/auth/register" method="post">
            <p>
                <input type="text" name="username" placeholder="username">
            </p>
            <p>
                <input type="password" name="password" placeholder="password">
            </p>
            <p>
            <input type="text" name="displayName" placeholder="displayName">
            </p>            
            <p>
                <input type="submit">
            </p>
        </form>
    `;
    res.send(output);    
});
//var egoingpw = md5('111'); // md5로 암호화. 실제론 이런식으로 해도 코드에 '111' 보여서 하면안댐. 따로 만들어야함
// egoingpw : 698d51a19d8a121ce581499d7b701668 이런식으로 암호화됨.
// 복호화 사이트에서 위 암호화된 값을 넣으면 '111' 다시 알아낼 수 있으므로 다른 방안이 필요. 우리만의 고유한 key 도입!!!
// var salt = '!@#JKLSD#$^JKVSD$!@^('; // 고유한 key

//var egoingpw = md5(originpw+salt); // 444ecaaa34817a03ff9d4d14a59e04c9
// 위의 문제로도 문제가 있다. 만약 한명의 pw가 털리면 이와 동일한 pw 를 가진 모든 사람이 털림. 
// 따라서 유저마다 다른 'salt'를 설정할 필요가 있다.

//  function enc(pwd, salt){return sha256(pwd+salt)}; 현재 주로 사용하는 암호화 기법
//  enc('111', '!@#JKLSD#$^JKVSD$!@^('); => 이 값을 db에 저장

//hasher({password: '111'}, function(err,pass,salt,hash){
//    console.log(err,pass,salt,hash);
//}); => bkfd2 로 hash값(암호화된값)과 'salt'값을 자동생성. 첫번째 인자의 객체 내에 'salt'값 지정하면 자동생성x.

var users = [ // 초기 사용자 한명 설정(안해도됨)
    {
        username:'egoing', // ID 
        //password: '444ecaaa34817a03ff9d4d14a59e04c9', // PW - md5
        //password :'2f5e7f2ec47f495467ec157fa030d6dea51a70861b7da4e57e83ce92f87be27f', // pw - sha256
        //salt: '!@#JKLSD#$^JKVSD$!@^(', // user 고유의 key값. 내가 설정.
        password: 'jY7g2qHMMTvvLWUl5DTWtnw52GJuf77iDoLgV0r+ft9kQO6N6aD7Fbc7RauH4HFG0PkK4DtKz+HoT+c1x0HEE4l9yI8v8X65Ok+lm5Pt2GG3HGgYcJ5Qkh9t9IKXSK2DUTyvh+OFxnwnPU25ov11oQMcubTF5ST3zd4ISzLsf+k=',
        salt: '+i6JxHCCZji3SF0Zh25JgC27ksaoLB0TSbFU6Aoj2WxJ9mqJ93ZMSyXMjBb4QmotCB5LJ9JTzOV/+A5Texic3A==',
        displayName:'Egoing' // 닉네임
    }/*,
    {
        username:'K8805', // ID 
        //password: 'cc4030315c350518e98faeea0a6f539d', // PW - md5
        password:'45175881f8e9574cc642b642e798a0eeeed2f3bdb0b1d09628b8fd036d735866', // PW - sha256
        salt: '@#$SDJF%&*JKL', // user 고유의 key값
        displayName:'K5' // 닉네임
    }*/
];
////// 회원 등록 구현 과정 + 암호화
app.post('/auth/register', function(req, res){
    hasher({password:req.body.password}, function(err, pass, salt, hash){
        var user = {
            username: req.body.username,
            password: hash,
            salt: salt,
            displayName: req.body.displayName
        };
        users.push(user); // 이미 만들어진 배열에 새로운 원소를 추가
        //res.send(users);
        req.session.displayName = req.body.displayName;
        req.session.save(function(){
            res.redirect('/welcome');
        });
    });
    
});

app.get('/welcome', function(req, res){
    if(req.session.displayName){ // login 성공한경우
        res.send(`
            <h1>Hello, ${req.session.displayName}</h1>
            <a href="/auth/logout">logout</a>
        `);
    }else{
        res.send(`
            <h1>Welcome</h1>
            <ul>
                <li><a href="/auth/login">login</a></li>
                <li><a href="/auth/register">Register</a></li>
            </ul>
        `);
    }
});

app.listen(3004, function(){
    console.log('Connected 3004 port!!!');
});
