document.addEventListener('DOMContentLoaded', () => {

    //connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {
        //Check if a username is in localstorage #####
        if (!localStorage.getItem("username")) {
            //show modal to request username
            appHeading(); //call function to load html to heading
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
    //update client side with all data on changes
    socket.on('load data', data => {
        jQuery('#messageChannelInput').focus();
        submitmessage(data);
        updateChannelList(data);
        appHeading();
    });
    // ####### END Send message  #####

    // # create channel #####
    document.querySelector('#createChannelButton').onclick = () => {
        const channelRaw = document.querySelector('#messageChannelInput').value;
        const channel = channelRaw.trim();
        if (channel == "" || (!isNaN(channel[0]))) {
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
        } else {
            updateChannelList(data);
            const username = localStorage.getItem('username');
            const inChannel = localStorage.getItem('inChannel');
            const date = new Date().toLocaleString();
            socket.emit('join', { 'channel': inChannel, 'username': username, 'message': username + ' has created the channel ' + inChannel, 'date': date });
        };
    });
    // ##### END create channel #####

    // # leave_join channel #####
    // when user clicks on channel name an onclick call to this function is triggered.
    // each list item also has an id attiribute set to the name of the channel where i can extract using this.id and set it as the new inchannel localstorage.
    leaveChannel = function leaveChannel() {
        const username = localStorage.getItem('username');
        const inChannel = localStorage.getItem('inChannel');
        const date = new Date().toLocaleString();
        socket.emit('leave', { 'channel': inChannel, 'username': username, 'message': username + ' has left ' + inChannel, 'date': date });
        localStorage.setItem('inChannel', this.id);
        jQuery('#listofchannelsmodal').modal('hide');
        joinChannel();
    };
    // this calls join to add a message that user joined. 
    joinChannel = function joinChannel() {
        const username = localStorage.getItem('username');
        const inChannel = localStorage.getItem('inChannel');
        const date = new Date().toLocaleString();
        socket.emit('join', { 'channel': inChannel, 'username': username, 'message': username + ' has joined ' + inChannel, 'date': date });
    };
    // ##### END leave_join channel #####

    //########## PERSONAL TOUCH ############
    // Each message delete button (x) id attribute is set to the index of the message which i recieved from the server. this allowed me to send the id back to the server and use it to del the message.    
    // # delete message #####
    deleteMessage = function deleteMessage() {
        index = this.id;
        inChannel = localStorage.getItem('inChannel');
        socket.emit('deleteMessage', { 'index': index, 'channel': inChannel });
        console.log(index);
    };
    // ##### END delete message #####

       // # exit chat #####
       document.querySelector('#exit').onclick = () => {
        const username = localStorage.getItem('username');
        socket.emit('exit', { 'username': username });
        localStorage.clear();
    };
    // ###### END exit chat #####

});
// # function to submit message #####
function submitmessage(data) {
    jQuery('#chat').html("");
    const inChannel = localStorage.getItem('inChannel');
    for (const x in data['channels'][inChannel]) {
        const message = document.createElement('div');
        const messageValue = document.createElement('div');
        if (data['channels'][inChannel][x]['username'] == localStorage.getItem('username')) {
            message.className = 'thisuser messages';
            message.setAttribute('id', data['channels'][inChannel][x]['message']);
            messageValue.className = 'message';
            messageValue.innerHTML = data['channels'][inChannel][x]['message'];
            const messageUserDate = document.createElement('div');
            messageUserDate.className = "usernameDate";
            const messageUser = document.createElement('span');
            messageUser.className = 'username';
            messageUser.innerHTML = data['channels'][inChannel][x]['username'];
            const messageDate = document.createElement('span');
            messageDate.className = 'date';
            messageDate.innerHTML = data['channels'][inChannel][x]['date'];
            const messageButton = document.createElement('button');
            messageButton.className = 'delete-button';
            messageButton.setAttribute('id', data['channels'][inChannel][x]['messageIndex']);
            messageButton.innerHTML = ' &#10006;';
            

            jQuery('#chat').append(message);
            message.append(messageValue);
            message.append(messageUserDate);
            messageUserDate.append(messageUser);
            messageUserDate.append(messageDate);
            messageUserDate.append(messageButton);
            $(window).scrollTop(999999999);
            messageButton.onclick = deleteMessage;
        } else {
            message.className = 'otheruser messages';
            messageValue.className = 'message';
            messageValue.innerHTML = data['channels'][inChannel][x]['message'];
            const messageUserDate = document.createElement('div');
            messageUserDate.className = "usernameDate";
            const messageUser = document.createElement('span');
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
    }

};
// ###### END function to submit message #####

// # update channelList #####
function updateChannelList(data) {
    jQuery('#channelList').html("");
    const getChannel = localStorage.getItem('inChannel');
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
            listItem.className = 'channellistitem list-group-item list-group-item-action';
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
        document.querySelector("#userinchannel").innerHTML = 'FLACK';
    } else {
        document.querySelector("#userinchannel").innerHTML = localStorage.getItem("username") + ' in ' + localStorage.getItem('inChannel');
    }

}
// ##### update application heading #####





