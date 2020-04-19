import os

from flask import Flask, render_template, url_for, redirect, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
# () tuple - a collection which is ordered and changeable. allows duplicate
# [] list - a collection which is ordered and unchangeable. allows duplicate
# {} set - a collection which is unordered and unindexed. no duplicates
# {} dictionary - is a collection which is unordered changeable and indexed.no duplicates

joinedUsers = {}  # holds all names of users that joined
channels = {}  # stores all channel names and message
channels['general'] = []  # start with general channel for when users join
allChannels = ['general']  # list of all created channels


@app.route("/")
def index():
    return render_template('index.html')

# when website loads, show all messages and channels
@socketio.on('connect')
def broadcastdata():
    emit('load data', {'channels': channels, 'allchannels': allChannels})

# check if user is in joinedUsers list
@socketio.on('user joined')
def userjoined(data):
    user = data['person'].strip()  # remove spaces
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
        joinedUsers[user] = request.sid
        emit('user validation', {'user': user})
# END check if user is in joinedUsers list

# send message
@socketio.on('send message')
def message(data):
    # add data to dictionary
    message = {'message': data['message'],
               'username': data['username'], 'date': data['date']}
    channels[data['channel']].append(message)
    # get the index and add update message to hold index value - used to delete message using del
    for index in range(len(channels[data['channel']])):
        messageIndex = {'messageIndex': index}
        channels[data['channel']][index].update(messageIndex)
    # adds message data to channel
    if (len(channels[data['channel']]) > 100):
        channels[data['channel']].pop(0)  # delete oldest message with index 0
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
    # message to indicate user joiined
    message = {'message': data['message'],
               'username': data['username'], 'date': data['date']}
    channels[data['channel']].append(message)
    for index in range(len(channels[data['channel']])):
        messageIndex = {'messageIndex': index}
        channels[data['channel']][index].update(messageIndex)
    if (len(channels[data['channel']]) > 100):
        channels[data['channel']].pop(0)
    emit('load data', {'channels': channels,
                       'allchannels': allChannels}, broadcast=True)
# END join channel_room

# leave channel_room
@socketio.on('leave')
def on_leave(data):
    username = data['username']
    message = {'message': data['message'],
               'username': data['username'], 'date': data['date']}
    channels[data['channel']].append(message)
    for index in range(len(channels[data['channel']])):
        messageIndex = {'messageIndex': index}
        channels[data['channel']][index].update(messageIndex)
    if (len(channels[data['channel']]) > 100):
        channels[data['channel']].pop(0)
    emit('load data', {'channels': channels,
                       'allchannels': allChannels}, broadcast=True)
# END leave channel_room

# delete message
@socketio.on('deleteMessage')
def delete_message(data):
    index = int(data['index'])
    del channels[data['channel']][index]
    emit('load data', {'channels': channels,
                       'allchannels': allChannels}, broadcast=True)
# END delet message
                       
# exit chat
@socketio.on('exit')
def exit(data):
    user = data['username']
    joinedUsers.pop(user)
    return redirect(url_for('index'))
# END exit chat

if __name__ == '__main__':
    socketio.run(app, debug=True)
