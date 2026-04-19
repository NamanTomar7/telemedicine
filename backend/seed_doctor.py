"""
Run this script to add doctors from the backend.
Usage: python seed_doctor.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from config import MONGO_URI

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
client = AsyncIOMotorClient(MONGO_URI)
db = client["telemedicine"]

async def seed():
    doctors = [
        {
            "name": "Dr. Aisha Khan",
            "email": "aisha.khan@clinic.com",
            "password": pwd_context.hash("doctor123"),
            "specialization": "General Physician",
            "qualifications": "MBBS, MD",
            "experience_years": 8,
            "phone": "+91-9876543210",
            "available_slots": []
        },
        {
            "name": "Dr. Rajan Mehta",
            "email": "rajan.mehta@clinic.com",
            "password": pwd_context.hash("doctor123"),
            "specialization": "Cardiologist",
            "qualifications": "MBBS, DM Cardiology",
            "experience_years": 14,
            "phone": "+91-9871234567",
            "available_slots": []
        }
    ]
    for doc in doctors:
        existing = await db["doctors"].find_one({"email": doc["email"]})
        if not existing:
            await db["doctors"].insert_one(doc)
            print(f"Inserted doctor: {doc['name']}")
        else:
            print(f"Doctor already exists: {doc['name']}")
    print("Done seeding doctors.")

asyncio.run(seed())