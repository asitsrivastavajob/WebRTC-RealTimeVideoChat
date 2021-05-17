var div_VideoChatLobby = document.getElementById("video-chat-lobby");
var div_VideoChatRoom = document.getElementById("video-chat-room");
var joinButton = document.getElementById("join");
var userVideo = document.getElementById("user-video");
var peerVideo = document.getElementById("peer-video");
var roomName = document.getElementById("roomName");
var socket = io.connect("http://localhost:4000");

joinButton.addEventListener("click",function(){

    if(roomName.value == "")
    {
        alert("please enter a room name");
    }
    else{
        socket.emit("join",roomName.value);
    }
});

socket.on("created",function(){
    var constraints = { audio: true, video: { width: 1280, height: 960 } };

    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(mediaStream) {
        div_VideoChatLobby.style = "display:none";
        var video = document.querySelector('video');
        video.srcObject = mediaStream;
        video.onloadedmetadata = function(e) {
        video.play();
        };
    })
    .catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.


});

socket.on("joined",function(){
    var constraints = { audio: true, video: { width: 1280, height: 960 } };

    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(mediaStream) {
        div_VideoChatLobby.style = "display:none";
        var video = document.querySelector('video');
        video.srcObject = mediaStream;
        video.onloadedmetadata = function(e) {
        video.play();
        };
    })
    .catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.

});

socket.on("full",function(){
    alert("Room is already full");
});

socket.on("ready",function(){});
socket.on("candidate",function(){});
socket.on("offer",function(){});
socket.on("answer",function(){});