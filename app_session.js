// express에 session 기능 추가하기 : npm install express-session --save
// https://github.com/expressjs/session
// cookie 와 session의 다른점은 쿠키는 해당 data를 클라이언트 컴퓨터에 저장하여 사용.
// 암호화 할 수 있지만 data자체를 클라이언트에 저장해서 취약함.
// session은 클라이언트 별로 connect.sid 값을 고유값으로 하여 실제 데이터는 db에 저장되어있음
// 이 고유값와 db가 가지고있는 고유값과 일치하면 해당 data를 db에서 가져옴.
// data를 클라이언트가 아닌 db가 가지고 있기 때문에 보안이 뛰어나다.
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser'); // for app.post
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'DSFJI#@!$LSDF&%#$', // session id 값 쿠키 랜덤값이랑 같게 넣어도됌.
    resave: false, 
    saveUninitialized: true
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
        res.redirect('/welcome');
    }else{
        res.send('Who are you? <a href="/auth/login">login</a>');
    }
    //res.send(uname);
});

app.get('/auth/logout', function(req, res){
    delete req.session.displayName;
    res.redirect('/welcome');
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
