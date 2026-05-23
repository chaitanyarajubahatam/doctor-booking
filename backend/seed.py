"""
Seed script — populates the DB with sample data for demo/interview.
Run: python seed.py
"""
import sys
sys.path.append(".")

from app.core.database import SessionLocal, engine, Base
from app.models.user import User, DoctorProfile, DoctorSchedule, Appointment, UserRole
from app.core.security import get_password_hash

Base.metadata.create_all(bind=engine)
db = SessionLocal()


def seed():
    print("Seeding database...")

    # Admin
    admin = User(
        email="admin@hospital.com",
        full_name="Admin User",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.admin,
        phone="9000000000",
    )
    db.add(admin)

    # Doctors
    doctors_data = [
        {"email": "drrao@hospital.com", "full_name": "Dr. Ramesh Rao", "phone": "9111111111",
         "spec": "Cardiologist", "qual": "MBBS, MD (Cardiology)", "exp": 15, "fee": 800,
         "bio": "Senior cardiologist with 15 years of experience in interventional cardiology."},
        {"email": "drpriya@hospital.com", "full_name": "Dr. Priya Sharma", "phone": "9222222222",
         "spec": "Dermatologist", "qual": "MBBS, MD (Dermatology)", "exp": 8, "fee": 600,
         "bio": "Expert in medical and cosmetic dermatology."},
        {"email": "drkumar@hospital.com", "full_name": "Dr. Vikram Kumar", "phone": "9333333333",
         "spec": "Orthopedic Surgeon", "qual": "MBBS, MS (Ortho)", "exp": 12, "fee": 700,
         "bio": "Specializes in joint replacement and sports medicine."},
        {"email": "dranita@hospital.com", "full_name": "Dr. Anita Patel", "phone": "9444444444",
         "spec": "Pediatrician", "qual": "MBBS, MD (Pediatrics)", "exp": 10, "fee": 500,
         "bio": "Dedicated to child health and well-being."},
    ]

    schedules = [
        [("monday", "09:00", "17:00"), ("wednesday", "09:00", "17:00"), ("friday", "09:00", "13:00")],
        [("tuesday", "10:00", "18:00"), ("thursday", "10:00", "18:00"), ("saturday", "09:00", "13:00")],
        [("monday", "08:00", "14:00"), ("tuesday", "08:00", "14:00"), ("thursday", "08:00", "14:00")],
        [("monday", "09:00", "17:00"), ("wednesday", "09:00", "17:00"), ("friday", "09:00", "17:00")],
    ]

    doctor_users = []
    for i, d in enumerate(doctors_data):
        user = User(
            email=d["email"],
            full_name=d["full_name"],
            hashed_password=get_password_hash("doctor123"),
            role=UserRole.doctor,
            phone=d["phone"],
        )
        db.add(user)
        db.flush()
        doctor_users.append(user)

        profile = DoctorProfile(
            user_id=user.id,
            specialization=d["spec"],
            qualification=d["qual"],
            experience_years=d["exp"],
            consultation_fee=d["fee"],
            bio=d["bio"],
        )
        db.add(profile)
        db.flush()

        for day, start, end in schedules[i]:
            db.add(DoctorSchedule(
                doctor_id=profile.id,
                day_of_week=day,
                start_time=start,
                end_time=end,
                slot_duration_minutes=30,
            ))

    # Patients
    patients_data = [
        {"email": "patient1@example.com", "full_name": "Arjun Mehta", "phone": "9555555551"},
        {"email": "patient2@example.com", "full_name": "Sneha Iyer", "phone": "9555555552"},
        {"email": "patient3@example.com", "full_name": "Rohan Gupta", "phone": "9555555553"},
    ]
    for p in patients_data:
        db.add(User(
            email=p["email"],
            full_name=p["full_name"],
            hashed_password=get_password_hash("patient123"),
            role=UserRole.patient,
            phone=p["phone"],
        ))

    db.commit()
    print("✅ Seeded: 1 admin, 4 doctors, 3 patients")
    print("\nLogin credentials:")
    print("  Admin:   admin@hospital.com / admin123")
    print("  Doctor:  drrao@hospital.com / doctor123")
    print("  Patient: patient1@example.com / patient123")


if __name__ == "__main__":
    try:
        seed()
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()
