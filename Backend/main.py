from flask import Flask, request, jsonify, send_from_directory, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import logging
import os
from flask_cors import CORS
from Models import User, db

from flask_login import LoginManager, login_user, login_required, logout_user, current_user

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'Front-end'))
CREDENTIALS_FILE = os.path.join(BASE_DIR, 'credentials.txt')

app = Flask(__name__,
            static_folder=FRONTEND_DIR,
            static_url_path='')

CORS(app, supports_credentials=True,
     origins=["http://localhost:5000", "http://127.0.0.1:5000", "http://127.0.0.1:5500"])

app.secret_key = "supersecretkey"

login_manager = LoginManager()
login_manager.init_app(app)

login_manager.login_view = 'login_page'


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


@login_manager.unauthorized_handler
def unauthorized():
    if request.path.startswith('/settings') or request.path.startswith('/dashboard'):
        return jsonify({"error": "Unauthorized"}), 401
    return redirect(url_for('login_page'))


@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('home_page'))
    return redirect(url_for('login_page'))


@app.route('/Home/')
@login_required
def home_page():
    return send_from_directory(app.static_folder, 'Home/Home.html')


@app.route('/Login/')
def login_page():
    if current_user.is_authenticated:
        return redirect(url_for('home_page'))
    return send_from_directory(app.static_folder, 'Login/Login.html')


@app.route('/Settings/')
@login_required
def settings_page():
    return send_from_directory(app.static_folder, 'Settings/Settings.html')


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    new_user = User(username=username, password=password, email=email)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": f"User {username} registered successfully"}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if not user or user.password != password:
        return jsonify({"error": "Invalid credentials"}), 401

    # remember=True makes the cookie persistent

    login_user(user, remember=True)
    print(f'User {username} successfully logged in, setting session cookie.')

    return jsonify({
        "message": "Login successful",
        "redirect": url_for('home_page')
    })


@app.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    user = current_user

    if request.method == 'GET':
        user_settings = getattr(user, 'settings', None)
        settings_data = user_settings.settings if user_settings else None
        return jsonify({"settings": settings_data})

    elif request.method == 'POST':
        data = request.get_json()
        new_settings = data.get('settings')

        if new_settings is None:
            return jsonify({"error": "No settings provided"}), 400

        from Models import UserSettings
        user_settings_obj = getattr(user, 'settings', None)

        if user_settings_obj:
            user_settings_obj.settings = new_settings
        else:
            new_settings_entry = UserSettings(user_id=user.id, settings=new_settings)
            db.session.add(new_settings_entry)

        db.session.commit()
        return jsonify({"message": "Settings updated successfully"})


@app.route('/dashboard', methods=['GET'])
@login_required
def dashboard():
    return jsonify({"message": f"Hello {current_user.username}, welcome!"})


@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200


if __name__ == "__main__":
    try:
        with open(CREDENTIALS_FILE) as file:
            dbstring = file.readline().strip()
            if not dbstring:
                raise ValueError("Credentials file is empty.")
            app.config['SQLALCHEMY_DATABASE_URI'] = dbstring
            app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
            db.init_app(app)
            print("Database initialized successfully.")

    except FileNotFoundError:
        print(f"CRITICAL ERROR: {CREDENTIALS_FILE} not found. Database will not connect.")
    except ValueError as e:
        print(f"CRITICAL ERROR: {e}")
    except Exception as e:
        print(f"CRITICAL DATABASE ERROR: {e}")

    with app.app_context():
        try:
            db.create_all()
            print("Database tables checked/created.")
        except Exception as e:
            print(f"Error creating database tables: {e}")

    app.run(host='0.0.0.0', port=5000, debug=True)
