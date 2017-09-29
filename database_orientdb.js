// orientdb 를 nodejs 로 제어할 수 있는 패키지 설치 : npm install orientjs --save
///////   db 접속 설정
var OrientDB = require('orientjs');

var server = OrientDB({
    host: 'localhost', // 우리가 실행할 이 코드가 동작하는 nodejs와 orientdb가 같은 컴퓨터에 있으면 "localhost", 다르면 해당 "domain"
    port: 2424, // orientdb가 쓰는 port 번호. 일반적으로 2424임.
    username: 'root',
    password : 'hhelibebcno14'
});
// 위에서 설정한 server의 정보를 가진 서버에 있는 db 중에 'o2' 라는 이름의 db 사용하겠다.
var db = server.use('o2'); 
// orientdb 관리자사이트에서 data의 @rid 를 확인하여 입력. EX get('#18:0')
/*
var rec = db.record.get('#18:0') // 해당 @rid 의 record를 가져온다.
.then(function(record){
      console.log('Loaded Record:', record);
});
*/
/* db 에서 가장 많이 사용하는 4가지 keyword
 * CREATE
 * READ
 * UPDATE
 * DELETE 
 */

// 1. CREATE - 해당 class 전체를 배열형식으로 가져오기
/*
var sql = 'SELECT FROM topic';// 'topic'이라는 class 가진 data select
db.query(sql).then(function(results){
    console.log(results);
});
*/
// 1. CREATE - 해당 class 내의 특정한 @rid data를 가져오기
/*
var sql = 'SELECT FROM topic where @rid=:rid';// 'topic'이라는 class 가진 data select
var param = { // param 이라는 객체를 생성
    params:{ // param 객체 안에 params 라는 property 부여[이건 약속된 이름]
        rid:'#18:0' // property의 이름 'rid' 와 위의 rid=:rid 에서 :rid 부분 일치!
    }
};
db.query(sql, param).then(function(results){
    console.log(results);
});
*/

// 2. INSERT
// :변수 이므로 'params' property의 value로 'title', 'desc' 넣어줘야함.
/*
var sql = 'INSERT INTO topic (title, description) VALUES(:title, :desc)';
var param = {
    params:{
        title:'Express',
        desc:'Express is framework for web'
    }
};
db.query(sql, param).then(function(results){
    console.log(results);
});*/
// 위의 방식 대신에 param 변수 부분을 param 인자 부분에 복붙해서 아래처럼 짜도 가능.
/*
var sql = 'INSERT INTO topic (title, description) VALUES(:title, :desc)';
db.query(sql, {
    params:{
        title:'Express',
        desc:'Express is framework for web'
    }
}).then(function(results){
    console.log(results);
});
*/

// 3. UPDATE
/*
var sql = 'UPDATE topic SET title=:title WHERE @rid=:rid';
db.query(sql, {params:{title:'Expressjs', rid:'#18:1'}})
.then(function(results){
    console.log(results);
});
*/
// 4. DELETE
/*
var sql = 'DELETE FROM topic WHERE @rid=:rid';
db.query(sql, {params:{rid:'#18:1'}})
.then(function(results){
    console.log(results);
});
*/
