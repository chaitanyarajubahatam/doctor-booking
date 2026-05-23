# 🏥 MediBook — Doctor Appointment Booking System

A full-stack appointment booking system built with **React + FastAPI + PostgreSQL**.
Perfect for interviews — covers CRUD, relational DB design, JWT auth, and role-based access control.

---

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL running locally

---

### 1. Set up the database

```bash
createdb doctor_booking
```

### 2. Run the backend

```bash
cd backend
pip install -r requirements.txt

# Configure environment (optional — defaults work for local dev)
cp .env.example .env   # edit DATABASE_URL if needed

# Seed sample data
python seed.py

# Start the API server
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

App available at: http://localhost:5173

---

## 🔐 Demo Credentials (after seeding)

| Role    | Email                     | Password    |
|---------|---------------------------|-------------|
| Admin   | admin@hospital.com        | admin123    |
| Doctor  | drrao@hospital.com        | doctor123   |
| Patient | patient1@example.com      | patient123  |

---

## 🗂 Project Structure

```
doctor-booking/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   │   ├── auth.py
│   │   │   ├── doctors.py
│   │   │   ├── appointments.py
│   │   │   └── admin.py
│   │   ├── core/         # Config, DB, security
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/       # SQLAlchemy ORM models
│   │   └── schemas/      # Pydantic schemas
│   ├── main.py           # FastAPI entry point
│   ├── seed.py           # Sample data seeder
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/          # Axios API client
        ├── components/   # Shared UI components
        ├── context/      # Auth context
        └── pages/        # Auth, Patient, Doctor, Admin pages
```

---

## 🏛 Database Schema

```
users
├── id, email (unique), full_name, hashed_password
├── role: patient | doctor | admin
├── phone, is_active, created_at

doctor_profiles
├── id, user_id (FK → users)
├── specialization, qualification, experience_years
├── bio, consultation_fee, is_available

doctor_schedules
├── id, doctor_id (FK → doctor_profiles)
├── day_of_week, start_time, end_time
├── slot_duration_minutes, is_active

appointments
├── id, patient_id (FK → users), doctor_id (FK → doctor_profiles)
├── appointment_date, appointment_time
├── status: pending | confirmed | cancelled | completed
├── reason, notes, created_at
```

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| POST   | /api/auth/register  | Register new user   |
| POST   | /api/auth/login     | Login, get JWT      |
| GET    | /api/auth/me        | Current user info   |

### Doctors
| Method | Endpoint                          | Auth        |
|--------|-----------------------------------|-------------|
| GET    | /api/doctors                      | Public      |
| GET    | /api/doctors/{id}                 | Public      |
| POST   | /api/doctors/profile              | Doctor      |
| PUT    | /api/doctors/profile              | Doctor      |
| POST   | /api/doctors/schedules            | Doctor      |
| DELETE | /api/doctors/schedules/{id}       | Doctor      |
| GET    | /api/doctors/{id}/available-slots | Public      |

### Appointments
| Method | Endpoint                    | Auth         |
|--------|-----------------------------|--------------|
| POST   | /api/appointments           | Patient      |
| GET    | /api/appointments/my        | Any          |
| PATCH  | /api/appointments/{id}      | Any          |
| DELETE | /api/appointments/{id}      | Patient/Admin|

### Admin
| Method | Endpoint                          | Auth  |
|--------|-----------------------------------|-------|
| GET    | /api/admin/stats                  | Admin |
| GET    | /api/admin/users                  | Admin |
| GET    | /api/admin/doctors                | Admin |
| GET    | /api/admin/appointments           | Admin |
| PATCH  | /api/admin/appointments/{id}      | Admin |
| PATCH  | /api/admin/users/{id}/deactivate  | Admin |

---

## 🎯 Interview Discussion Points

**1. Role-based access control**
JWT tokens carry user ID; `require_role()` dependency enforces access per endpoint.

**2. Conflict detection**
Appointment booking checks for existing `pending/confirmed` slots at the same time.

**3. Slot generation**
`/available-slots` dynamically generates time slots from doctor's schedule and subtracts already-booked slots.

**4. Relational design**
`DoctorProfile` is separate from `User` (one-to-one) to allow patients to also be users without doctor fields.

**5. Schema validation**
Pydantic schemas validate all input/output; models are separate from schemas (clean separation of concerns).

---

## 🌱 Future Enhancements
- Email notifications (FastAPI-Mail)
- Payment integration (Razorpay)
- Video consultation link (Zoom API)
- Doctor ratings & reviews
- Admin analytics charts
- Docker + docker-compose for deployment
