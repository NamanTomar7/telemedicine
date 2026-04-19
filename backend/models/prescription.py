from pydantic import BaseModel
from typing import List, Optional

class Medicine(BaseModel):
    name: str
    dosage: str
    duration: str
    instructions: Optional[str] = None

class PrescriptionCreate(BaseModel):
    appointment_id: str
    patient_id: str
    medicines: List[Medicine]
    notes: Optional[str] = None
    diagnosis: Optional[str] = None