from fastapi import APIRouter, Depends, HTTPException
from database import prescriptions_col, appointments_col
from models.prescription import PrescriptionCreate
from auth_utils import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])

def serialize(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

@router.post("/create")
async def create_prescription(rx: PrescriptionCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can create prescriptions")
    result = await prescriptions_col.insert_one({
        "appointment_id": rx.appointment_id,
        "patient_id": rx.patient_id,
        "doctor_id": current_user["id"],
        "doctor_name": current_user["name"],
        "medicines": [m.dict() for m in rx.medicines],
        "notes": rx.notes,
        "diagnosis": rx.diagnosis,
        "created_at": datetime.utcnow().isoformat()
    })
    # Mark appointment as completed
    await appointments_col.update_one(
        {"_id": ObjectId(rx.appointment_id)},
        {"$set": {"status": "completed"}}
    )
    return {"message": "Prescription created", "id": str(result.inserted_id)}

@router.get("/patient/{patient_id}")
async def get_patient_prescriptions(patient_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "patient" and current_user["id"] != patient_id:
        raise HTTPException(status_code=403, detail="Access denied")
    rxs = []
    async for doc in prescriptions_col.find({"patient_id": patient_id}).sort("created_at", -1):
        rxs.append(serialize(doc))
    return rxs

@router.get("/appointment/{appt_id}")
async def get_prescription_by_appointment(appt_id: str, current_user: dict = Depends(get_current_user)):
    doc = await prescriptions_col.find_one({"appointment_id": appt_id})
    if not doc:
        return None
    return serialize(doc)