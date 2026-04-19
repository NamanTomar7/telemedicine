from fastapi import APIRouter, HTTPException, status
from datetime import timedelta
from models.user import UserRegister, UserLogin
from database import users_col, doctors_col
from auth_utils import hash_password, verify_password, create_access_token
from config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])

ADMIN_EMAIL = "namantomar776@gmail.com"
ADMIN_PASSWORD = "Naman@2005"  # Change in production

@router.post("/register")
async def register(user: UserRegister):
    existing = await users_col.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(user.password)
    result = await users_col.insert_one({
        "name": user.name,
        "email": user.email,
        "password": hashed,
        "phone": user.phone,
        "role": "patient"
    })
    return {"message": "Registration successful", "id": str(result.inserted_id)}

@router.post("/login")
async def login(credentials: UserLogin):
    role = credentials.role

    if role == "admin":
        if credentials.email != ADMIN_EMAIL or credentials.password != ADMIN_PASSWORD:
            raise HTTPException(status_code=401, detail="Invalid admin credentials")
        token = create_access_token(
            {"sub": "admin", "role": "admin"},
            timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return {"access_token": token, "token_type": "bearer", "role": "admin", "name": "Admin"}

    if role == "doctor":
        user = await doctors_col.find_one({"email": credentials.email})
    else:
        user = await users_col.find_one({"email": credentials.email})

    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(
        {"sub": str(user["_id"]), "role": role},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": role,
        "name": user["name"],
        "id": str(user["_id"])
    }