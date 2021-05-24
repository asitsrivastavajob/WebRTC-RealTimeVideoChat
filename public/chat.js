var div_VideoChatLobby = document.getElementById("video-chat-lobby");
var div_VideoChatRoom = document.getElementById("video-chat-room");
var joinButton = document.getElementById("join");
var userVideo = document.getElementById("user-video");
var peerVideo = document.getElementById("peer-video");
var roomInput = document.getElementById("roomName");
var socket = io.connect("http://localhost:4000");
var room_creator = false;
var rtcPeerConnection;
var roomName;
var userStream;
var iceServers = {
    iceServers: [
        { urls: "stun:stun.services.mozilla.com" },
        { urls: "stun:stun.l.google.com:19302" },
      ],
};

joinButton.addEventListener("click",function(){
    if(roomInput.value == "")
    {
        alert("please enter a room name");
    }
    else
    {
        roomName = roomInput.value;
        //console.log("client emit join");
        //alert("client emit join");
        socket.emit("join",roomName);
    }
});

socket.on("created",function(){
    room_creator = true;
    var constraints = { audio: true, video: { width: 640, height: 320 } };
    
    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream) {
        userStream = stream;
        //alert("mediaStream value :",stream);
        //alert("userStream value :",userStream);
        div_VideoChatLobby.style = "display:none";
        userVideo.srcObject = stream;
        userVideo.onloadedmetadata = function(e) {
            userVideo.play();
        };
        
    })
    .catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.
    
});

socket.on("joined",function(){
    room_creator = false;
    var constraints = { audio: true, video: { width: 640, height: 320 } };
    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream) {
        userStream = stream;
        div_VideoChatLobby.style = "display:none";
        
        userVideo.srcObject = stream;
        userVideo.onloadedmetadata = function(e) {
        userVideo.play();
        };
        //console.log("client emit ready");
        //alert("client emit ready");
        socket.emit("ready",roomName);
    })
    .catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.

});

socket.on("full",function(){
    alert("Room is already full");
});

socket.on("ready",function(){
    if(room_creator)
    {
        rtcPeerConnection = new RTCPeerConnection(iceServers);
        rtcPeerConnection.onicecandidate = OnIceCandidate;
        rtcPeerConnection.ontrack = Ontrack;
        rtcPeerConnection.addTrack(userStream.getTracks()[0],userStream);
        rtcPeerConnection.addTrack(userStream.getTracks()[1],userStream);
        rtcPeerConnection.createOffer(
            function(offer){
                rtcPeerConnection.setLocalDescription(offer);
                //alert("client emit offer");
                socket.emit("offer",offer,roomName);
            },
            function(error){
                console.log(error);
            }
        );
    }
});


socket.on("candidate",function(candidate){
    var icecandidate = new RTCIceCandidate(candidate);
    rtcPeerConnection.addIceCandidate(icecandidate);
});

socket.on("offer",function(offer){
    //alert("client offer called");
    if(!room_creator)
    {
        //alert("client offer called 1");
        rtcPeerConnection = new RTCPeerConnection(iceServers);
        //alert("client offer called 2");
        rtcPeerConnection.onicecandidate = OnIceCandidate;
        //alert("client offer called 3");
        rtcPeerConnection.ontrack = Ontrack;
        //alert("client offer called 4");
        //alert("userStream value :",userStream);
        rtcPeerConnection.addTrack(userStream.getTracks()[0],userStream);
        //alert("client offer called 5");
        rtcPeerConnection.addTrack(userStream.getTracks()[1],userStream);
        //alert("client offer called 6");
        rtcPeerConnection.setRemoteDescription(offer);
        //alert("client offer called 7");
        rtcPeerConnection.createAnswer(
            function(answer){
                rtcPeerConnection.setLocalDescription(answer);
                socket.emit("answer",answer,roomName);
                //alert("client emit answer");
            },
            function(error){
                console.log(error);
            }
        );
    }
});

socket.on("answer",function(answer){
    rtcPeerConnection.setRemoteDescription(answer);
});

function OnIceCandidate(event)
{
    //alert("Candidate");
    if(event.candidate){
        socket.emit("candidate",event.candidate,roomName);
        //console.log("client emit candidate");
    }
}

function Ontrack(event)
{
    peerVideo.srcObject = event.streams[0];
    peerVideo.onloadedmetadata = function(e) {
        peerVideo.play();
    };
}