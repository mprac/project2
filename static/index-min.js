document.addEventListener("DOMContentLoaded",()=>{var e=io.connect(location.protocol+"//"+document.domain+":"+location.port);e.on("connect",()=>{document.querySelector("#sendMessageButton").onclick=()=>{const o=localStorage.getItem("username")+" "+document.querySelector("#messageChannelInput").value+" "+new Date;e.emit("send message",{message:o}),document.querySelector("#messageChannelInput").value=""},localStorage.getItem("username")?($("#joinChatModal").modal("hide"),document.querySelector("#userinchannel").innerHTML=localStorage.getItem("username")):($("#joinChatModal").modal("toggle"),document.querySelector(".modal-backdrop ").style.opacity="1 !important")}),document.querySelector("#userJoin").onclick=()=>{var o=document.querySelector("#username").value.toLowerCase();e.emit("user joined",{person:o})},e.on("user validation",o=>{$("#joinChatModal").modal("hide"),localStorage.setItem("username",o.user),document.querySelector("#userinchannel").innerHTML=localStorage.getItem("username"),e.emit("update data")}),e.on("error",e=>{document.querySelector("#joinChatModalLabel").innerHTML=e.error}),e.on("broadcast data",e=>{joinedUsers=e.joinedUsers,document.querySelector("#joinedusers").innerHTML=joinedUsers}),e.on("load message",e=>{document.querySelector("#chatthread").innerHTML=e}),document.querySelector("#exit").onclick=()=>{var o=localStorage.getItem("username");e.emit("exit",{person:o}),localStorage.clear()}});