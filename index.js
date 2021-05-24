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
        let rooms = io.sockets.adapter.rooms;
        let room = rooms.get(roomName);
        console.log("rooms : ",room);
        console.log("Total no of rooms : ",rooms.size);
        console.log("Room Name :: ",roomName);
        if (room == undefined)
        {
            console.log("As no room defined , so room Created");
            socket.join(roomName);
            socket.emit("created");
        }
        else if (room.size == 1)
        {
            socket.join(roomName);
            socket.emit("joined");
        } 
        else 
        {
            socket.emit("full");
        }
    });

    socket.on("ready",function(roomName){
        console.log("server broadcast ready");
        socket.broadcast.to(roomName).emit("ready");
    });

    socket.on("candidate",function(candidate,roomName){
        console.log("server broadcast candidate");
        //console.log(candidate);
        socket.broadcast.to(roomName).emit("candidate",candidate);
    });

    socket.on("offer",function(offer,roomName){
        console.log("server broadcast offer");
        //console.log(offer);
        socket.broadcast.to(roomName).emit("offer",offer);
    });

    socket.on("answer",function(answer,roomName){
        console.log("server broadcast answer");
        //console.log(answer);
        socket.broadcast.to(roomName).emit("answer",answer);
    });
});