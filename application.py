import os

from flask import Flask, session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app) 


@app.route("/")
def index():
    return "Project 2: TODO"
#prompt user to enter name

#assign user to session


