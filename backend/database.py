import os
from pathlib import Path
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env from the project root
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB Atlas
client = MongoClient(MONGO_URI)

# Select database
db = client["college_service_db"]

# Select collection
requests_collection = db["requests"]