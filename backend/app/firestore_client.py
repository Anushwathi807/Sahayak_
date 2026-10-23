import firebase_admin
from firebase_admin import credentials, firestore

from app.config import FIREBASE_SERVICE_ACCOUNT_PATH

_app = firebase_admin.initialize_app(credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH))
db = firestore.client(_app)
