document.addEventListener('DOMContentLoaded', () => {

    //connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {
        //Check if a username is in localstorage #####
        if (!localStorage.getItem("username")) {
            //show modal to request username
            appHeading()
            jQuery('#joinChatModal').modal('toggle'); //$ is just an alias to jQuery
        } else {
            jQuery('#joinChatModal').modal('hide');
        }
    });

    // # Join Chat #####
    document.querySelector('#userJoin').onclick = () => {
        //get username and save to emit
        const name = document.querySelector('#username').value;
        const person = name.toLowerCase();
        socket.emit('user joined', { 'person': person });
    };
    socket.on('user validation', data => {
        $('#joinChatModal').modal('hide');
        localStorage.setItem("username", data['user']);
        localStorage.setItem('inChannel', 'general');
        appHeading();
        const username = localStorage.getItem('username');
        const inChannel = localStorage.getItem('inChannel');
        const date = new Date().toLocaleString();
        socket.emit('join', { 'channel': inChannel, 'username': username, 'message': username + ' has joined FLACK ', 'date': date })
        //socket.emit('update data')
    });
    //show username error
    socket.on('error', data => {
        document.querySelector('#joinChatModalLabel').innerHTML = data['error'];
        jQuery('#joinChatModal').modal('show');
    });

    //###### END Join Chat #####

    // # Send message #####
    // Send message using Button
    document.querySelector('#sendMessageButton').onclick = () => {
        const message = document.querySelector("#messageChannelInput").value;
        if (message.trim() !== "") {
            const message = document.querySelector("#messageChannelInput").value;
            const username = localStorage.getItem('username');
            const date = new Date().toLocaleString();
            const inChannel = localStorage.getItem('inChannel');
            socket.emit('send message', { 'message': message, 'username': username, 'date': date, 'channel': inChannel });
            document.querySelector('#messageChannelInput').value = "";
        };
    };
    // Send message using ENTER KEY
    document.addEventListener('keyup', function (key) {
        const message = document.querySelector("#messageChannelInput").value;
        if (key.keyCode == 13 && message.trim() !== "") {
            const message = document.querySelector("#messageChannelInput").value;
            const username = localStorage.getItem('username');
            const date = new Date().toLocaleString();
            const inChannel = localStorage.getItem('inChannel');
            socket.emit('send message', { 'message': message, 'username': username, 'date': date, 'channel': inChannel });
            document.querySelector('#messageChannelInput').value = "";
        };
    });
    //update client side with message
    socket.on('load data', data => {
        jQuery('#messageChannelInput').focus();
        submitmessage(data);
        updateChannelList(data);
        appHeading();
    });
    // ####### END Send message  #####

    // # create channel #####
    document.querySelector('#createChannelButton').onclick = () => {
        const channel = document.querySelector('#messageChannelInput').value;
        if (channel.trim() == "" || (!isNaN(channel[0]))) {
            alert('Channel names must start with a letter and contain no spaces');
        } else {
            localStorage.setItem('inChannel', channel);
            socket.emit('create channel', { 'channel': channel });
            document.querySelector('#messageChannelInput').value = "";
        };
    };
    socket.on('created channel', data => {
        if (data['error'] !== "") {
            alert(data['error']);
            console.log('error');
        } else {
            updateChannelList(data);
            const username = localStorage.getItem('username');
            const inChannel = localStorage.getItem('inChannel');
            const date = new Date().toLocaleString();
            socket.emit('join', { 'channel': inChannel, 'username': username, 'message': username + ' has created the channel ' + inChannel, 'date': date })
            console.log('success');
        };
    });
    // ##### END create channel #####

    // # exit chat #####
    document.querySelector('#exit').onclick = () => {
        //new
        const username = localStorage.getItem('username');
        const inChannel = localStorage.getItem('inChannel');
        const date = new Date().toLocaleString();
        socket.emit('leave', { 'channel': inChannel, 'username': username, 'message': username + ' has exited FLACK', 'date': date })
        //end new 
        const person = localStorage.getItem('username');
        socket.emit('exit', { 'person': person });
        localStorage.clear();
        console.log('exit success');
    };
    // ###### END exit chat #####

    //

    leaveChannel = function leaveChannel() {
        const username = localStorage.getItem('username');
        const inChannel = localStorage.getItem('inChannel');
        const date = new Date().toLocaleString();
        socket.emit('leave', { 'channel': inChannel, 'username': username, 'message': username + ' has left ' + inChannel, 'date': date })
        localStorage.setItem('inChannel', this.id);
        joinChannel();

    };
    joinChannel = function joinChannel() {
        const username = localStorage.getItem('username');
        const inChannel = localStorage.getItem('inChannel');
        const date = new Date().toLocaleString();
        socket.emit('join', { 'channel': inChannel, 'username': username, 'message': username + ' has joined ' + inChannel, 'date': date })
    };

    //

});

// # function to submit message #####
function submitmessage(data) {
    jQuery('#chat').html("");
    const inChannel = localStorage.getItem('inChannel');
    for (const x in data['channels'][inChannel]) {
        const message = document.createElement('div');
        if (data['channels'][inChannel][x]['username'] == localStorage.getItem('username')) {
            message.className = 'thisuser messages';
        } else {
            message.className = 'otheruser messages';
        }
        const messageValue = document.createElement('div');
        messageValue.className = 'message';
        messageValue.innerHTML = data['channels'][inChannel][x]['message'];
        const messageUserDate = document.createElement('div');
        messageUserDate.className = "usernameDate";
        const messageUser = document.createElement('span')
        messageUser.className = 'username';
        messageUser.innerHTML = data['channels'][inChannel][x]['username'];
        const messageDate = document.createElement('span');
        messageDate.className = 'date';
        messageDate.innerHTML = data['channels'][inChannel][x]['date'];

        jQuery('#chat').append(message);
        message.append(messageValue);
        message.append(messageUserDate);
        messageUserDate.append(messageUser);
        messageUserDate.append(messageDate);
        $(window).scrollTop(999999999);
    }

};
// ###### END function to submit message #####

// # update channelList #####
function updateChannelList(data) {
    jQuery('#channelList').html("");
    const getChannel = localStorage.getItem('inChannel');
    //const username = localStorage.getItem('username'); // to join channel

    const listGroup = document.createElement('div');
    listGroup.className = 'list-group';
    // channels has list of all channels, channel is the channel that will be joined
    for (achannel in data['allchannels']) {
        const listItem = document.createElement('button');
        listItem.type = 'button';
        listItem.onclick = leaveChannel;
        if (data['allchannels'][achannel] == getChannel) {
            listItem.className = 'channellistitem list-group-item list-group-item-action active'
            listItem.setAttribute('id', getChannel);
            listItem.disabled = true;
            listItem.innerHTML = getChannel;
        } else {
            listItem.className = 'channellistitem list-group-item list-group-item-action'
            listItem.setAttribute('id', data['allchannels'][achannel]);
            listItem.innerHTML = data['allchannels'][achannel];
        }

        jQuery('#channelList').append(listGroup);
        listGroup.append(listItem);
    }
    appHeading;

};
// ##### END update channelList #####

// # update application heading #####
function appHeading() {
    if (!localStorage.getItem('username')) {
        document.querySelector("#userinchannel").innerHTML = 'FLACK'
    } else {
        document.querySelector("#userinchannel").innerHTML = localStorage.getItem("username") + ' in ' + localStorage.getItem('inChannel');
    }

}
// ##### update application heading #####





