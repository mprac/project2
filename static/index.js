document.addEventListener('DOMContentLoaded', () => {

    //connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    //when connected, configure buttons to submit - Why are you doing this?????? 
    socket.on('connect', () => {
        document.querySelector("button").onclick = () => {
            const username = document.getElementById('#username').value;
            socket.emit('user login', { 'username': username });
        };
    });


});