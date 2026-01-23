# Church Digital Engagement Platform

A production-ready digital platform designed to facilitate church community engagement, content management, and member interaction.

## Project Overview

This platform enables churches to:
- Manage digital content (sermons, devotionals, events, announcements)
- Facilitate member registration and authentication
- Enable community interaction through comments and engagement
- Send bulk email campaigns and newsletters
- Moderate user-generated content
- Provide role-based access control for visitors, members, and administrators

## Architecture

**Monorepo Structure:**
- **Backend:** Django + Django REST Framework + PostgreSQL
- **Frontend:** React + TypeScript
- **Authentication:** JWT-based (access + refresh tokens)
- **API:** RESTful, versioned at `/api/v1/`

**Key Design Principles:**
- Backend is the single source of truth
- Role-based access control enforced at API level
- Security-first approach
- No mock data or demo shortcuts
- Production-ready from day one

## Tech Stack

### Backend
- Python 3.11+
- Django 5.x
- Django REST Framework
- PostgreSQL (production)
- JWT authentication
- SMTP email integration

### Frontend
- React 18+
- TypeScript
- Role-aware routing
- API service abstraction layer

## Prerequisites

- Python 3.11 or higher
- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Git

## Local Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd church-digital-platform
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment (if not exists)
python -m venv ../venv
# Windows:
..\venv\Scripts\activate
# Linux/Mac:
source ../venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your local settings (database credentials, secret key, etc.)

# Run migrations
python manage.py migrate

# Create superuser (for admin access)
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with backend API URL

# Run development server
npm start
```

Frontend will be available at: `http://localhost:3000`

## Environment Variables

### Backend (.env)
See `backend/.env.example` for required variables:
- `SECRET_KEY` - Django secret key
- `DEBUG` - Debug mode (False in production)
- `DATABASE_URL` - PostgreSQL connection string
- `EMAIL_HOST`, `EMAIL_PORT`, etc. - SMTP configuration
- `JWT_SECRET_KEY` - JWT signing key
- `ALLOWED_HOSTS` - Comma-separated allowed hosts

### Frontend (.env)
See `frontend/.env.example` for required variables:
- `REACT_APP_API_BASE_URL` - Backend API base URL

## Project Structure

```
/church-digital-platform
├── backend/              # Django backend
│   ├── config/          # Project settings
│   ├── apps/            # Django applications
│   │   ├── users/       # User management & auth
│   │   ├── content/     # Content management
│   │   ├── interactions/# Comments, likes
│   │   ├── email/       # Email campaigns
│   │   └── moderation/  # Content moderation
│   ├── tests/           # Backend tests
│   └── scripts/         # Utility scripts
│
├── frontend/            # React frontend
│   ├── public/          # Static assets
│   └── src/
│       ├── admin/       # Admin portal
│       ├── member/      # Member area
│       ├── public/      # Public-facing pages
│       ├── services/    # API services
│       ├── auth/        # Auth context & logic
│       └── router/      # Routing configuration
│
├── venv/                # Python virtual environment
└── instruction.md       # Developer guidelines
```

## API Documentation

API endpoints are versioned under `/api/v1/`:

- `/api/v1/auth/` - Authentication endpoints
- `/api/v1/users/` - User management
- `/api/v1/content/` - Content management
- `/api/v1/interactions/` - User interactions
- `/api/v1/email/` - Email campaigns
- `/api/v1/moderation/` - Content moderation

Full API documentation available at `/api/v1/docs/` (when server is running).

## User Roles

- **VISITOR** - Unauthenticated or guest users (read-only public content)
- **MEMBER** - Registered church members (can comment, engage)
- **ADMIN** - Church administrators (full access to management)

## Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

Deployment instructions for production environments will be documented separately.

**Production Checklist:**
- Set `DEBUG=False`
- Configure production database
- Set strong `SECRET_KEY` and `JWT_SECRET_KEY`
- Configure ALLOWED_HOSTS
- Set up SSL/TLS
- Configure email SMTP
- Set up static file serving
- Configure CORS properly
- Enable logging and monitoring

## Contributing

Please read [instruction.md](instruction.md) for:
- Coding standards
- Branching strategy
- Commit message conventions
- Security expectations
- Code review process

## Security

- All authentication uses JWT
- Role-based access control on all endpoints
- Environment variables for sensitive data
- No hardcoded credentials
- CORS configured for production domains only
- Input validation on all user inputs
- SQL injection protection via ORM
- XSS protection enabled

## License

[To be determined]

## Support

For issues or questions, contact the development team.
