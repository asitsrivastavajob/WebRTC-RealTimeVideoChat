const express = require("express");
const socket = require("socket.io");
const app = express();

var server = app.listen(4000,function(){
    console.log("Server is running");
})

app.use(express.static("public"));

var io = socket(server);

io.on("connection",function(socket){
    console.log("User Connected : " + socket.id);

    socket.on("join",function(roomName){
        var rooms = io.sockets.adapter.rooms;
        console.log(rooms.size);
        console.log(roomName);
        if(rooms.size == 1){
            socket.join(roomName)
            console.log("Room joined");
            socket.emit("joined");
        }
        else{
            console.log("Room is already full");
            socket.emit("full");
        }
    });

    socket.on("ready",function(roomName){
        console.log("ready");
        socket.broadcast.to(roomName).emit("ready");
    });

    socket.on("candidate",function(candidate,roomName){
        console.log("candidate");
        socket.broadcast.to(roomName).emit("candidate",candidate);
    });

    socket.on("offer",function(offer,roomName){
        console.log("offer");
        socket.broadcast.to(roomName).emit("offer",offer);
    });

    socket.on("answer",function(answer,roomName){
        console.log("answer");
        socket.broadcast.to(roomName).emit("answer",answer);
    });
});