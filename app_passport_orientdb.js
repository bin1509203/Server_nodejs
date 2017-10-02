// localhost:2480 => schema => 'user' class 생성 
// => new property : authId(mandatory+not null), username, password, salt, displayName(mandatory+not null) : 다 string type
// => new index : authId 를 UNIQUE 한 값으로 설정 : INDEXING 되어 빠르게 검색 & id가 중복 허용x 효과

var express = require('express');
var session = require('express-session');
var OrientoStore = require('connect-oriento')(session); // session을 db로 저장하기 위한 모듈 load
// 이 모듈은 독립적으로 동작하지 못하고, express-session 과 함께 동작시켜야 함. 따라서 인자로 session 전달
var bodyParser = require('body-parser'); // for app.post
var bkfd2Password = require("pbkdf2-password"); // npm install --save pbkdf2-password
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy; // local(단순히 id+pw) 인증시스템 위한 모듈
var FacebookStrategy = require('passport-facebook').Strategy; // 타사 인증시스템 위한 모듈
var hasher = bkfd2Password();
var OrientDB = require('orientjs');
// orientdb 를 제어 하기 위한 require 과 server 객체
var server = OrientDB({
    host: 'localhost', // 우리가 실행할 이 코드가 동작하는 nodejs와 orientdb가 같은 컴퓨터에 있으면 "localhost", 다르면 해당 "domain"
    port: 2424, // orientdb가 쓰는 port 번호. 일반적으로 2424임.
    username: 'root',
    password : '****' // source코드에 비밀번호를 넣는것은 매우 안좋다.
});
var db = server.use('o2');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'DSFJI#@!$LSDF&%#$', // session id 값 쿠키 랜덤값이랑 같게 넣어도됌.
    resave: false, 
    saveUninitialized: true,
    store: new OrientoStore({ // session 을 orient db로 저장하기 위한 설정. db에 'Session' 이라는 class 생성됨
        server: 'host=localhost&port=2424&username=root&password=****&db=o2'
    })
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
    var sql = 'SELECT FROM user WHERE authId=:authId';
    db.query(sql, {params:{authId:id}}).then(function(results){
        if(results.length === 0){
            done('There is no user.');
        }else{
            done(null, results[0]);
        }
    })
    // for(var i=0; i<users.length; i++){
    //     var user = users[i];
    //     if(user.authId === id){
    //         return done(null, user);
    //     }
    // }
    // done('There is no user');
});

passport.use(new LocalStrategy(
    function(username, password, done){ // 첫번째 인자와 두번째 인자로 기존 사용자가 맞는지 확인하는 과정나옴.
        var uname = username;
        var pwd = password; // 사용자가 입력한 비밀번호
        var sql = 'SELECT * FROM user WHERE authId=:authId';
        db.query(sql, {params:{authId:'local:'+uname}}).then(function(results){
            if(results.length === 0){ // results의 결과가 없다면, 즉 그런 사용자가 없다면
                return done(null, false);
            }
            var user = results[0];
            return hasher({password:pwd, salt:user.salt}, function(err, pass ,salt, hash){// pbkdf2 암호화 기법 이용
                if(hash === user.password){ // 로그인 위해 입력한 암호를 hash한 값과 db에 저장된 hash된 암호가 같니?
                    console.log('LocalStrategy', user);
                    done(null, user); // 얘 실행되면 serializeUser의 callback 함수가 실행되는것이 약속되어있다.
                }else{ // id는 맞는데 pw(해쉬)가 틀린경우
                    done(null, false);
                }
            });
            console.log(results);
        })
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
        var sql = 'SELECT FROM user WHERE authId=:authId';
        db.query(sql, {params:{authId:authId}}).then(function(results){
            if(results.length === 0){ // 페북 로그인이 처음이라면
                var newuser = {
                    'authId':authId, // 'authId' 나 authId 나 둘다 상관은 없음.
                    'displayName':profile.displayName,
                    'email':profile.emails[0].value
                };
                var sql = 'INSERT INTO user (authId, displayName, email) VALUES(:authId, :displayName, :email)';
                db.query(sql, {params:newuser}).then(function(){
                    done(null, newuser);
                }, function(error){
                    console.log(error);
                    done('Error');
                });
            }else{ // 존재하는 페북 로그인 사용자라면
                return done(null, results[0]);
            }
        });
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
        var sql = 'INSERT INTO user (authId, username, password, salt, displayName) VALUES(:authId, :username, :password, :salt, :displayName)';
        db.query(sql, { // class 'user' 으로 INSERT
            params:user
        }).then(function(results){ // then 첫번째 인자 = 성공, 두번째 인자 = 실패
                req.login(user, function(err){ // 가입 후 즉시 로그인
                    req.session.save(function(){
                        res.redirect('/welcome');
                    });
                });
        }, function(error){
            console.log(error);
            res.status(500);
        });
        // users.push(user); db insert로 대체
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
