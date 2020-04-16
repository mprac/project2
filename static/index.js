document.addEventListener('DOMContentLoaded', () => {

    //connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    //joinedRoom=false;
    //inChannel=false;
    socket.on('connect', () => {
        //jQuery('#chat').html("");

        //Check if a username is in localstorage #####
        if (!localStorage.getItem("username")) {
            //show modal to request username
            jQuery('#joinChatModal').modal('toggle'); //$ is just an alias to jQuery
        } else {
            $('#joinChatModal').modal('hide');
            document.querySelector("#userinchannel").innerHTML = localStorage.getItem("username");
        }

    });

    // Join Chat #####
    document.querySelector('#userJoin').onclick = () => {
        //get username and save to emit
        var name = document.querySelector('#username').value;
        var person = name.toLowerCase();
        socket.emit('user joined', { 'person': person });
    };

    socket.on('user validation', data => {
        $('#joinChatModal').modal('hide');
        localStorage.setItem("username", data['user']);
        document.querySelector("#userinchannel").innerHTML = localStorage.getItem("username");
        socket.emit('update data')
    });

    //show username error
    socket.on('error', data => {
        document.querySelector('#joinChatModalLabel').innerHTML = data['error'];
    });

    //load broadcasted data
    socket.on('broadcast data', data => {
        jQuery('#joinedUsers').html("");
        for (const x in data['joinedUsers']) {
            document.querySelector('#joinedUsers').innerHTML = data['joinedUsers'][x]['username'];
        }
        
    });
    // END Join Chat #####

    // Send message using Button #####
    document.querySelector('#sendMessageButton').onclick = () => {
        const message = document.querySelector("#messageChannelInput").value;
        if (message.trim() == "") {
            //do nothing
        } else {
            const message = document.querySelector("#messageChannelInput").value;
            const username = localStorage.getItem('username');
            const date = new Date().toLocaleString();
            socket.emit('send message', { 'message': message, 'username': username, 'date': date });
            document.querySelector('#messageChannelInput').value = "";
        }

    };
    // Send message using ENTER KEY
    document.addEventListener('keyup', function (key) {
        const message = document.querySelector("#messageChannelInput").value;
        if (key.keyCode == 13 && message.trim() !== "") {
            const message = document.querySelector("#messageChannelInput").value;
            const username = localStorage.getItem('username');
            const date = new Date().toLocaleString();
            socket.emit('send message', { 'message': message, 'username': username, 'date': date });
            document.querySelector('#messageChannelInput').value = "";
        };

    });

    //update client side with message
    socket.on('load messages', data => {
        jQuery('#messageChannelInput').focus();
        submitmessage(data);
    });
    // END Send message  #####

    //create channel #####
    document.querySelector('#createChannelButton').onclick = () => {
        const channel = document.querySelector('#messageChannelInput').value;
        if (channel.trim() == "" || (!isNaN(channel[0]))) {
            alert('Channel names must start with a letter and contain no spaces');
        } else {
            socket.emit('create channel', { 'channel': channel });
            document.querySelector('#messageChannelInput').value = "";
        };
    };

    socket.on('created channel', data => {
        if (data['error'] !== "") {
            alert(data['error'])
        } else {
            createChannel(data);
        };


    });
    // END create channel 


    //exit chat
    document.querySelector('#exit').onclick = () => {
        var person = localStorage.getItem('username');
        socket.emit('exit', { 'person': person });
        localStorage.clear();
    };

});

//###### UPDATE THIS TO ACCEPT MESSAGES BASED ON CHANNEL
//function to submit message
function submitmessage(data) {
    jQuery('#chat').html("");
    for (const x in data['channels']['general']) {
        const message = document.createElement('div');
        if (data['channels']['general'][x]['username'] == localStorage.getItem('username')) {
            message.className = 'thisuser messages';
        } else {
            message.className = 'otheruser messages';
        }
        const messageValue = document.createElement('div');
        messageValue.className = 'message';
        messageValue.innerHTML = data['channels']['general'][x]['message'];
        const messageUserDate = document.createElement('div');
        messageUserDate.className = "usernameDate";
        const messageUser = document.createElement('span')
        messageUser.className = 'username';
        messageUser.innerHTML = data['channels']['general'][x]['username'];
        const messageDate = document.createElement('span');
        messageDate.className = 'date';
        messageDate.innerHTML = data['channels']['general'][x]['date'];

        jQuery('#chat').append(message);
        message.append(messageValue);
        message.append(messageUserDate);
        messageUserDate.append(messageUser);
        messageUserDate.append(messageDate);
        $(window).scrollTop(999999999);
    }
}

function createChannel(data) {
    jQuery('#channelList').html("");
    channel = data['channel'];
    localStorage.setItem('channel', channel);
    username = localStorage.getItem('username');

    socket.emit('join', { 'channel': channel, 'username': username })

    // write what you will do
    // 1. create elements
    // 2. add active in class to know that channel is active
    // 3. append channel to list
    // 4. add channel to active variable 
    // 5. have user that created channel join the room. 
    // 6. must send new room and username to join_room. 

}




