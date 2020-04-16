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

joinedUsers = {} #WHY THE USERNAME IS IN THE CHANNELS LIST
channels = {}  # use this to store the channel name to be added and removed in localstorage
channels['general'] = [] 
allChannels = ['general']  #list of all channels to
#numUsers = 0 # show how many users joined flack

@app.route("/")
def index():
    return render_template('index.html')

# when website loads, show all messages. 
@socketio.on('connect')
def broadcastdata():
    emit('load messages', {'channels': channels})

# check if user is in joinedUsers list - OK.
@socketio.on('user joined')
def userjoined(data):
    user = ""
    error = ""
    if data["person"] in joinedUsers:
        error = "User already exists please use a different name"
        emit('error', {'error': error})
    else:
        userInfo = {'id': request.sid,'username': data['person']}
        joinedUsers[data['person']] = userInfo
        user = data['person']
        emit('user validation', {'user': user})
# END check if user is in joinedUsers list

#broadcast data
@socketio.on('update data')
def updatedata():
    emit('broadcast data', {'joinedUsers': joinedUsers}, broadcast=True)


@socketio.on('send message')
def message(data):
    #add data to dictionary
    message = {'message': data['message'],
               'username': data['username'], 'date': data['date']} 
    channels['general'].append(message) #adds message data to general 
    if (len(channels['general'])>100):
        channels['general'].pop(0)
    emit('load messages', {'channels': channels}, broadcast=True)

# creat channel 
@socketio.on('create channel')
def create_channel(data):
    channel = (data['channel'].strip()).lower()
    if not channel:
        error = "server error: channel cannot be empty"
    elif channel[0].isdigit():
        error = "server error: channel name cannot start with a number"
    elif ' ' in channel:
        error = "server error: channel name cannot contain spaces"
    elif channel in allChannels:
        error = "server error: channel already exists"
    else:
        allChannels.append(channel)
        channels[channel]=[]
    emit('created channel', {'channel': channel, 'error': error})


@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['channel']
    join_room(room)
    send(username + ' has entered the room.', room=room)

@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['channel']
    leave_room(room)
    send(username + ' has left the room.', room=room)


@socketio.on('exit')
def exit(data):
    user = data['person']
    joinedUsers.pop(user)
    emit('broadcast data', {'joinedUsers': joinedUsers}, broadcast=True)
    return redirect(url_for('index'))
   


if __name__ == '__main__':
    socketio.run(app, debug=True)
