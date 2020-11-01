const express = require('express');
const http = require('http');  //노드의 기본 모듈
const path = require('path'); 
const socket = require('socket.io');
// 찾는 순서
//1. program files의 노드 설치 폴더를 뒤진다. 
//2. 없으면 현재 실행되는 파일이 있는 경로의 node_modules뒤진다.
//3. 현재 폴더를 뒤져 
const app = express();
const server = http.createServer(app);
const io = socket(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//정적 폴더를 public 폴더로 지정한다.
app.use(express.static( path.join(__dirname, 'public') ));

//request를 받아서 처리후 response를 보낸다.
app.get('/', (req, res)=>{
    res.render('main');
});

let userList = []; //로그인한 유저들을 저장하는 배열
io.on("connect", socket => {
    console.log(socket.id + "연결");
    
    socket.on('login', data => {
        userList.push({id:socket.id, nickname:data});
        socket.emit('login-ok', {id:socket.id, nickname:data});
        io.emit('user-list', userList);
    });

    socket.on('disconnect', ()=>{
        let idx = userList.findIndex(x => x.id === socket.id);
        if(idx < 0) return;
        let user = userList.splice(idx, 1);
        io.emit('user-list', userList);
        console.log(user.nickname + "이 접속을 종료했습니다.");
    });

    socket.on('chat msg', data =>{
        //메시지를 전송한 유저를 찾는다.
        let sendUser = userList.find(x => x.id === socket.id);
        io.emit('awesome',{user:sendUser, msg:data});
    });
});

server.listen(54000, ()=>{
    console.log("서버 실행중");
});
