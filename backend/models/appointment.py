from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AppointmentCreate(BaseModel):
    doctor_id: str
    date_time: str  # ISO format string
    reason: Optional[str] = None

class AppointmentStatus(BaseModel):
    status: str  # pending | confirmed | completed | cancelled