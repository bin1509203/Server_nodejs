'use strict'; // 좀더 엄격하게 문법 error 잡아내기 위한 코드

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.locals.pretty = true;

app.use(bodyParser.json()); // jason response
var http = require('http');
var tryjson = require('tryjson'); 
// json parsing은 항상 보안을 위해서 try/catch block 내에 위치해야하는데
// 이 귀찮은 과정을 해결해준 library

// https://api.github.com/users/rsp
// var options = {
//     host: 'api.github.com',
//     path: '/users/rsp',
//     headers: {'User-Agent': 'request'}
// };

// var options = {
//     host: 'localhost',
//     port : 3000,
//     path: '/test',
//     method: 'GET',
//     headers: {'User-Agent': 'request'}
// };

// http.get(options, function (res) {
//     var json = '';
//     res.on('data', function (chunk) {
//         json += chunk;
//     });
//     res.on('end', function () {
//         if (res.statusCode === 200) {
//             try {
//                 var data = JSON.parse(json);
//                 // data is available here:
//                 console.log(data.html_url);
//             } catch (e) {
//                 console.log('Error parsing JSON!');
//             }
//         } else {
//             console.log('Status:', res.statusCode);
//         }
//     });
// }).on('error', function (err) {
//       console.log('Error:', err);
// });
var data = '';

app.get('/test', function(req, res){
    var output =`
    <h1>Json Test</h1>    
        <h2>${data}</h2>
    `;
    res.send(output);

});

app.post('/test', function(req, res){
    //console.log(req.body);
    if (res.statusCode === 200) {
        try {
            data = tryjson.parse(req.body);
            // data is available here:
            console.log(data.html_url);
            console.log("parse"+data);
        } catch (e) {
            //console.log('Error parsing JSON!');
            data = tryjson.stringify(req.body);
            console.log("non"+data);
        }
    } else {
        console.log('Status:', res.statusCode);
    }

    res.redirect('/test');
});

app.listen(3000, function(req,res){
    console.log('Connected, 3000 port!');
});
