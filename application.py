#flask python sockets javascript
import os

from flask import Flask, session, render_template, url_for, redirect, request
from flask_socketio import SocketIO, emit
from flask_session import Session

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

users = ['guest']
chatrooms = ['public']

@app.route("/", methods=["GET", "POST"])
def index():
    if 'user' in session:
        username = session['user']
        return redirect(url_for('chat'), username=username)
    if request.method == "POST":
        user = request.form.get('username')
        username = session['user']
        return redirect(url_for('chat.html', username=username))
    return render_template('index.html')

if __name__ == '__main__':
    socketio.run(app)