// session data를 메모리가 아닌 db에 저장하기.
// https://www.npmjs.com/package/connect-oriento
// npm install connect-oriento --save
var express = require('express');
var session = require('express-session');
OrientoStore = require('connect-oriento')(session); // session을 db로 저장하기 위한 모듈 load
// 이 모듈은 독립적으로 동작하지 못하고, express-session 과 함께 동작시켜야 함. 따라서 인자로 session 전달
var bodyParser = require('body-parser'); // for app.post
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'DSFJI#@!$LSDF&%#$', // session id 값 쿠키 랜덤값이랑 같게 넣어도됌.
    resave: false, 
    saveUninitialized: true,
    store: new OrientoStore({ // session 을 orient db로 저장하기 위한 설정. db에 'Session' 이라는 class 생성됨
        server: 'host=localhost&port=2424&username=root&password=hhelibebcno14&db=o2'
    })
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
    var user = {
        username:'egoing', // ID
        password: '111', // PW
        displayName:'Egoing' // 닉네임
    };
    var uname = req.body.username;
    var pwd = req.body.password;
    if(uname === user.username && pwd === user.password){
        req.session.displayName = user.displayName; // session 을 메모리에 저장 => 서버껐다키면 날아감.
        req.session.save(function(){
            res.redirect('/welcome'); // db에 session이 저장되기도 전에 redirect 일어나는 것을 방지위한 코드
        });
    }else{
        res.send('Who are you? <a href="/auth/login">login</a>');
    }
    //res.send(uname);
});

app.get('/auth/logout', function(req, res){
    delete req.session.displayName;
    req.session.save(function(){
        res.redirect('/welcome'); // db에 session이 저장되기도 전에 redirect 일어나는 것을 방지위한 코드
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
            <a href="/auth/login">login</a>
        `);
    }
});

app.listen(3004, function(){
    console.log('Connected 3004 port!!!');
});
