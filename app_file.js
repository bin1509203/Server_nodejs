var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.locals.pretty = true;
app.set('views', './views_file');
app.set('view engine', 'jade');
app.listen(3000, function(req,res){
    console.log('Connected, 3000 port!');
});

app.get('/topic/new', function(req,res){
    fs.readdir('data', function(err, files){
        if(err){
            console.log(err)
            res.status(500).send('Internal Server Error');
        }
        res.render('new', {topics:files});
    });
}); // new page를 main처럼 바꾸기 위해 topics 변수가 사용되어 내용 추가

/////// 본문저장 : 사용자가 입력한 data를 폴더내 파일로 만들어 저장

var fs = require('fs');
app.post('/topic', function(req,res){
    var title = req.body.title;
    var description = req.body.description;
    fs.writeFile('data/'+title, description, function(err){
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        res.redirect('/topic/'+title);
        // success 보여주는 것 보다는 작성한 페이지로 redirect시킴.
    });
});

/* 
//////// 글 목록 만들기 : 폴더 내에 저장되어 있는 파일을 불러옴
app.get('/topic', function(req,res){
    fs.readdir('data', function(err, files){
        if(err){// "data" directory(폴더)에 있는 contents를 읽어와 files 에 배열로 저장
            console.log(err)
            res.status(500).send('Internal Server Error');
        }
        res.render('view', {topics:files});
        // 첫번째 인자: 템플릿 파일 이름. 
        // 두번째 인자 : 템플릿 내에서 사용할 변수들
        /// 읽어온 파일목록이 저장된 배열 "files"를 
        /// topics라는 변수로 view.jade 내에서 가져다씀.
        // view 파일 내에 다른 변수가 있더라도 여기서 선언 안되면 자동으로 무시됨.
        // 따라서 h2= title 와 = description 부분이 안나오는것.
    }); 
});

///////// 본문읽기 : 만든 목록을 이용하여 파일 불러오기
app.get('/topic/:id', function(req,res){ // 하이퍼링크 클릭하여 사용자가 /topic/...에 접속한 경우
    var id = req.params.id; // 해당 id값을 읽어들여 "id"라는 변수에 저장
    // 해당 내용 뿐 아니라 목록과 내용을 보여주고싶다.
    fs.readdir('data', function(err, files){
        if(err){// "data" directory(폴더)에 있는 contents를 읽어와 files 에 배열로 저장
            console.log(err)
            res.status(500).send('Internal Server Error');
        }
        fs.readFile('data/'+id, 'utf-8', function(err,data){ 
            if(err){// data/id변수값 에 해당하는 파일 읽어들여 data 라는 인자로 받아들임.
                console.log(err);
                res.status(500).send('Internal Server Error');
            }
            res.render('view', {topics:files, title:id, description:data});
            // fs.readdir 없이 바로 readfile하면 "file" directory에 접근할 수 없어 에러발생
            // files는 파일목록 가진배열, id는 현재 파일명, data는 해당 파일 내용
        });
    });
});
*/ 

// 위 코드를 하나로 합쳐서 중복을 줄인 코드는 다음과 같다.
// [ ] 를 이용하여 여러 path에 대해 한번에 처리 가능.
app.get(['/topic', '/topic/:id'], function(req,res){
    fs.readdir('data', function(err, files){
        if(err){// "data" directory(폴더)에 있는 contents를 읽어와 files 에 배열로 저장
            console.log(err)
            res.status(500).send('Internal Server Error');
        }
        var id = req.params.id;
        if(id){ // id 값이 존재하면 즉 /topic/:id 경로인 경우
            fs.readFile('data/'+id, 'utf-8', function(err,data){ 
                if(err){// data/id변수값 에 해당하는 파일 읽어들여 data 라는 인자로 받아들임.
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                }
                res.render('view', {topics:files, title:id, description:data});
            })
        } else{ // id 값이 없을 때 즉 /topic 경로인 경우
            res.render('view', {topics:files, title:'Welcome', description:'Hello, JavaScript for server'});
        }
    });
});

//////     파일업로드
// npm install --save multer
var multer = require('multer'); // 파일 업로드 module인 'multer' loading
//var upload = multer({ dest: 'uploads/' })  // uploads 폴더 만들어야함
// dest : 사용자가 업로드한 파일이 어디에 최종적으로 저장될지를 지정. 

/// dest 대신에 더 자세한 컨트롤을 위해 storage  사용!!
var _storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
}); 
var upload = multer({ storage: _storage });
app.get('/upload', function(req,res){
    res.render('upload');
});
app.post('/upload', upload.single('userfile'), function(req,res){
    console.log(req.files);
    res.send('uploaded : '+req.file.filename);
    // req.file : 업로드한 파일. req.file.filename : 업로드한 파일명
    // file 객체의 다른 속성들은 https://github.com/expressjs/multer 보기!
});
// 사용자가 post방식으로 'userfile' 이라고 저장한 데이터를 사용하기 위하여 
// request 객체의 파일이라는 property를 암시적으로 추가하도록 하는 middle ware
// upload.jade 에서 input form의 name 을 'userfile' 로 지정해놔야 함!!!

//// 업로드한 파일을 직접 보여주기 위한 static 설정
//app.use('/user', express.static('uploads'));
// public 이라는 폴더 내 파일을 넣어두면 정적으로 접근할 수 있게 해줌
// localhost:3000/user/파일명  으로 접근가능하게해줌!!
