var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.locals.pretty = true;
app.set('views', './views_orientdb');
app.set('view engine', 'jade');
app.listen(3000, function(req,res){
    console.log('Connected, 3000 port!');
});

/////////// db와 연동
var OrientDB = require('orientjs');

var server = OrientDB({
    host: 'localhost', // 우리가 실행할 이 코드가 동작하는 nodejs와 orientdb가 같은 컴퓨터에 있으면 "localhost", 다르면 해당 "domain"
    port: 2424, // orientdb가 쓰는 port 번호. 일반적으로 2424임.
    username: 'root',
    password : '*************' // source코드에 비밀번호를 넣는것은 매우 안좋다.
});
var db = server.use('o2');

////////////   글추가

app.get('/topic/add', function(req,res){
    var sql = 'SELECT FROM topic';
    db.query(sql).then(function(topics){
        res.render('add', {topics:topics});
    });
    /*
    fs.readdir('data', function(err, files){
        if(err){
            console.log(err)
            res.status(500).send('Internal Server Error');
        }
        res.render('new', {topics:files});
    });
    */
}); 
app.post('/topic/add', function(req,res){
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;
    var sql = 'INSERT INTO topic (title, description, author) VALUES(:title, :desc, :author)';
    db.query(sql, {
        params:{
            title: title,
            desc: description,
            author: author
        }
    }).then(function(results){
        res.redirect('/topic/'+encodeURIComponent(results[0]['@rid']));
    })
    /*
    fs.writeFile('data/'+title, description, function(err){
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        res.redirect('/topic/'+title);
        // success 보여주는 것 보다는 작성한 페이지로 redirect시킴.
    });
    */
});

////////// 글 편집

app.get('/topic/:id/edit', function(req,res){
    var sql = 'SELECT FROM topic';
    var id = req.params.id;
    db.query(sql).then(function(topics){
        var sql = 'SELECT FROM topic WHERE @rid=:rid';
        db.query(sql, {params:{rid:id}}).then(function(topic){
            res.render('edit', {topics:topics, topic:topic[0]});
        });
    });
}); 
app.post('/topic/:id/edit', function(req,res){
    var sql = 'UPDATE topic SET title=:t, description=:d, author=:a WHERE @rid=:rid';
    var id = req.params.id;
    var title = req.body.title;
    var desc = req.body.description;
    var author = req.body.author;
    db.query(sql, {
        params:{
            t:title,
            d:desc,
            a:author,
            rid:id
        }
    }).then(function(topics){ // update이므로 topics 에는 몇개가 update되었는지 저장되어있음
        res.redirect('/topic/'+encodeURIComponent(id)); // 위와 다르게 id로!
    });
}); 

/////////  글삭제

app.get('/topic/:id/delete', function(req,res){
    var sql = 'SELECT FROM topic';
    var id = req.params.id;
    db.query(sql).then(function(topics){
        var sql = 'SELECT FROM topic WHERE @rid=:rid';
        db.query(sql, {params:{rid:id}}).then(function(topic){
            res.render('delete', {topics:topics, topic:topic[0]});
        });
    });
}); 
app.post('/topic/:id/delete', function(req,res){
    var sql = 'DELETE FROM topic WHERE @rid=:rid';
    var id = req.params.id;
    db.query(sql, {
        params:{
            rid:id
        }
    }).then(function(topics){ 
        res.redirect('/topic/'); 
    });
}); 

//////// 글 목록 만들기 : 폴더 내에 저장되어 있는 파일을 불러옴
// topic/xxxx 형태는 모두 topic/:id 에 걸리므로 아래 코드는 가장 
// 하단부에 위치하여야 한다. 그렇지 않으면 topic/add 이런것도 다 
// 아래코드로 실행되버림.

app.get(['/topic', '/topic/:id'], function(req,res){
    var sql = 'SELECT From topic';
    db.query(sql).then(function(topics){
       
        var id = req.params.id;
        if(id){
            var sql = 'SELECT FROM topic WHERE @rid=:rid';
            db.query(sql, {params:{rid:id}}).then(function(topic){
                res.render('view', {topics:topics, topic:topic[0]});
            });
        }else{
            res.render('view', {topics:topics});
        }
    });
    /*
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
    */
});
