````markdown
# SAAN HOMES - Construction Management System

Full-stack application for construction project and equipment management.

## 📑 Table of Contents
- [Overview](#overview)
- [Client Application](#client-application)
- [Server Application](#server-application)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)

## 🌟 Overview

SAAN HOMES provides an integrated solution for:
- Equipment rental management
- Project tracking
- User authentication
- File management
- Notifications system

## 💻 Client Application

### Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS
- TypeScript
- React Query
- Framer Motion

### Setup
```bash
cd client
npm install
npm run dev
```

### Client Features
- Interactive dashboard
- Real-time notifications
- Equipment booking calendar
- Responsive design
- Profile management

## ⚙️ Server Application

### Tech Stack
- Django 4.2
- PostgreSQL
- Django REST Framework
- JWT Authentication
- pytest

### Setup
```bash
cd server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Server Features
- RESTful API endpoints
- File upload handling
- Authentication system
- Database management
- Email notifications

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Git

### Environment Configuration
```bash
# Client
cd client
cp .env.example .env.local

# Server
cd server
cp .env.example .env
```

## 📁 Project Structure
```
saan_homes/
├── client/
│   ├── app/
│   ├── components/
│   └── public/
├── server/
│   ├── backend/
│   ├── equipments/
│   ├── projects/
│   └── userAccounts/
└── README.md
```

## 🔧 Available Scripts

### Client
```bash
npm run dev        # Start development server
npm run build      # Build production
npm run test       # Run tests
```

### Server
```bash
python manage.py runserver          # Start Django server
python manage.py test              # Run tests
python manage.py makemigrations    # Create migrations
```

## 📝 API Documentation
- API Root: `http://localhost:8000/api/`
- Swagger Docs: `http://localhost:8000/api/docs/`
- Admin Panel: `http://localhost:8000/admin/`

## 🤝 Contributing
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📜 License
© 2025 SAAN HOMES. All rights reserved.

## 📞 Contact
- Email: info@saanhomes.com
- Phone: (123) 456-7890
- Address: 123 Construction Ave, City, State
````

