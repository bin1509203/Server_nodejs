var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser('DSFJI#@!$LSDF&%#$')); 
// 쿠키 관련 설정사항 : http://expressjs.com/en/4x/api.html#req.cookies
// 쿠기를 request 할 수 있는 plug-in : https://github.com/expressjs/cookie-parser
// npm install cookie-parser --save
// 쿠키란 해당 컴퓨터에 저장되는 요소로, 그 홈페이지에서만 적용된다.
// 쿠키값을 암호화하기 위해서는 coolieParser() 인자로 랜덤값을 주면 된다!!
// 암호화는 반드시 필요하다. 이 인자 = key 라 이게 있어야 쿠키값 해석가능.
// 쿠키를 더 보안한 것은 session임!

////////// 장바구니 application 만들기

var products = { // data 객체. db 대신 사용. 쿠키에만 집중하기 위해서...!
    1: {title: 'The history of web 1'},
    2: {title: 'The next web'}
}; 
// 상품 고르는 page
app.get('/products', function(req,res){
    var output = '';
    for( var name in products){ // products 객체 내의 값들을 하나씩 꺼내기.
        output += `
        <li>
            <a href="/cart/${name}">${products[name].title}</a>
        </li>`
    }
    res.send(`
        <h1>Products</h1>
        <ul>${output}</ul>
        <a href="/cart">Cart</a>
    `);
});
// 장바구니에 상품 추가
app.get('/cart/:id', function(req,res){
    var id = req.params.id;
    if(req.signedCookies.cart){ // cart라는 쿠키가 존재하면
        var cart = req.signedCookies.cart; // 현재 쿠키값을 cart변수에 전달[문자형태로]
    }else{ // count라는 쿠키 X => 최초실행이다!
        var cart = {};
    }
    if(!cart[id]){// cart[id]값이 존재x 라면
        cart[id] = 0; // 0 으로 초기화!
    }
    cart[id] = parseInt(cart[id])+1; 
    // cart[id]가 위에서 문자형태로 전달받았으므로 더하기 연산을 위해서는 숫자로 바꿔야함.
    res.cookie('cart', cart, {signed: true}); // 쿠키에 cart객체의 값들을 굽는다(저장).
    // 위 코드의 최초 실행때 cart 라는 쿠키를 생성한 후에 변수 cart의 값을 굽는다.
    //res.send(cart);
    res.redirect('/cart');
});
// 장바구니 page
app.get('/cart', function(req, res){
    var cart = req.signedCookies.cart;
    if(!cart){
        res.send('Empty!');
    }else{
        var output = '';
        for(var id in cart){
            output += `
                <li>${products[id].title} (수량 : ${cart[id]})
                    <a href="/cart/${id}/sub">[빼기]</a>
                    <a href="/cart/${id}/delete">[삭제]</a>
                </li>
            `;
        }
    }
    res.send(`
        <h1>Cart</h1>
        <ul>${output}</ul>
        <a href="/products">Products</a>
    `);
});
// 카트에 상품 빼기
app.get('/cart/:id/sub', function(req, res){
    var id = req.params.id;
    if(req.signedCookies.cart){ // cart라는 쿠키가 존재하면
        var cart = req.signedCookies.cart; // 현재 쿠키값을 cart변수에 전달[문자형태로]
    }else{ // count라는 쿠키 X => 최초실행이다!
        var cart = {};
    }
    if(!cart[id]){// cart[id]값이 존재x 라면
        cart[id] = 0; // 0 으로 초기화!
    }
    if(cart[id]!=0) {// 수량이 0이 아니면
        cart[id] = parseInt(cart[id])-1; 
    }
    res.cookie('cart', cart, {signed: true}); // 쿠키에 cart객체의 값들을 굽는다(저장).
    res.redirect('/cart');
});
// 카트에 상품 삭제
app.get('/cart/:id/delete', function(req, res){
    var id = req.params.id;
    var cart = req.signedCookies.cart;
    delete(cart[id]); // 해당 id값을 갖는 객체 내의 값을 삭제
    res.cookie('cart', cart, {signed: true});
    res.redirect('/cart');
});

/////////// count 하는 application 만들기

app.get('/count', function(req,res){
    if(req.signedCookies.count){ // count 라는 쿠키변수가 있다면
        var count = parseInt(req.signedCookies.count);// 문자 count value를 숫자로 바꿔줌
        // cookies 대신 signedCookies 를 하면 우리가 설정한 key 값으로 암호를 해독하여 전달한다!
    }else{ // count 라는 쿠키변수가 없다면
        var count = 0;
    }
    count = count+1;
    res.cookie('count', count, {signed: true}); // count 라는 쿠키에 변수 count에 담긴 값을 전달.
    // 세번째 인자는 우리가 설정한 key값을 이용하여 암호화를 해서 굽겠다는 선언.
    // cookie-parser 때문에 res 객체에 cookie 라는 method를 사용할수있음
    // 먄약 'count'라는 쿠키가 없다면 처음 실행될때 생성.
    res.send('count : '+count);
})

app.listen(3003, function(){
    console.log('Connected 3003 port!!!');
});
