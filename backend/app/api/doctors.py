from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User, DoctorProfile, DoctorSchedule, Appointment
from app.schemas.schemas import DoctorOut, DoctorProfileCreate, DoctorProfileUpdate, DoctorScheduleCreate, DoctorScheduleOut

router = APIRouter(prefix="/api/doctors", tags=["Doctors"])


@router.get("", response_model=List[DoctorOut])
def list_doctors(
    specialization: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(DoctorProfile).filter(DoctorProfile.is_available == True)
    if specialization:
        query = query.filter(DoctorProfile.specialization.ilike(f"%{specialization}%"))
    return query.all()


@router.get("/{doctor_id}", response_model=DoctorOut)
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(DoctorProfile).filter(DoctorProfile.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor


@router.post("/profile", response_model=DoctorOut)
def create_doctor_profile(
    data: DoctorProfileCreate,
    current_user: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    existing = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Doctor profile already exists")

    profile = DoctorProfile(user_id=current_user.id, **data.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.put("/profile", response_model=DoctorOut)
def update_doctor_profile(
    data: DoctorProfileUpdate,
    current_user: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/schedules", response_model=DoctorScheduleOut)
def add_schedule(
    data: DoctorScheduleCreate,
    current_user: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found. Create profile first.")

    schedule = DoctorSchedule(doctor_id=profile.id, **data.model_dump())
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.delete("/schedules/{schedule_id}", status_code=204)
def delete_schedule(
    schedule_id: int,
    current_user: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user.id).first()
    schedule = db.query(DoctorSchedule).filter(
        DoctorSchedule.id == schedule_id,
        DoctorSchedule.doctor_id == profile.id
    ).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(schedule)
    db.commit()


@router.get("/{doctor_id}/available-slots")
def get_available_slots(
    doctor_id: int,
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    from datetime import datetime
    doctor = db.query(DoctorProfile).filter(DoctorProfile.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Get day of week
    date_obj = datetime.strptime(date, "%Y-%m-%d")
    day_name = date_obj.strftime("%A").lower()

    schedule = next(
        (s for s in doctor.schedules if s.day_of_week == day_name and s.is_active),
        None
    )
    if not schedule:
        return {"slots": [], "message": "Doctor is not available on this day"}

    # Generate time slots
    start_h, start_m = map(int, schedule.start_time.split(":"))
    end_h, end_m = map(int, schedule.end_time.split(":"))
    start_minutes = start_h * 60 + start_m
    end_minutes = end_h * 60 + end_m
    duration = schedule.slot_duration_minutes

    all_slots = []
    current = start_minutes
    while current + duration <= end_minutes:
        h, m = divmod(current, 60)
        all_slots.append(f"{h:02d}:{m:02d}")
        current += duration

    # Remove booked slots
    booked = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == date,
        Appointment.status.in_(["pending", "confirmed"])
    ).all()
    booked_times = {a.appointment_time for a in booked}

    available = [s for s in all_slots if s not in booked_times]
    return {"slots": available, "date": date, "doctor_id": doctor_id}



