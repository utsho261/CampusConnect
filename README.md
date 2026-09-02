# 🎓 CampusConnect — All-in-One University Platform

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Django](https://img.shields.io/badge/Django-5.1-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/DRF-3.15-red?logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![JWT Auth](https://img.shields.io/badge/Auth-SimpleJWT-orange)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**CampusConnect** is a comprehensive, modern university community and management ecosystem designed to bridge the gap between students, clubs, faculty, and campus administration. It streamlines academic resource sharing, extracurricular activities, emergency support, peer-to-peer campus commerce, and student verification in a unified, beautiful web experience.

---

## 🌟 Key Features

### 📚 1. Academic Hub
- **Notes Repository**: Upload, filter, search, and download verified lecture notes by department, intake, and course.
- **CT Question Bank**: Previous class test questions categorized by course code, teacher, and intake.
- **Assignment Cover Generator**: Live interactive cover page builder with custom templates and instant PDF generation.
- **Jobs & Internships Board**: Campus recruiting, part-time jobs, and research internship postings.

### 🏛️ 2. Clubs & Events Hub
- **Club Directory**: Discover student clubs, apply for memberships, and follow updates.
- **Community Feed & Posts**: Social feed with post likes, comments, announcements, and rich media.
- **Events & Ticketing/Registration**: Event calendar, upcoming notices, and single-click event registrations.
- **Club Admin Claim**: Verified student club leads can claim and manage their club pages.

### 🛒 3. Campus Marketplace & Lost/Found
- **Peer-to-Peer Marketplace**: Buy and sell used books, calculators, electronics, lab equipment, and stationery safely within campus.
- **Lost & Found System**: Report lost or found campus items with images, date, location, and contact numbers.
- **In-App Messaging**: Real-time buyer-seller chat for seamless negotiation and handoffs.

### 🩸 4. Blood Donation Network
- **Donor Directory**: Search active student blood donors by blood group (`A+`, `B+`, `O+`, `AB+`, etc.), department, and intake.
- **Urgent Requests**: Broadcast urgent blood requirements across campus.

### 🚨 5. Emergency Services & Helplines
- Quick access to campus security, medical center, ambulance contacts, proctor office, and emergency helplines.

### 🏆 6. Community Gamification & Leaderboard
- Top student contributors ranked by notes uploaded, blood donations, and community helpfulness badges.

### 🔐 7. Security & User Management
- **Role-Based Access Control (RBAC)**: Student, Club Admin, and Super Admin roles.
- **Student ID Card Verification**: Front/back campus ID card uploads to ensure a safe, student-only platform.
- **JWT Authentication**: Secure stateless authentication with automatic access token refreshing.
- **Dark / Light Mode & Multilingual**: Theme switching and dual language support (English / বাংলা).

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide React, Axios, React Router v7, HTML2PDF |
| **Backend** | Python 3.13+, Django 5.1, Django REST Framework (DRF), SimpleJWT |
| **Database** | PostgreSQL (Neon DB / Production) / SQLite (Local Dev) |
| **Media Storage** | Cloudinary / Local Media Storage |
| **Email Delivery** | Anymail (Brevo / Sendinblue) / SMTP |

---

## 📂 Project Structure

```text
campusconnect/
├── backend/                  # Django REST API
│   ├── academic/             # Notes, CT questions, assignment templates, jobs
│   ├── accounts/             # Custom User model, auth, ID verification, profiles
│   ├── blood_donation/       # Donor listings and urgent blood requests
│   ├── clubs/                # Clubs, applications, feed posts, events
│   ├── config/               # Django settings, root URLs, WSGI/ASGI
│   ├── emergency/            # Emergency contact directory
│   ├── leaderboard/          # Gamification points and rankings
│   ├── marketplace/          # Buy/Sell items and Lost & Found listings
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/                 # React + Vite Frontend
    ├── public/               # Static assets & icons
    ├── src/
    │   ├── assets/           # Images & graphics
    │   ├── components/       # Reusable UI components & modals
    │   ├── contexts/         # Auth, Theme, Language state providers
    │   ├── layouts/          # App shells for Clubs, Marketplace, Emergency
    │   ├── pages/            # Page views (Dashboard, Notes, Clubs, Market, etc.)
    │   ├── services/         # Axios API client & endpoints
    │   ├── styles/           # Global styles
    │   ├── App.jsx           # Main router & routes
    │   └── main.jsx          # App entrypoint
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.13+** installed
- **Node.js 18+** & **npm** installed
- **Git** installed

---

### 1️⃣ Backend Setup (Django)

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create a virtual environment
python -m venv .venv

# 3. Activate the virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# macOS / Linux:
source .venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Configure environment variables (.env)
# Create a .env file based on .env.example
cp .env.example .env

# 6. Apply database migrations
python manage.py migrate

# 7. (Optional) Create a superuser for admin panel
python manage.py createsuperuser

# 8. Start the Django development server
python manage.py runserver 127.0.0.1:8000
```

> **Backend API URL**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)  
> **Admin Dashboard**: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

### 2️⃣ Frontend Setup (React + Vite)

```bash
# 1. Navigate to the frontend directory
cd ../frontend

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

> **Frontend Application URL**: [http://localhost:5173/](http://localhost:5173/)

---

## ⚙️ Environment Configuration

Create a `.env` file inside the `backend/` directory:

```env
DEBUG=True
SECRET_KEY=your_django_secret_key_here

# Database Configuration (leave empty or use sqlite for local development)
DATABASE_URL=postgresql://user:password@host:port/dbname

# Cloudinary (Media Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email / Notifications (Brevo / SMTP)
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
BREVO_API_KEY=your_brevo_api_key
```

For the `frontend/` directory (optional `.env`):
```env
VITE_API_URL=http://127.0.0.1:8000
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/login/` | Obtain JWT access and refresh tokens |
| `POST` | `/api/token/refresh/` | Refresh JWT access token |
| `POST` | `/api/register/` | Register a new student account |
| `GET/POST` | `/api/notes/` | List and upload study notes |
| `GET/POST` | `/api/ct-questions/` | Class test question repository |
| `GET/POST` | `/api/clubs/` | Browse and create campus clubs |
| `GET/POST` | `/api/clubs/events/` | Events schedule and registrations |
| `GET/POST` | `/api/marketplace/items/` | Marketplace items & listings |
| `GET/POST` | `/api/blood-donors/` | Blood donor search & requests |
| `GET` | `/api/emergency/` | Emergency directory & helplines |
| `GET` | `/api/leaderboard/` | Contributor rankings |

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create:

1. **Fork** the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a **Pull Request**.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  Made with ❤️ for the university student community.
</p>
