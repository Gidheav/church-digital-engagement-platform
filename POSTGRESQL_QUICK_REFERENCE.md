# 🗄️ PostgreSQL Migration - Quick Reference

Complete guide for migrating from SQLite to PostgreSQL in Docker.

## 🎯 Quick Start (3 Steps)

### 1. Export SQLite Data
```powershell
python export_sqlite_data.py
```

### 2. Start PostgreSQL & Run Migrations
```powershell
# Create environment file
cp .env.production.example .env.production
# Edit .env.production with your database password

# Start PostgreSQL
docker-compose up -d db

# Run migrations
docker-compose exec web python backend/manage.py migrate
```

### 3. Import Data
```powershell
# Set environment variable
$env:DATABASE_URL="postgresql://church_user:your_password@localhost:5432/church_platform"

# Import data
python import_to_postgresql.py
```

---

## 📋 Environment Variables

Add to `.env.production`:

```bash
# PostgreSQL Configuration
POSTGRES_DB=church_platform
POSTGRES_USER=church_user
POSTGRES_PASSWORD=your_secure_password_here
DATABASE_URL=postgresql://church_user:your_secure_password_here@db:5432/church_platform
```

---

## 🐳 Docker Commands

### Start Services
```powershell
# PostgreSQL only
docker-compose up -d db

# Full stack (Django + PostgreSQL + Redis + Celery)
docker-compose up -d

# View logs
docker-compose logs -f db
docker-compose logs -f web
```

### Database Operations
```powershell
# Run migrations
docker-compose exec web python backend/manage.py migrate

# Create superuser
docker-compose exec web python backend/manage.py createsuperuser

# PostgreSQL shell
docker-compose exec db psql -U church_user church_platform

# Django shell
docker-compose exec web python backend/manage.py shell
```

### Database Management
```powershell
# Backup database
python manage_database.py backup

# Restore database
python manage_database.py restore

# Database statistics
python manage_database.py stats

# Reset database (WARNING: deletes all data)
python manage_database.py reset

# PostgreSQL shell
python manage_database.py shell
```

---

## 🔍 Verify Migration

### Check Data in PostgreSQL
```powershell
# Connect to database
docker-compose exec db psql -U church_user church_platform

# Count records
SELECT COUNT(*) FROM users_user;
SELECT COUNT(*) FROM content_post;
SELECT COUNT(*) FROM interactions_comment;

# Exit
\q
```

### Check via Django
```powershell
docker-compose exec web python backend/manage.py shell

>>> from apps.users.models import User
>>> from apps.content.models import Post
>>> print(f"Users: {User.objects.count()}")
>>> print(f"Posts: {Post.objects.count()}")
>>> exit()
```

---

## 💾 Backup & Restore

### Create Backup
```powershell
# Using utility script (creates compressed backup)
python manage_database.py backup

# Manual backup
mkdir backups
docker-compose exec db pg_dump -U church_user church_platform > backups/backup.sql
```

### Restore Backup
```powershell
# Using utility script (interactive)
python manage_database.py restore

# Manual restore
cat backups/backup.sql | docker-compose exec -T db psql -U church_user church_platform
```

---

## 🔧 Troubleshooting

### PostgreSQL won't start
```powershell
# Check logs
docker-compose logs db

# Remove old volume and restart
docker-compose down -v
docker-compose up -d db
```

### Import fails with IntegrityError
```powershell
# Import apps in order
python backend/manage.py loaddata migration_data/users.json
python backend/manage.py loaddata migration_data/content.json
python backend/manage.py loaddata migration_data/interactions.json
```

### Can't connect to PostgreSQL
```powershell
# Check if container is running
docker-compose ps

# Check DATABASE_URL
echo $env:DATABASE_URL

# Test connection
docker-compose exec db pg_isready -U church_user
```

### Data already exists error
```powershell
# Reset and try again
python manage_database.py reset
docker-compose exec web python backend/manage.py migrate
python import_to_postgresql.py
```

---

## 📊 Database Statistics

```powershell
# Using utility script
python manage_database.py stats

# Manual queries
docker-compose exec db psql -U church_user church_platform

# Database size
SELECT pg_size_pretty(pg_database_size('church_platform'));

# Table sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Active connections
SELECT COUNT(*) FROM pg_stat_activity WHERE datname = 'church_platform';
```

---

## 🚀 Production Deployment

### Update Environment for Production
```bash
# .env.production
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
POSTGRES_PASSWORD=strong-random-password-here
SECRET_KEY=another-strong-random-key-here
```

### Start Full Application
```powershell
# Build and start
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Access application
# http://localhost:8000
```

---

## 📁 File Structure

```
project/
├── backend/
│   ├── db.sqlite3          # Original SQLite database
│   └── manage.py
├── migration_data/          # Generated by export script
│   ├── sqlite_data.json    # All data
│   ├── users.json          # User data
│   ├── content.json        # Content data
│   └── interactions.json   # Interaction data
├── backups/                 # Database backups
│   └── *.sql.gz
├── export_sqlite_data.py    # Export script
├── import_to_postgresql.py  # Import script
├── manage_database.py       # Database utility
├── docker-compose.yml       # Docker services
└── .env.production          # Environment variables
```

---

## ✅ Migration Checklist

- [ ] Backup current SQLite database
- [ ] Run export_sqlite_data.py
- [ ] Verify JSON files created in migration_data/
- [ ] Create .env.production with PostgreSQL credentials
- [ ] Start PostgreSQL: `docker-compose up -d db`
- [ ] Run migrations: `docker-compose exec web python backend/manage.py migrate`
- [ ] Set DATABASE_URL environment variable
- [ ] Run import_to_postgresql.py
- [ ] Verify data imported correctly
- [ ] Create PostgreSQL backup
- [ ] Test application functionality
- [ ] Update production environment variables
- [ ] Deploy full application

---

## 🆘 Support

For detailed migration steps, see [SQLITE_TO_POSTGRESQL_MIGRATION.md](SQLITE_TO_POSTGRESQL_MIGRATION.md)

For Docker deployment, see [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)

---

## 🔄 Rollback to SQLite

If needed, you can always go back to SQLite:

```powershell
# Stop containers
docker-compose down

# Update .env.production or remove DATABASE_URL
# DATABASE_URL=sqlite:///db.sqlite3

# Your original db.sqlite3 is still in backend/
# Restart application
docker-compose up -d
```
