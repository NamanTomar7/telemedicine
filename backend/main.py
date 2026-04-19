from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, appointments, doctors, prescriptions, agora, admin

app = FastAPI(title="Telemedicine API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://telemedicine-vi8i5r1nv-namantomar7s-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(appointments.router)
app.include_router(doctors.router)
app.include_router(prescriptions.router)
app.include_router(agora.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {"message": "Telemedicine API is running"}