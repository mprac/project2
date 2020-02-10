#flask python sockets javascript
import os

from flask import Flask, session, render_template, url_for, redirect, request
from flask_socketio import SocketIO, emit, send, join_room, leave_room
from flask_session import Session

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

user = []
usersList = {} 
channels = {}

@app.route("/", methods=["GET", "POST"])
def index():
    return render_template('index.html')


@app.route("/logout", methods=["POST"])
def logout():
    session.pop('user', None)
    return redirect(url_for('index'))

if __name__ == '__main__':
    socketio.run(app)