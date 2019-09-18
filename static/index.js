document.addEventListener('DOMContentLoaded', () => {

    //connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    //when connected, configure something
    socket.on('connect', () => {

        //prompt user to enter name
        
    });
});