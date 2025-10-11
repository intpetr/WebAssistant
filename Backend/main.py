from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy

from flask_login import current_user, login_required

from Models import User, db
#import UserSettings

app = Flask(__name__)
app.secret_key = "supersecretkey"

CORS(app)
# import logging
# log = logging.getLogger('werkzeug')
# log.setLevel(logging.ERROR)


login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    if User.get_by_username(username):
        return jsonify({"error": "Username already exists"}), 400

    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()

    print('Successfully registered user:', username, 'with password:', password)

    return jsonify({"message": f"User {username} registered successfully"}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    print(data)
    username = data.get('username')
    password = data.get('password')

    user = User.get_by_username(username)
    if not user or user.password != password:
        return jsonify({"error": "Invalid credentials"}), 401

    login_user(user)
    print('User successfully logged in :', username)
    if hasattr(user, 'settings') and user.settings:
        user_settings = user.settings.settings
    else:
        user_settings = None

    return jsonify({
        "message": "Login successful",
        "user": username,
        "settings": user_settings
    }), 200


@app.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    user = current_user

    if request.method == 'GET':
        if hasattr(user, 'settings') and user.settings:
            user_settings = user.settings.settings
        else:
            user_settings = None

        return jsonify({
            "username": user.username,
            "settings": user_settings
        })

    elif request.method == 'POST':
        data = request.get_json()
        new_settings = data.get('settings')

        if new_settings is None:
            return jsonify({"error": "No settings provided"}), 400


        if hasattr(user, 'settings') and user.settings:
            user.settings.settings = new_settings
        else:
            from Models import UserSettings
            user_settings = UserSettings(user_id=user.id, settings=new_settings)
            db.session.add(user_settings)

        db.session.commit()

        return jsonify({
            "message": "Settings updated successfully"
        })

@app.route('/dashboard', methods=['GET'])
@login_required
def dashboard():
    print('Dashboard returned to user')
    return jsonify({"message": f"Hello {current_user.username}, welcome to your dashboard!"})


@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    print('user logged out')
    return jsonify({"message": "Logged out successfully"}), 200


if __name__ == "__main__":
    with open('C:/Users/ignat/Desktop/Aktív/assistantfolder/WebAssistant/Backend/credentials.txt') as file:
        dbstring = file.readline()
        app.config[
            'SQLALCHEMY_DATABASE_URI'] = dbstring
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        db.init_app(app)

    app.run()
    print('running')
