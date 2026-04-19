from pydantic import BaseModel, EmailStr
from typing import Optional, List

class DoctorCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    specialization: str
    qualifications: str
    experience_years: int
    phone: Optional[str] = None
    available_slots: Optional[List[str]] = []  # e.g. ["2024-01-15T10:00", "2024-01-15T11:00"]