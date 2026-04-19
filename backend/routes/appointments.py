from fastapi import APIRouter, Depends, HTTPException
from database import appointments_col, doctors_col, users_col
from models.appointment import AppointmentCreate, AppointmentStatus
from auth_utils import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/appointments", tags=["appointments"])

def serialize(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

@router.post("/book")
async def book_appointment(appt: AppointmentCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "patient":
        raise HTTPException(status_code=403, detail="Only patients can book appointments")
    doctor = await doctors_col.find_one({"_id": ObjectId(appt.doctor_id)})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    result = await appointments_col.insert_one({
        "patient_id": current_user["id"],
        "patient_name": current_user["name"],
        "doctor_id": appt.doctor_id,
        "doctor_name": doctor["name"],
        "doctor_specialization": doctor.get("specialization", ""),
        "date_time": appt.date_time,
        "reason": appt.reason,
        "status": "confirmed",
        "created_at": datetime.utcnow().isoformat()
    })
    return {"message": "Appointment booked successfully", "id": str(result.inserted_id)}

@router.get("/my")
async def my_appointments(current_user: dict = Depends(get_current_user)):
    query = {}
    if current_user["role"] == "patient":
        query["patient_id"] = current_user["id"]
    elif current_user["role"] == "doctor":
        query["doctor_id"] = current_user["id"]
    appts = []
    async for doc in appointments_col.find(query).sort("date_time", 1):
        appts.append(serialize(doc))
    return appts

@router.get("/all")  # Admin only
async def all_appointments(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    appts = []
    async for doc in appointments_col.find().sort("date_time", -1):
        appts.append(serialize(doc))
    return appts

@router.patch("/{appt_id}/status")
async def update_status(appt_id: str, body: AppointmentStatus, current_user: dict = Depends(get_current_user)):
    await appointments_col.update_one(
        {"_id": ObjectId(appt_id)},
        {"$set": {"status": body.status}}
    )
    return {"message": "Status updated"}