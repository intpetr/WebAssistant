from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()


class User(db.Model, UserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False)
    password = db.Column(db.String(30), nullable=False)
    #is_active = db.Column(db.Boolean, default=True)
    #role = db.Column(db.String(50), default='user')

    @staticmethod
    def get_by_username(username):
        return User.query.filter_by(username=username).first()
