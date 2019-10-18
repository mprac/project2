document.addEventListener('DOMContentLoaded', () => {

    //connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    //when connected, configure buttons to submit
    socket.on('connect', () => {
        document.querySelector(button => {
            button.onclick = () => {
                document.querySelector(input => {
                    const username = input.dataset.username;
                    socket.emit('user login', {'username': username});
                })
                
            }
        })   
    });


});