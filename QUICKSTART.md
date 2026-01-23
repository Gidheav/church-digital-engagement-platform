# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Prerequisites
- Python 3.11+ installed
- Node.js 18+ installed
- PostgreSQL 14+ (for production) or SQLite (auto-configured for dev)

---

## Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Activate virtual environment (already created)
..\venv\Scripts\activate       # Windows
source ../venv/bin/activate    # Linux/Mac

# 3. Dependencies are already installed, but if needed:
pip install -r requirements.txt

# 4. Copy environment file
copy .env.example .env         # Windows
cp .env.example .env           # Linux/Mac

# 5. Migrations are already applied, but if needed:
python manage.py migrate

# 6. Create your admin account
python manage.py createsuperuser
# Follow prompts: enter email, first name, last name, password

# 7. Start the server
python manage.py runserver
```

**Backend is now running at:** http://localhost:8000
- Admin: http://localhost:8000/admin/
- API Docs: http://localhost:8000/api/v1/docs/

---

## Frontend Setup

```bash
# 1. Open a NEW terminal and navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Copy environment file
copy .env.example .env         # Windows
cp .env.example .env           # Linux/Mac

# 4. Start the development server
npm start
```

**Frontend is now running at:** http://localhost:3000

---

## Verify Everything Works

### Test Backend
1. Open http://localhost:8000/admin/
2. Login with your superuser credentials
3. You should see the Users section

### Test API
1. Open http://localhost:8000/api/v1/docs/
2. You should see Swagger API documentation

### Test Frontend
1. Open http://localhost:3000
2. You should see placeholder routes

---

## What's Next?

Now that everything is running, you're ready to start implementing features!

**Recommended first steps:**
1. Review [PROJECT_STATUS.md](PROJECT_STATUS.md) for full project overview
2. Review [instruction.md](instruction.md) for development guidelines
3. Start with Phase 1: Implement authentication endpoints
4. Follow the backend-first approach as outlined in the instructions

---

## Common Issues

### Backend won't start
- Check if port 8000 is already in use
- Verify virtual environment is activated
- Ensure all migrations are applied: `python manage.py migrate`

### Frontend won't start
- Check if port 3000 is already in use
- Delete node_modules and run `npm install` again
- Clear npm cache: `npm cache clean --force`

### Database errors
- For development, SQLite is used by default (no setup needed)
- For PostgreSQL, ensure connection string in .env is correct
- Verify database exists: `python manage.py dbshell`

---

## Need Help?

- **Documentation:** Check README.md and PROJECT_STATUS.md
- **Guidelines:** Review instruction.md
- **Django Docs:** https://docs.djangoproject.com/
- **React Docs:** https://react.dev/

---

**Happy Coding! 🎉**
