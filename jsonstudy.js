// json통신 공부



var person = {"height":174, "job":"programmer"}
var members = ["egoing", "k8805", "sorialgi"];
// JS의 객체와 배열은 다른 언어(php 등)에서 사용할 수 없다.
// 그래서 이런 객체와 배열 형식을 표즌으로 하여 만든 것이 JSON
// JSON(JavaScript Object Notation)의 약자로 JavaScript에서 객체를 만들 때
// 사용하는 표현식을 의미한다. 이 표현식은 사람도 이해하기 쉽고 
// 기계도 이해하기 쉬우면서 데이터의 용량이 작다. 
// 이런 이유로 최근에는 JSON이 XML을 대체해서 설정의 저장이나 데이터를 
// 전송등에 많이 사용된다. 
// JSON에 대한 자세한 내용은 아래 JSON의 공식홈페이지를 참조한다. 
// http://www.json.org/json-ko.html

// 다음은 json 형식이다. 줄바꿈이 일어날때는 역슬래쉬 \ 를 넣어야 됨.
// {} 를 '' 로 감싸서 text로 처리.
var info = '{\
    "font_face": "Inconsolata",\
    "font_size": 30,\
    "ignored_packages":\
    [\
    ],\
    "line_numbers":false\
}'
// json format의 text(문자열)를 "parse"라는 method의 인자로 주면
// 인자로 전달된 json format을 js 형식의 객체로 return한다.
var infoobj = JSON.parse(info); 
// 이제 json format을 js로 바꿨기 때문에 제어가 가능하다.
for(var name in infoobj){
    console.log(name, infoobj[name]);
}

// js 객체를 "stringify"라는 method의 인자로 주면
// 인자로 전달한 객체를 json format으로 변형한 text(문자열)를 return한다.
var infostr = JSON.stringify(infoobj); 

// 들어온 text를 원하는 기준으로 분리하여 배열로 바꾸기.
// text 자체를 우리가 제어하기는 힘들어서 배열로 바꿔야 좋다!
var string = '<p>test</p> <li>ab cd</li>';
var string2 = string.split(' '); // 공백으로 분류
// > string2
// [ '<p>test</p>', '<li>ab', 'cd</li>' ]

// 이런식으로 text 형태로 파일을 주고받으면 이렇게 각각의 언어에서
// 이를 제어하기 위해서 배열이나 객체로 바꾸어야 하는데 이렇게 
// 주고받을때마다 일일이 이런 작업을 거치는게 번거롭다.
// 이 작업을 없애주는것이 바로 json 통신!

