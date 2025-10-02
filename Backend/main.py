from flask import Flask, request, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy

from Models import User, db

app = Flask(__name__)
app.secret_key = "supersecretkey"


login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# --- Register ---
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

    return jsonify({"message": f"User {username} registered successfully"}), 201



@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.get_by_username(username)
    if not user or user.password != password:
        return jsonify({"error": "Invalid credentials"}), 401

    login_user(user)
    return jsonify({"message": "Login successful", "user": username}), 200


@app.route('/dashboard', methods=['GET'])
@login_required
def dashboard():
    return jsonify({"message": f"Hello {current_user.username}, welcome to your dashboard!"})


@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200


if __name__ == "__main__":
    with open('credentials.txt') as file:
        dbstring = file.readline()
        app.config[
            'SQLALCHEMY_DATABASE_URI'] = dbstring
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        db.init_app(app)

    app.run(debug=True)
