from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import require_role
from app.models.user import User, DoctorProfile, Appointment, UserRole, AppointmentStatus
from app.schemas.schemas import UserOut, DoctorOut, AppointmentOut, AdminStats, AppointmentUpdate

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStats)
def get_stats(
    _=Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    return AdminStats(
        total_users=db.query(User).count(),
        total_doctors=db.query(User).filter(User.role == UserRole.doctor).count(),
        total_patients=db.query(User).filter(User.role == UserRole.patient).count(),
        total_appointments=db.query(Appointment).count(),
        pending_appointments=db.query(Appointment).filter(Appointment.status == AppointmentStatus.pending).count(),
        confirmed_appointments=db.query(Appointment).filter(Appointment.status == AppointmentStatus.confirmed).count(),
    )


@router.get("/users", response_model=List[UserOut])
def list_users(
    _=Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get("/doctors", response_model=List[DoctorOut])
def list_all_doctors(
    _=Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    return db.query(DoctorProfile).all()


@router.get("/appointments", response_model=List[AppointmentOut])
def list_all_appointments(
    _=Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    return db.query(Appointment).order_by(Appointment.created_at.desc()).all()


@router.patch("/appointments/{appointment_id}", response_model=AppointmentOut)
def admin_update_appointment(
    appointment_id: int,
    data: AppointmentUpdate,
    _=Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(appt, field, value)
    db.commit()
    db.refresh(appt)
    return appt


@router.patch("/users/{user_id}/deactivate", response_model=UserOut)
def toggle_user(
    user_id: int,
    _=Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user
