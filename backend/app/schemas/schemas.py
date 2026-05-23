from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models.user import UserRole, AppointmentStatus, DayOfWeek


# ── Auth Schemas ──────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    phone: Optional[str] = None
    role: UserRole = UserRole.patient


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


# ── User Schemas ──────────────────────────────────────────────
class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    phone: Optional[str]
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ── Doctor Schemas ────────────────────────────────────────────
class DoctorScheduleOut(BaseModel):
    id: int
    day_of_week: DayOfWeek
    start_time: str
    end_time: str
    slot_duration_minutes: int
    is_active: bool

    class Config:
        from_attributes = True


class DoctorScheduleCreate(BaseModel):
    day_of_week: DayOfWeek
    start_time: str
    end_time: str
    slot_duration_minutes: int = 30


class DoctorProfileCreate(BaseModel):
    specialization: str
    qualification: str
    experience_years: int = 0
    bio: Optional[str] = None
    consultation_fee: int = 500


class DoctorProfileUpdate(BaseModel):
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    consultation_fee: Optional[int] = None
    is_available: Optional[bool] = None


class DoctorOut(BaseModel):
    id: int
    specialization: str
    qualification: str
    experience_years: int
    bio: Optional[str]
    consultation_fee: int
    is_available: bool
    user: UserOut
    schedules: List[DoctorScheduleOut] = []

    class Config:
        from_attributes = True


# ── Appointment Schemas ───────────────────────────────────────
class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: str   # "YYYY-MM-DD"
    appointment_time: str   # "HH:MM"
    reason: Optional[str] = None


class AppointmentUpdate(BaseModel):
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None


class AppointmentOut(BaseModel):
    id: int
    appointment_date: str
    appointment_time: str
    status: AppointmentStatus
    reason: Optional[str]
    notes: Optional[str]
    created_at: Optional[datetime]
    patient: UserOut
    doctor: DoctorOut

    class Config:
        from_attributes = True


# ── Admin Schemas ─────────────────────────────────────────────
class AdminStats(BaseModel):
    total_users: int
    total_doctors: int
    total_patients: int
    total_appointments: int
    pending_appointments: int
    confirmed_appointments: int


Token.model_rebuild()
