from datetime import datetime, time

from flask import Flask, request, jsonify, send_from_directory, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import logging
import os
from flask_cors import CORS
from Models import User, db
from Models import Event
from flask_login import LoginManager, login_user, login_required, logout_user, current_user

import api_calls

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'Front-end'))
CREDENTIALS_FILE = os.path.join(BASE_DIR, 'credentials.txt')

app = Flask(__name__,
            static_folder=FRONTEND_DIR,
            static_url_path='')  # This remains, to serve your HTML pages from root

CORS(app, supports_credentials=True,
     origins=["http://localhost:5000", "http://127.0.0.1:5000", "http://127.0.0.1:5500"])

app.secret_key = "supersecretkey"

login_manager = LoginManager()
login_manager.init_app(app)

# This remains 'login_page' - it's the *route name* for the HTML login page
login_manager.login_view = 'login_page'


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


@login_manager.unauthorized_handler
def unauthorized():
    # UPDATED: Check if the request is for an API endpoint
    # If so, return a JSON 401 error, which is much better for fetch() calls
    if request.path.startswith('/api/'):
        return jsonify({"error": "Unauthorized"}), 401

    # Otherwise, it's a page request, so redirect to the login page
    return redirect(url_for('login_page'))


# --- Page Serving Routes (No changes) ---

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


@app.route('/Notes/')
@login_required
def notes_page():
    return send_from_directory(app.static_folder, 'Notes/Notes.html')


@app.route('/Calendar/')
@login_required
def calendar_page():
    return send_from_directory(app.static_folder, 'Calendar/Calendar.html')


@app.route('/Settings/')
@login_required
def settings_page():
    return send_from_directory(app.static_folder, 'Settings/Settings.html')


# --- API Endpoints (Prefix added) ---

@app.route('/api/register', methods=['POST'])
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


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if not user or user.password != password:
        return jsonify({"error": "Invalid credentials"}), 401

    login_user(user, remember=True)
    print(f'User {username} successfully logged in, setting session cookie.')

    return jsonify({
        "message": "Login successful",
        # The redirect URL remains a page route
        "redirect": url_for('home_page')
    })


@app.route('/api/settings', methods=['GET', 'POST'])
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


# In main.py, find @app.route('/api/events', ...) and REPLACE it with this:


def combine_date_time(date_str, time_str):
    """
    Combines a 'YYYY-MM-DD' date string and 'HH:MM' time string
    into a timezone-aware datetime object (assuming local timezone).
    Returns None if inputs are invalid or missing.
    """
    if not date_str or not time_str:
        return None
    try:
        date_obj = datetime.fromisoformat(date_str).date()
        time_obj = time.fromisoformat(time_str)
        # Create naive datetime
        dt = datetime.combine(date_obj, time_obj)
        # Return timezone-aware datetime (attaches local timezone)
        return dt.astimezone()
    except (ValueError, TypeError):
        return None



@app.route('/api/calendar', methods=['GET', 'POST'])
@login_required
def manage_events():
    """
    GET: Gets all events for the current user.
    POST: Creates a new event for the current user.
    """

    if request.method == 'GET':
        try:
            events_query = current_user.events
            events = events_query.order_by(Event.start_time.asc()).all()
            events_list = [event.to_dict() for event in events]

            # Return a dictionary with an "events" key, as the JS expects
            return jsonify({"events": events_list}), 200

        except Exception as e:
            app.logger.error(f"Error fetching events for user {current_user.id}: {e}")
            return jsonify({"error": "An error occurred while retrieving events."}), 500

    if request.method == 'POST':
        data = request.get_json()

        # Validate data coming from the JS form
        if not data or not data.get('title') or not data.get('date') or not data.get('startTime'):
            return jsonify({"error": "Title, Date, and Start Time are required."}), 400

        try:
            # Combine date and time strings from JSON
            start_dt = combine_date_time(data['date'], data['startTime'])
            end_dt = combine_date_time(data['date'], data.get('endTime'))  # endTime is optional

            if start_dt is None:
                return jsonify({"error": "Invalid date or start time format. Use YYYY-MM-DD and HH:MM."}), 400

            new_event = Event(
                title=data['title'],
                description=data.get('description'),
                start_time=start_dt,
                end_time=end_dt,  # Will be None if not provided, which is fine
                notify=data.get('notify', False),
                user_id=current_user.id
            )

            db.session.add(new_event)
            db.session.commit()

            # Return the newly created event in the new format
            return jsonify(new_event.to_dict()), 201

        except Exception as e:
            app.logger.error(f"Error creating event for user {current_user.id}: {e}")
            db.session.rollback()
            return jsonify({"error": "An error occurred while creating the event."}), 500


# 2. ADD THIS HELPER FUNCTION near your imports



@app.route('/api/dashboard', methods=['GET'])
@login_required
def dashboard():
    return jsonify({"message": f"Hello {current_user.username}, welcome!"})


@app.route('/api/weather', methods=['GET'])  # <-- THE FIX
@login_required
def weather():
    # This will now be called correctly
    return api_calls.ApiCalls.get_current_weather().get('current_weather')


@app.route('/api/meme', methods=['GET'])
@login_required
def meme():
    # This will now be called correctly
    return api_calls.ApiCalls.get_meme()


@app.route('/api/stocks', methods=['GET'])
@login_required
def currency():
    # This will now be called correctly
    return api_calls.ApiCalls.get_currency()


@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200


# @app.route('/api/moon_phase', methods=['GET'])
# @login_required
# def moon_phase():
#    return api_calls.ApiCalls.get_moon_phase()


@app.route('/api/news', methods=['GET'])
@login_required
def news():
    query = request.args.get('query', 'technology')
    country = request.args.get('country', 'hu')
    language = request.args.get('language', 'en')
    return api_calls.ApiCalls.get_latest_news(query=query, country=country, language=language)


@app.route('/api/flights', methods=['GET'])
@login_required
def flights():
    limit = request.args.get('limit', 10, type=int)
    return api_calls.ApiCalls.get_flights_from_budapest(limit=limit)


@app.route('/api/moon_phase', methods=['GET'])
@login_required
def moon_debrecen():
    return api_calls.ApiCalls.get_moon_data_debrecen()


@app.route('/api/popular_stocks', methods=['GET'])
@login_required
def popular_stocks():
    symbols = request.args.getlist('symbols')
    if not symbols:
        symbols = None
    return api_calls.ApiCalls.get_most_popular_stocks(symbols=symbols)


# --- Main Execution (No changes) ---

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
