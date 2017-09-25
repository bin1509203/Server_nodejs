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
    res.render('new');
});

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
        res.send('Success!');
    });
});
 
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
