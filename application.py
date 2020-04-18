import os

from flask import Flask, session, render_template, url_for, redirect, request
from flask_socketio import SocketIO, emit, send, join_room, leave_room
from flask_session import Session

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
# () tuple - a collection which is ordered and changeable. allows duplicate
# [] list - a collection which is ordered and unchangeable. allows duplicate
# {} set - a collection which is unordered and unindexed. no duplicates
# {} dictionary - is a collection which is unordered changeable and indexed.no duplicates

joinedUsers = {}  # WHY IF THE USERNAME IS IN THE CHANNELS LIST - channel list holds channel name and messages not users info
channels = {}  # use this to store the channel name to be added and removed in localstorage
channels['general'] = []
allChannels = ['general']  # list of all channels to
# numUsers = 0 # show how many users joined flack


@app.route("/")
def index():
    return render_template('index.html')

# when website loads, show all messages.
@socketio.on('connect')
def broadcastdata():
    emit('load data', {'channels': channels, 'allchannels': allChannels})

# check if user is in joinedUsers list - OK.
@socketio.on('user joined')
def userjoined(data):
    user = data['person'].strip()
    if user in joinedUsers:
        error = "User already exists please use a different name"
        emit('error', {'error': error})
    elif not user:
        error = "Username cannot be blank"
        emit('error', {'error': error})
    elif ' ' in user:
        error = "Username cannot contain spaces"
        emit('error', {'error': error})
    else:
        userInfo = {'id': request.sid, 'username': data['person']}
        joinedUsers[data['person']] = userInfo
        emit('user validation', {'user': user})
# END check if user is in joinedUsers list

# broadcast data
# @socketio.on('update data')
# def updatedata():
#     emit('broadcast data', {'joinedUsers': joinedUsers}, broadcast=True)

# send message
@socketio.on('send message')
def message(data):
    # add data to dictionary
    message = {'message': data['message'],
               'username': data['username'], 'date': data['date']}
    channels[data['channel']].append(message)  # adds message data to general
    if (len(channels[data['channel']]) > 100):
        channels[data['channel']].pop(0)
    emit('load data', {'channels': channels,
                       'allchannels': allChannels}, broadcast=True)
# END send message

# create channel
@socketio.on('create channel')
def create_channel(data):
    error = ""
    channel = (data['channel'].strip()).lower()
    if not channel:
        error = "Server error: channel cannot be empty"
    elif channel[0].isdigit():
        error = "Server error: channel name cannot start with a number"
    elif ' ' in channel:
        error = "Server error: channel name cannot contain spaces"
    elif channel in allChannels:
        error = "Server error: channel already exists"
    else:
        allChannels.append(channel)
        channels[channel] = []
    emit('created channel', {'channel': channel,
                             'allchannels': allChannels, 'error': error})
# END creat channel

# join channel_room
@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['channel']
    message = {'message': data['message'],
               'username': data['username'], 'date': data['date']}
    #oin_room(room)
    channels[data['channel']].append(message)  # adds message data to general
    if (len(channels[data['channel']]) > 100):
        channels[data['channel']].pop(0)
    emit('load data', {'channels': channels,
                       'allchannels': allChannels}, broadcast=True)
    #send('load data', username + ' has entered the room.', room=room)
# END join channel_room

# leave channel_room
@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['channel']
    message = {'message': data['message'],
               'username': data['username'], 'date': data['date']}
    #leave_room(room)
    channels[data['channel']].append(message)
    if (len(channels[data['channel']]) > 100):
        channels[data['channel']].pop(0)
    emit('load data', {'channels': channels,
                       'allchannels': allChannels}, broadcast=True)
# END leave channel_room

# exit chat
@socketio.on('exit')
def exit(data):
    user = data['person']
    joinedUsers.pop(user)
    # emit('load data', {'joinedUsers': joinedUsers, 'allchannels': allChannels}, broadcast=True)
    return redirect(url_for('index'))
# END exit chat


if __name__ == '__main__':
    socketio.run(app, debug=True)
