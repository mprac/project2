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
        user = session['user']
        return redirect(url_for('chat'))
    if request.method == "POST":
        user = request.form.get('username')
        session['user'] = user
        return redirect(url_for('chat'))
    return render_template('index.html')

@app.route("/chat", methods=["GET","POST"])
def chat():
    if 'user' in session:
        user = session['user']
        return render_template('chat.html', user=user)
    else:
        return redirect(url_for('index'))

@app.route("/logout", methods=["POST"])
def logout():
    session.pop('user', None)
    return redirect(url_for('index'))

if __name__ == '__main__':
    socketio.run(app)