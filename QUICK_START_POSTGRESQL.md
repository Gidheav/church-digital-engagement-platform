# Quick Start: Run Application with PostgreSQL (No Docker Network Required)

Since you have PostgreSQL running in Docker but network issues prevent pulling other images,
you can run Django directly on your local machine connected to the PostgreSQL container.

## Current Status
✅ PostgreSQL running in Docker (port 5432)  
✅ All data migrated from SQLite  
✅ 440 objects loaded successfully  

## Run Django Application (Local)

### 1. Activate Virtual Environment
```powershell
cd "C:\Users\DELL\Desktop\Apps\Church Digital Engagement Platform"
.\venv\Scripts\Activate
```

### 2. Set Database URL
```powershell
$env:DATABASE_URL="postgresql://church_user:ChurchPass2024Strong!@localhost:5432/church_platform"
```

### 3. Run Development Server
```powershell
cd backend
python manage.py runserver 8000
```

### 4. Access Application
- **Admin:** http://localhost:8000/admin/
- **API:** http://localhost:8000/api/v1/
- **Frontend:** Build React first (see below)

## Build React Frontend

### 1. Install Dependencies (if needed)
```powershell
npm install
```

### 2. Build Production React App
```powershell
npm run build
```

This creates `build/` folder that Django will serve as static files.

### 3. Restart Django
After building React, restart the Django server to serve the new build.

## Verify PostgreSQL Connection

### Check Database
```powershell
$env:DATABASE_URL="postgresql://church_user:ChurchPass2024Strong!@localhost:5432/church_platform"
python backend/manage.py shell -c "from django.db import connection; connection.ensure_connection(); print('✅ PostgreSQL connected!')"
```

### View Data
```powershell
# Count records
python backend/manage.py shell -c "
from apps.users.models import User
from apps.content.models import Post
from apps.interactions.models import Comment, Reaction
print(f'Users: {User.objects.count()}')
print(f'Posts: {Post.objects.count()}')
print(f'Comments: {Comment.objects.count()}')
print(f'Reactions: {Reaction.objects.count()}')
"
```

## Create Superuser (if needed)

```powershell
$env:DATABASE_URL="postgresql://church_user:ChurchPass2024Strong!@localhost:5432/church_platform"
python backend/manage.py createsuperuser
```

## Full Docker Deployment (When Network Fixed)

Once Docker can pull images:

```powershell
# Build application
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access at http://localhost:8000
```

## PostgreSQL Management

### Backup Database
```powershell
# Create backup directory
mkdir backups -ErrorAction SilentlyContinue

# Backup
docker-compose exec db pg_dump -U church_user church_platform > "backups/backup_$(Get-Date -Format 'yyyy-MM-dd_HHmmss').sql"
```

### Access PostgreSQL Shell
```powershell
docker-compose exec db psql -U church_user -d church_platform
```

### PostgreSQL Commands (in shell)
```sql
-- List tables
\dt

-- View users
SELECT id, email, first_name, last_name, role FROM users_user;

-- View posts
SELECT id, title, status, published_at FROM content_post;

-- Exit
\q
```

## Stop Services

### Stop Django (Ctrl+C in terminal)

### Stop PostgreSQL
```powershell
docker-compose stop db
```

### Stop All and Remove
```powershell
docker-compose down
```

**Note:** Don't use `-v` flag unless you want to delete the database data!

## Environment Variables Reference

### Production (.env.production - already configured)
- `DATABASE_URL=postgresql://church_user:ChurchPass2024Strong!@db:5432/church_platform`
- `POSTGRES_DB=church_platform`
- `POSTGRES_USER=church_user`
- `POSTGRES_PASSWORD=ChurchPass2024Strong!`

### Local Development (set in PowerShell)
```powershell
$env:DATABASE_URL="postgresql://church_user:ChurchPass2024Strong!@localhost:5432/church_platform"
```

**Key Difference:** 
- Docker uses `@db:5432` (container hostname)
- Local uses `@localhost:5432` (exposed port)

## Troubleshooting

### Cannot connect to PostgreSQL
1. Check container is running: `docker-compose ps`
2. Check port 5432 is exposed: `docker port church-platform-db`
3. Verify password: `docker-compose exec db env | Select-String POSTGRES`

### Django errors
1. Ensure DATABASE_URL is set correctly
2. Check migrations: `python backend/manage.py showmigrations`
3. View Django errors in console output

### Static files not found
1. Build React: `npm run build`
2. Collect static files: `python backend/manage.py collectstatic --noinput`

---

**Quick Commands Cheat Sheet:**

```powershell
# Start PostgreSQL only
docker-compose up -d db

# Run Django locally
$env:DATABASE_URL="postgresql://church_user:ChurchPass2024Strong!@localhost:5432/church_platform"
python backend/manage.py runserver

# Build React
npm run build

# Check data
python backend/manage.py shell -c "from apps.users.models import User; print(f'Users: {User.objects.count()}')"

# Backup database
docker-compose exec db pg_dump -U church_user church_platform > backups/backup.sql
```
