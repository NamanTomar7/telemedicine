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
    },
    {
        "name": "Dr. Priya Sharma",
        "email": "priya.sharma@clinic.com",
        "password": pwd_context.hash("doctor123"),
        "specialization": "Dermatologist",
        "qualifications": "MBBS, MD Dermatology",
        "experience_years": 6,
        "phone": "+91-9865432109",
        "available_slots": []
    },
    {
        "name": "Dr. Arjun Verma",
        "email": "arjun.verma@clinic.com",
        "password": pwd_context.hash("doctor123"),
        "specialization": "Orthopedic Surgeon",
        "qualifications": "MBBS, MS Orthopedics",
        "experience_years": 11,
        "phone": "+91-9854321098",
        "available_slots": []
    },
    {
        "name": "Dr. Sneha Patel",
        "email": "sneha.patel@clinic.com",
        "password": pwd_context.hash("doctor123"),
        "specialization": "Pediatrician",
        "qualifications": "MBBS, MD Pediatrics",
        "experience_years": 9,
        "phone": "+91-9843210987",
        "available_slots": []
    },
    {
        "name": "Dr. Vikram Nair",
        "email": "vikram.nair@clinic.com",
        "password": pwd_context.hash("doctor123"),
        "specialization": "Neurologist",
        "qualifications": "MBBS, DM Neurology",
        "experience_years": 16,
        "phone": "+91-9832109876",
        "available_slots": []
    },
    {
        "name": "Dr. Meera Iyer",
        "email": "meera.iyer@clinic.com",
        "password": pwd_context.hash("doctor123"),
        "specialization": "Gynecologist",
        "qualifications": "MBBS, MS Obstetrics & Gynecology",
        "experience_years": 12,
        "phone": "+91-9821098765",
        "available_slots": []
    },
    {
        "name": "Dr. Rohit Gupta",
        "email": "rohit.gupta@clinic.com",
        "password": pwd_context.hash("doctor123"),
        "specialization": "Psychiatrist",
        "qualifications": "MBBS, MD Psychiatry",
        "experience_years": 7,
        "phone": "+91-9810987654",
        "available_slots": []
    },
    {
        "name": "Dr. Ananya Singh",
        "email": "ananya.singh@clinic.com",
        "password": pwd_context.hash("doctor123"),
        "specialization": "Ophthalmologist",
        "qualifications": "MBBS, MS Ophthalmology",
        "experience_years": 10,
        "phone": "+91-9809876543",
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