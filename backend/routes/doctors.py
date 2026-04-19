from fastapi import APIRouter, Depends
from database import doctors_col
from auth_utils import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/doctors", tags=["doctors"])

def serialize_doctor(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    doc.pop("password", None)
    return doc

@router.get("/")
async def list_doctors(current_user: dict = Depends(get_current_user)):
    doctors = []
    async for doc in doctors_col.find():
        doctors.append(serialize_doctor(doc))
    return doctors

@router.get("/{doctor_id}")
async def get_doctor(doctor_id: str, current_user: dict = Depends(get_current_user)):
    doc = await doctors_col.find_one({"_id": ObjectId(doctor_id)})
    if not doc:
        return {"error": "Doctor not found"}
    return serialize_doctor(doc)