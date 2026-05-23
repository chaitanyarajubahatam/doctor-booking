from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User, Appointment, DoctorProfile
from app.schemas.schemas import AppointmentCreate, AppointmentUpdate, AppointmentOut

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


@router.post("", response_model=AppointmentOut, status_code=201)
def book_appointment(
    data: AppointmentCreate,
    current_user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db)
):
    doctor = db.query(DoctorProfile).filter(DoctorProfile.id == data.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Check for conflicts
    conflict = db.query(Appointment).filter(
        Appointment.doctor_id == data.doctor_id,
        Appointment.appointment_date == data.appointment_date,
        Appointment.appointment_time == data.appointment_time,
        Appointment.status.in_(["pending", "confirmed"])
    ).first()
    if conflict:
        raise HTTPException(status_code=409, detail="This time slot is already booked")

    appointment = Appointment(
        patient_id=current_user.id,
        doctor_id=data.doctor_id,
        appointment_date=data.appointment_date,
        appointment_time=data.appointment_time,
        reason=data.reason,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.get("/my", response_model=List[AppointmentOut])
def my_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "patient":
        return db.query(Appointment).filter(Appointment.patient_id == current_user.id).order_by(
            Appointment.appointment_date.desc()
        ).all()
    elif current_user.role == "doctor":
        profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user.id).first()
        if not profile:
            return []
        return db.query(Appointment).filter(Appointment.doctor_id == profile.id).order_by(
            Appointment.appointment_date.desc()
        ).all()
    return []


@router.get("/{appointment_id}", response_model=AppointmentOut)
def get_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if current_user.role == "patient" and appt.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return appt


@router.patch("/{appointment_id}", response_model=AppointmentOut)
def update_appointment(
    appointment_id: int,
    data: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Patients can only cancel their own; doctors/admin can do more
    if current_user.role == "patient":
        if appt.patient_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        if data.status and data.status != "cancelled":
            raise HTTPException(status_code=403, detail="Patients can only cancel appointments")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(appt, field, value)
    db.commit()
    db.refresh(appt)
    return appt


@router.delete("/{appointment_id}", status_code=204)
def cancel_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if current_user.role == "patient" and appt.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    appt.status = "cancelled"
    db.commit()
