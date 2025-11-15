import threading

from ollama import Client
from datetime import datetime, time
from flask import Flask, request, jsonify, send_from_directory, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import logging
import os
from flask_cors import CORS
from Models import User, db, Post
from Models import Event
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from Models import Note
import api_calls
import torch
import numpy as np
import pandas as pd
import joblib
from NeuralNet import NeuralNet
import joblib
from Models import AIRecommendation

from flask import Flask, request, jsonify
import sklearn
import schedule
import time
import threading
print(sklearn.__version__)

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
client = Client()




@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


@login_manager.unauthorized_handler
def unauthorized():
    if request.path.startswith('/api/'):
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
        pass
        # return redirect(url_for('home_page'))
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


def combine_date_time(date_str, time_str):
    if not date_str or not time_str:
        return None
    try:
        date_obj = datetime.fromisoformat(date_str).date()
        time_obj = time.fromisoformat(time_str)
        dt = datetime.combine(date_obj, time_obj)
        return dt.astimezone()
    except (ValueError, TypeError):
        return None


@app.route('/api/notes', methods=['GET'])
@login_required
def get_notes():
    try:

        notes_query = current_user.notes.order_by(Note.timestamp.desc())
        notes = notes_query.all()
        notes_list = [note.to_dict() for note in notes]

        return jsonify({"notes": notes_list}), 200

    except Exception as e:
        app.logger.error(f"Error fetching notes for user {current_user.id}: {e}")
        return jsonify({"error": "An error occurred while retrieving notes."}), 500


@app.route('/api/notes', methods=['POST'])
@login_required
def create_note():
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')

    if not content:
        return jsonify({"error": "Note content cannot be empty"}), 400

    try:
        new_note = Note(
            title=title,
            content=content,
            user_id=current_user.id
        )
        db.session.add(new_note)
        db.session.commit()

        return jsonify(new_note.to_dict()), 201

    except Exception as e:
        app.logger.error(f"Error creating note for user {current_user.id}: {e}")
        db.session.rollback()
        return jsonify({"error": "An error occurred while creating the note."}), 500


@app.route('/api/notes/<int:note_id>', methods=['PUT'])
@login_required
def update_note(note_id):
    try:
        note = db.session.get(Note, note_id)

        if not note:
            return jsonify({"error": "Note not found"}), 404

        if note.user_id != current_user.id:
            return jsonify({"error": "Unauthorized to edit this note"}), 403

        data = request.get_json()
        content = data.get('content')

        if not content:
            return jsonify({"error": "Note content cannot be empty"}), 400

        note.title = data.get('title')
        note.content = content

        db.session.commit()

        return jsonify(note.to_dict()), 200

    except Exception as e:
        app.logger.error(f"Error updating note {note_id} for user {current_user.id}: {e}")
        db.session.rollback()
        return jsonify({"error": "An error occurred while updating the note."}), 500


@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
@login_required
def delete_note(note_id):
    try:
        note = db.session.get(Note, note_id)

        if not note:
            return jsonify({"error": "Note not found"}), 404

        if note.user_id != current_user.id:
            return jsonify({"error": "Unauthorized to delete this note"}), 403

        db.session.delete(note)
        db.session.commit()

        return jsonify({"message": "Note deleted successfully!"}), 200

    except Exception as e:
        app.logger.error(f"Error deleting note {note_id} for user {current_user.id}: {e}")
        db.session.rollback()
        return jsonify({"error": "An error occurred while deleting the note."}), 500


@app.route('/api/calendar', methods=['GET', 'POST'])
@login_required
def manage_events():
    if request.method == 'GET':
        try:
            events_query = current_user.events
            events = events_query.order_by(Event.start_time.asc()).all()
            events_list = [event.to_dict() for event in events]

            return jsonify({"events": events_list}), 200

        except Exception as e:
            app.logger.error(f"Error fetching events for user {current_user.id}: {e}")
            return jsonify({"error": "An error occurred while retrieving events."}), 500

    if request.method == 'POST':
        data = request.get_json()

        if not data or not data.get('title') or not data.get('date') or not data.get('startTime'):
            return jsonify({"error": "Title, Date, and Start Time are required."}), 400

        try:

            start_dt = combine_date_time(data['date'], data['startTime'])
            end_dt = combine_date_time(data['date'], data.get('endTime'))

            if start_dt is None:
                return jsonify({"error": "Invalid date or start time format. Use YYYY-MM-DD and HH:MM."}), 400

            new_event = Event(
                title=data['title'],
                description=data.get('description'),
                start_time=start_dt,
                end_time=end_dt,
                notify=data.get('notify', False),
                user_id=current_user.id
            )

            db.session.add(new_event)
            db.session.commit()

            return jsonify(new_event.to_dict()), 201

        except Exception as e:
            app.logger.error(f"Error creating event for user {current_user.id}: {e}")
            db.session.rollback()
            return jsonify({"error": "An error occurred while creating the event."}), 500


@app.route('/api/dashboard', methods=['GET'])
@login_required
def dashboard():
    return jsonify({"message": f"Hello {current_user.username}, welcome!"})


@app.route('/api/weather', methods=['GET'])
@login_required
def weather():
    return api_calls.ApiCalls.get_current_weather().get('current_weather')


@app.route('/api/meme', methods=['GET'])
@login_required
def meme():
    return api_calls.ApiCalls.get_meme()


@app.route('/api/stocks', methods=['GET'])
@login_required
def currency():
    return api_calls.ApiCalls.get_currency()


@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200


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


@app.route('/api/predict', methods=['POST'])
@login_required
def predict():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    MODEL_PATH = os.path.join(BASE_DIR, "pytorch_interest_predictor.pth")
    PREPROCESSOR_PATH = os.path.join(BASE_DIR, "pytorch_preprocessor.pkl")

    preprocessor = joblib.load(PREPROCESSOR_PATH)
    state_dict = torch.load(MODEL_PATH, map_location=torch.device('cpu'))

    # Determine input dimension from the saved state_dict
    if 'layer1.weight' not in state_dict:
        return jsonify({"error": "Invalid model file"}), 500
    input_dim = state_dict['layer1.weight'].shape[1]

    model = NeuralNet(input_dim)
    model.load_state_dict(state_dict)
    model.eval()

    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    df_input = pd.DataFrame([data])
    X_processed = preprocessor.transform(df_input)
    if hasattr(X_processed, 'toarray'):
        X_processed = X_processed.toarray()
    X_tensor = torch.tensor(X_processed, dtype=torch.float32)

    with torch.no_grad():
        preds = model(X_tensor).numpy()
    rounded = (preds >= 0.5).astype(int).tolist()

    return jsonify({"predictions": rounded})


@app.route('/api/recommendations', methods=['GET'])
@login_required
def slm_endpoint_method():
    if request.method == 'GET':
        try:
            events_query = current_user.events
            events = events_query.order_by(Event.start_time.asc()).all()
            events_list = [event.to_dict() for event in events]
            response = get_ai_recommendations(str(jsonify({"events": events_list})))

            return jsonify({"events": response}), 200

        except Exception as e:
            app.logger.error(f"Error fetching events for user {current_user.id}: {e}")
            return jsonify({"error": "An error occurred while retrieving events."}), 500


def get_ai_recommendations(raw_events):
    response = client.chat(
        model="phi3:mini",
        messages=[
            {"role": "system",
             "content": "based on these events: " + raw_events + " create a bullet point list for the that gives them new activity ideas. also elaborate on the recommended activities, also provide a reason like: based on your event history you usually attend social events at this time (Use singular second person pronoung - you). No more than 3 list elements and 7 words in a sentence. Leave 2 blank lines between each"},
            # {"role": "user", "content": raw_events}
        ]
    )

    return response['message']['content']


def update_all_recommendations():
    with app.app_context():
        print('Updating all recommendations')
        users = User.query.all()

        for user in users:


            user_events = '\n'.join(
                f"Title: {e.title} | Description: {e.description or '—'} | "
                f"Notify: {e.notify} | Start: {e.start_time.strftime('%Y-%m-%d %H:%M')} | "
                f"End: {e.end_time.strftime('%Y-%m-%d %H:%M') if e.end_time else '—'}"
                for e in user.events
            )

            new_rec = get_ai_recommendations(user_events)

            rec = AIRecommendation.query.filter_by(user_id=user.id).first()

            if rec:
                rec.text = new_rec  # update existing record
                print(f"Updated recommendation for {user.username}")
            else:
                rec = AIRecommendation(user_id=user.id, text=new_rec)
                db.session.add(rec)
                print(f"Created recommendation for {user.username}")
            db.session.commit()

        db.session.commit()
        print("✅ All user recommendations updated.")





def run_scheduler():
    schedule.every(30).minutes.do(update_all_recommendations())

    # Optional: run task immediately on startup
    update_all_recommendations()

    while True:
        schedule.run_pending()
        time.sleep(100)  # check every 10 seconds


@app.route('/posts', methods=['GET', 'POST'])
@login_required  # requires login for POST, GET could be public if desired
def handle_posts():
    if request.method == 'POST':
        data = request.get_json()
        text = data.get('text')

        if not text:
            return jsonify({'error': 'Post text is required.'}), 400

        # Create new post
        post = Post(user_id=current_user.id, text=text)
        db.session.add(post)
        db.session.commit()

        return jsonify({
            'message': 'Post created successfully!',
            'post': {
                'id': post.id,
                'text': post.text,
                'user_id': post.user_id
            }
        }), 201

    elif request.method == 'GET':
        # Get latest 3 posts, newest first
        latest_posts = Post.query.order_by(Post.id.desc()).limit(3).all()

        # Build JSON response
        result = []
        for post in latest_posts:
            user = User.query.get(post.user_id)
            result.append({
                'id': post.id,
                'text': post.text,
                'username': user.username if user else 'Unknown'
            })

        return jsonify(result), 200


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
        scheduler_thread = threading.Thread(target=run_scheduler)
        scheduler_thread.daemon = True
        scheduler_thread.start()
    app.run(host='0.0.0.0', port=5000, debug=True)

