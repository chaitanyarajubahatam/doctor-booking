from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api import auth, doctors, appointments, admin

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Doctor Appointment Booking API",
    description="REST API for booking doctor appointments with role-based access control",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(doctors.router)
app.include_router(appointments.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"message": "Doctor Booking API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
