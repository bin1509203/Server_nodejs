// 다중 사용자 + 회원가입 
var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session); // session을 파일로 저장하기 위한 모듈 load
// 이 모듈은 독립적으로 동작하지 못하고, express-session 과 함께 동작시켜야 함. 따라서 인자로 session 전달
var bodyParser = require('body-parser'); // for app.post
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
    var pwd = req.body.password;
    for(var i=0; i<users.length; i++){ // user.length : user 수
        var user = users[i];
        if(uname === user.username && pwd === user.password){
            req.session.displayName = user.displayName; 
            return req.session.save(function(){ // session이 저장된 후 redirect 진행하여 안정성높임.
                res.redirect('/welcome'); 
                // for 문 돌다가 사용자 찾으면 return 만나 loop 빠져나와 call back 함수 실행하고 redirect 진행.
            });
        }
    }
    res.send('Who are you? <a href="/auth/login">login</a>');
});

////////////  logout 기능 구현

app.get('/auth/logout', function(req, res){
    delete req.session.displayName;
    res.redirect('/welcome');
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

var users = [ // 초기 사용자 한명 설정(안해도됨)
    {
        username:'egoing', // ID
        password: '111', // PW
        displayName:'Egoing' // 닉네임
    }
];

app.post('/auth/register', function(req, res){
    var user = {
        username: req.body.username,
        password: req.body.password,
        displayName: req.body.displayName
    };
    users.push(user); // 이미 만들어진 배열에 새로운 원소를 추가
    //res.send(users);
    req.session.displayName = req.body.displayName;
    req.session.save(function(){
        res.redirect('/welcome');
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
