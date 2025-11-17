import pytest
from Models import db, User, Note, Event, Post, AIRecommendation, UserSettings
from flask import Flask

@pytest.fixture
def app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_user_creation(app):
    with app.app_context():
        user = User(username="abc", password="pass", email="abc@xy.com")
        db.session.add(user)
        db.session.commit()
        fetched = User.query.filter_by(username="abc").first()
        assert fetched is not None
        assert fetched.email == "abc@xy.com"

def test_note_to_dict(app):
    with app.app_context():
        user = User(username="us", password="pw")
        db.session.add(user)
        db.session.commit()
        note = Note(title="T", content="C", user_id=user.id)
        db.session.add(note)
        db.session.commit()
        note_dict = note.to_dict()
        assert note_dict["title"] == "T"
        assert note_dict["content"] == "C"
        assert "timestamp" in note_dict

def test_event_to_dict(app):
    from datetime import datetime
    with app.app_context():
        user = User(username="testus", password="pw")
        db.session.add(user)
        db.session.commit()
        event = Event(title="Meeting", start_time=datetime(2023,1,2,14,0), user_id=user.id)
        db.session.add(event)
        db.session.commit()
        data = event.to_dict()
        assert data["title"] == "Meeting"
        assert data["startTime"] == "14:00"
        assert data["date"] == "2023-01-02"

def test_post_repr(app):
    with app.app_context():
        user = User(username="z", password="1")
        db.session.add(user)
        db.session.commit()
        post = Post(text="hello there", user_id=user.id)
        db.session.add(post)
        db.session.commit()
        assert "hello" in repr(post)
