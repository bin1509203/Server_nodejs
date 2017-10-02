// 페이스북이나 구글 등을 이용한 로그인 구현하기 => passportjs module 이용
// http://passportjs.org/docs/configure , 
// npm install --save passport passport-local => local : 타사(페북,구글) 인증이 아닌 아이디와 pw만을 이용한 인증
// npm install passport-facebook --save => 타사 인증

var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session); // session을 파일로 저장하기 위한 모듈 load
// 이 모듈은 독립적으로 동작하지 못하고, express-session 과 함께 동작시켜야 함. 따라서 인자로 session 전달
var bodyParser = require('body-parser'); // for app.post
var bkfd2Password = require("pbkdf2-password"); // npm install --save pbkdf2-password
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy; // local(단순히 id+pw) 인증시스템 위한 모듈
var FacebookStrategy = require('passport-facebook').Strategy; // 타사 인증시스템 위한 모듈
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

app.use(passport.initialize());
app.use(passport.session()); // 17번째 줄의 session 설정 코드가 나온 이후에 이 코드가 있어야함!

////////// count application 만들기
app.get('/count', function(req, res){
    if(req.session.count){
        req.session.count++;    
    }else{
        req.session.count = 1;
    }
    res.send('count : '+req.session.count);
});


////////// log-in 기능 구현하기 

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
    <a href="/auth/facebook">facebook</a>
    `;
    res.send(output);
});

passport.serializeUser(function(user, done) { 
// LocalStrategy 설정에서 done의 두번째 인자로 false가 아닌 경우 그 인자가 이 callback함수의 첫번째 인자로전달   
    console.log('serializeUser', user);
    done(null, user.authId); // user.authId이 session에 저장됨. 여기서 두번째 인자는 식별자로 유일해야함.
});
passport.deserializeUser(function(id, done) { 
// 일단 한번 login 되어있으면 그 이후로는 deserializerUser 콜백함수 실행됨. user.username이 첫번째 인자로 들어옴.
// 로그인 상태에서 새로고침하면 계속 deserializeUser 호출됨. 이때 'id'인자는 위에서 저장된 session 내의 authId를 받아옴.
    console.log('deserializeUser', id);
    for(var i=0; i<users.length; i++){
        var user = users[i];
        if(user.authId === id){
            return done(null, user);
        }
    }
    done('There is no user');
});

passport.use(new LocalStrategy(
    function(username, password, done){ // 첫번째 인자와 두번째 인자로 기존 사용자가 맞는지 확인하는 과정나옴.
        var uname = username;
        var pwd = password; // 사용자가 입력한 비밀번호
        for(var i=0; i<users.length; i++){ // user.length : user 수
            var user = users[i];
            if(uname === user.username){ // db에 저장되어있는 id 니? && hasher의 callback 끝나기전에 loop 다 도는거 방지위해 return
                return hasher({password:pwd, salt:user.salt}, function(err, pass ,salt, hash){// pbkdf2 암호화 기법 이용
                    if(hash === user.password){ // 로그인 위해 입력한 암호를 hash한 값과 db에 저장된 hash된 암호가 같니?
                        console.log('LocalStrategy', user);
                        done(null, user); // 얘 실행되면 serializeUser의 callback 함수가 실행되는것이 약속되어있다.
                        // 이 두번째 인자 'user' 이 serializeUser의 콜백함수의 첫번째 인자로 들어간다.
                        // req.session.displayName = user.displayName; // session을 굽는다.
                        // req.session.save(function(){
                        //     res.redirect('/welcome');
                        // });
                    }else{
                        done(null, false);
                        // res.send('Who are you? <a href="/auth/login">login</a>');
                    }
                });
            };
        }
        done(null, flase);
        // res.send('Who are you? <a href="/auth/login">login</a>');
    }
));// local에 대한 정의

passport.use(new FacebookStrategy(
    {
        clientID: '2013625822254589', // facebook app의 'APP ID' https://developers.facebook.com/apps/2013625822254589/dashboard/
        clientSecret: 'fa83d2b789b477c4aebacdc6a04ec7e5', // facebook_app_secret code : 절때 공개하면 안된다.
        callbackURL: "/auth/facebook/callback",
        profileFields: ['id', 'email', 'gender', 'link', 'locale',
        'name', 'timezone', 'updated_time', 'verified', 'displayName']// 사용자 허가받아 추가로 가져올 정보 기술
    },
    function(accessToken, refreshToken, profile, done) { // profile과 done 이 중요!!
        console.log(profile); // profile이 어떤 정보를 가지고 있는지 확인!
        var authId = 'facebook:'+profile.id; // facebook을 통해 가입한 사용자 확인을 위한 id값 부여
        for(var i=0; i<users.length; i++){
            var user = users[i];
            if(user.authId === authId){ // authId를 가지고 있다면= 기존사용자라면
                return done(null, user); // 실행 후 serializationUser 의 콜백함수 실행.
            }
        }
        var newuser = {
            'authId':authId, // 'authId' 나 authId 나 둘다 상관은 없음.
            'displayName':profile.displayName,
            'email':profile.emails[0].value
        };
        users.push(newuser);
        done(null, newuser);// 실행 후 serializationUser 의 콜백함수 실행.
    }
));// facebook에 대한 정의

app.post('/auth/login', 
    passport.authenticate('local', // 첫번째 인자 : 'strategy'[페북인증처럼 타사인증인지 id.pw인증(loacal)인지 ]
        { 
            successRedirect: '/welcome', // login 성공한 경우 이동할 page
            failureRedirect: '/auth/login', // login 실패한 경우 이동할 page
            failureFlash: false  // done의 세번째 인자로 메세지 전달과 관련. 
        }
    )
);

app.get('/auth/facebook',
    passport.authenticate('facebook', // 두번째 인자는 사용자의 허가를 받아야 사용할 수 있는 옵션 : https://developers.facebook.com/docs/facebook-login/permissions
        {
            scope:'email'
        }
    )
);
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', 
        { 
            successRedirect: '/welcome',
            failureRedirect: '/auth/login' 
        }
    )
);

////////////  logout 기능 구현

app.get('/auth/logout', function(req, res){
    req.logout();
    // delete req.session.displayName;
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

//hasher({password: '111'}, function(err,pass,salt,hash){
//    console.log(err,pass,salt,hash);
//}); => bkfd2 로 hash값(암호화된값)과 'salt'값을 자동생성. 첫번째 인자의 객체 내에 'salt'값 지정하면 자동생성x.

var users = [ // 초기 사용자 한명 설정(안해도됨)
    {
        authId: 'local:egoing',
        username:'egoing', // ID 
        password: 'jY7g2qHMMTvvLWUl5DTWtnw52GJuf77iDoLgV0r+ft9kQO6N6aD7Fbc7RauH4HFG0PkK4DtKz+HoT+c1x0HEE4l9yI8v8X65Ok+lm5Pt2GG3HGgYcJ5Qkh9t9IKXSK2DUTyvh+OFxnwnPU25ov11oQMcubTF5ST3zd4ISzLsf+k=',
        salt: '+i6JxHCCZji3SF0Zh25JgC27ksaoLB0TSbFU6Aoj2WxJ9mqJ93ZMSyXMjBb4QmotCB5LJ9JTzOV/+A5Texic3A==',
        displayName:'Egoing' // 닉네임
    }
];
////// 회원 등록 구현 과정 + 암호화
app.post('/auth/register', function(req, res){
    hasher({password:req.body.password}, function(err, pass, salt, hash){
        var user = {
            authId:'local:'+req.body.username,
            username: req.body.username,
            password: hash,
            salt: salt,
            displayName: req.body.displayName
        };
        users.push(user); // 이미 만들어진 배열에 새로운 원소를 추가
        //res.send(users);
        req.login(user, function(err){ // 가입 후 즉시 로그인
            req.session.save(function(){
                res.redirect('/welcome');
            });
        });
        // req.session.displayName = req.body.displayName;
    });   
});

app.get('/welcome', function(req, res){
    // if(req.session.displayName){ 이전엔 session을 직접 다뤘는데 passport 를 이용하여 user객체를 이용
    if(req.user && req.user.displayName){
        res.send(`
            <h1>Hello, ${req.user.displayName}</h1>
            <a href="/auth/logout">logout</a>
        `);
        // res.send(`
        //     <h1>Hello, ${req.session.displayName}</h1>
        //     <a href="/auth/logout">logout</a>
        // `);
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
