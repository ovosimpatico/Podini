from pymongo import MongoClient
from config import MONGODB_URL, SOFTWARE_NAME

client = None
db = None

def init_db():
    global client, db
    db = MongoClient(MONGODB_URL)

def get_db():
    return db[SOFTWARE_NAME]

def close_db():
    global client
    if client:
        client.close()
