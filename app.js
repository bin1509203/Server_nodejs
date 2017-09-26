// nodejs 에 관한 개괄적인 내용.
// node app.js  라는 cmd 명령어로 서버 실행해야함. => 매번 수정할때마다 재 실행해야 불편.
// supervisor app.js 라는 명령을 사용하면 코드 수정할때마다 자동 재실행되어 편하다!!
// https://www.npmjs.com/package/supervisor   npm install supervisor -g 
var express = require('express'); // express import
// npm install express --save
var app = express(); // 애플리케이션 frame work인 express 를 사용하겠다고 알림.

var bodyParser = require('body-parser'); // POST 방식 사용위한 body-parser import

app.locals.pretty = true; // express 소스보기에서 code 보기 좋게 바꾸는 것.

app.set('view engine', 'jade'); // jade라는 template이라는 엔진과 express를 연결하는 코드.
app.set('views', './views');// template이 있는 위치를 express에게 알려주는 코드
// template 파일은 이제 다 views 라는 폴더에 넣어야함.
// 이 엔진이 편한것은 <html> ~ 과 같은 코드를 단순히 html 로 처리가능 & for문도 쓸수있음
// npm install jade --save

app.use(bodyParser.urlencoded({ extended: false }));
// 사용자가 POST 방식으로 data를 전송하면 bodyParser 를 반드시 먼저 통과시킨다 는 코드

////////// STATIC : 이 폴더 내의 파일 수정하고 리로딩하면 바로 바로 반영됨.
app.use(express.static('public')); // public 이라는 directory에 정적인 파일을 서비스!
// public 이라는 폴더 내에 있는 그림이나, html 파일 등을 넣어두면 정적으로 접근할 수 있게 해줌

///  어떤 주소로 사용자가 접근 했느냐에 따라 서로 다른 내용 출력
//1. 연습 http://localhost:3000/
app.get('/', function(req, res){ // '/' 사용자가 홈페이지(root)로 접속했으면 callback. localhost:3000
//인자는 req(요청 관련 객체 전달), res(요청한 정보에 대한 응답방법 관련 객체 전달) 로 약속되어 있다.
    res.send('Hello home page');
}); // 사용자가 web에 접속할때는 get 방식 또는 host 방식으로 접속한다. url 접속은 get 방식
// get 방식으로 접속한 사용자를 받기 위하여 get method를 사용.
// http://localhost:3000/login
app.get('/login', function(req,res){ // login 주소로 접속했으면 callback. localhost:3000/login
    res.send('<h1> Login please <h1>');
});
// get => 라우터. get은 라우팅 즉 길을 만드는 역할. 어떠한 요청이 들어왔을대 연결시켜주는 역할을 라우터가 함.
// 사용자[ 우리의 어플리케이션으로 접속하는 사람 ]

//2. public 폴더 안에 있는 사진을 불러올 수 있다. http://localhost:3000/route
app.get('/route', function(req,res){
    res.send('Hello Router, <img src="/Penguins.jpg">');
})

//3. template에 접근하는 사람들을 위한 라우터 설정 http://localhost:3000/template
app.get('/template', function(req,res){
    res.render('temp', {time:Date(), _title:'Jade'}); // render 라는 method 호출
    // views 폴더 내의 temp라는 template 파일을 찾아 웹페이지로 렌더링해서 전송. temp.jade
    // 두번째 인자로 객체 {} 를 부여. "time" 이라는 property 를 가지고있는. 이 property는
    // jade 내로 부여하는 변수가 됨.
}) // temp.jade 참고, 


/////////  Dynamic : 수정해도 리로드하면 반영X node를 껐다가 켜야 수정이 반영됨.
// http://localhost:3000/dynamic
app.get('/dynamic', function(req,res){ // `` 를 이용하여 여러 줄의 html 코드를 넣을 수 있음.
    var lis = '';
    for (var i=0; i<5; i++){ // html code에는 반복문이 없다. 따라서 다음과 같이 js로 변수 만들어야함.
        lis = lis + '<li>coding</li>'; // 문자열 내부에 $ 와 {} 를 이용하여 변수 추가할 수 있다.
    }
    var time = Date();
    var output = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <title>
    
            </title>
        </head>
        <body>
            Hello, Dynamic!
            <ul>
              ${lis}
            </ul>
            ${time}
        </body>
    </html>`
    res.send(output);
})


//////// Query 객체의 사용 : /name?"query_string"=value
app.get('/topic', function(req,res){ // id값으로 url 들어오는건 사용자의 '요청'이다. 즉 req 사용해야함!
    var topics = [ // topics 라는 배열에 3가지 원소가 담겨있군. topics[2] 이런식으로 원소접근.
        'Javascript is...',
        'Nodejs is...',
        'Express is...'
    ];
    var output=`
    <a href="/topic?id=0">JavaScript</a><br>
    <a href="/topic?id=1">Nodejs</a><br>
    <a href="/topic?id=2">Express</a><br><br>
    ${topics[req.query.id]}
    `// 3개의 html 문법을 이용한 하이퍼링크 집어 넣고, 마지막줄은 링크 눌러 "요청"된 id값에 해당하는
    // topics라는 배열의 원소를 보여줌. <br> 은 줄바꿈.
    res.send(output); // output 변수를 출력

    //res.send(req.query.id); // 사용자가 요청한 id 값을 웹에 send하여 보여줌. : http://localhost:3000/topic?id=12
    //res.send(req.query.name); // 사용자가 요청한 name 값을 send. http://localhost:3000/topic?name=JB
    //res.send(req.query.id+','+req.query.name); // id & name 두 가지를 모두 "요청"한 경우
    // => http://localhost:3000/topic?id=1&name=jb
})

//////// Semantic url : /topic?id=3 와 같은 지저분한 query string을 /topic/3 처럼 바꾸는 것
app.get('/topic_1/:id', function(req,res){ // /:id  어떤 id 값이 오더라도 catch 할 수 있도록 바꿈.
    var topics = [ 
    'Javascript is...',
    'Nodejs is...',
    'Express is...'
    ];
    var output=`
    <a href="/topic_1/0">JavaScript</a><br>
    <a href="/topic_1/1">Nodejs</a><br>
    <a href="/topic_1/2">Express</a><br><br>
    ${topics[req.params.id]}
    ` // url의 :id 를 parma 라는 객체를 이용하여 받아준다. 이때 :이름 <=> parma.이름  매칭시켜야함.
    res.send(output);
});
// http://localhost:3000/topic/200/newnew
app.get('/topic_2/:id/:mode', function(req,res){
    res.send(req.params.id+','+req.params.mode);
});


///////  GET : 사용자의 요청에 따라 서버에서 data 를 가져오는 것. 물론 query 방식으로 data 전송가능.
//             하지만 전송 내용이 url로 공개되기도 하고, url 최대 크기로 크기도 제한되어 안좋다.
//       POST : 사용자의 입력으로 data를 서버로 전송하는 것. url에 공개되지않고 큰 용량으로 전송 가능.
// 1. GET 방식 : url의 query 를 통한 전송방식임.
app.get('/form', function(req,res){ // http://localhost:3000/form  으로 접속하면
    res.render('form'); // form.jade 라는 파일 내용을 렌더링하여 웹에 표현
});
app.get('/form_receiver', function(req,res){
    var title = req.query.title;
    var description = req.query.description;
    res.send(title+','+description);
});// form tag로 입력받은 값으로 url을 query 형식으로 생성해주고, 
// 우리는 이 생성된 url의 query 값을 "req"로 따와 변수에 저장한뒤, sending 함.

// 2. POST 방식 : 입력 받은 data와 상관없이 url이 변하지 않음.
app.post('/form_receiver', function(req,res){ // 위에도 /form_receiver 있음. form tag의 method에 따라 선택됨.
    var title = req.body.title;
    var description = req.body.description;
    res.send(title+','+description);
    // 처음엔 error 난다. By default, it is undefined, and is populated 
    // when you use body-parsing middleware such as body-parser and multer.
    // 따라서 우리는 body-parser 을 따로 설치해줘야 한다. http://expressjs.com/en/4x/api.html#req.body
    // npm install body-parser --save
    // 원래 req 매개변수가 가지고 있지 않았던 body라는 객체를 body-parser 가 추가해준 것. 
});

app.listen(3000, function(){
    console.log('Connected 3000 port!');
});
