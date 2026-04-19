from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI

client = AsyncIOMotorClient(MONGO_URI)
db = client["telemedicine"]

users_col = db["users"]
doctors_col = db["doctors"]
appointments_col = db["appointments"]
prescriptions_col = db["prescriptions"]