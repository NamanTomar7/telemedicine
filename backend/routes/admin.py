from fastapi import APIRouter, Depends, HTTPException
from database import doctors_col, users_col, appointments_col, prescriptions_col
from models.doctor import DoctorCreate
from auth_utils import get_current_user, hash_password
from bson import ObjectId

router = APIRouter(prefix="/admin", tags=["admin"])

def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/stats")
async def get_stats(admin=Depends(require_admin)):
    return {
        "total_doctors": await doctors_col.count_documents({}),
        "total_patients": await users_col.count_documents({}),
        "total_appointments": await appointments_col.count_documents({}),
        "total_prescriptions": await prescriptions_col.count_documents({})
    }

@router.get("/doctors")
async def list_doctors(admin=Depends(require_admin)):
    doctors = []
    async for doc in doctors_col.find():
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        doc.pop("password", None)
        doctors.append(doc)
    return doctors

@router.get("/patients")
async def list_patients(admin=Depends(require_admin)):
    patients = []
    async for doc in users_col.find():
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        doc.pop("password", None)
        patients.append(doc)
    return patients

@router.get("/appointments")
async def list_appointments(admin=Depends(require_admin)):
    appts = []
    async for doc in appointments_col.find().sort("date_time", -1):
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        appts.append(doc)
    return appts