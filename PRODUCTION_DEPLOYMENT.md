# ============================================================================
# Production Deployment Guide - Church Digital Engagement Platform
# ============================================================================

## Prerequisites
- Docker and Docker Compose installed
- Domain name configured (for production)
- SSL certificate (Let's Encrypt recommended)
- Production environment variables configured

## Quick Start

### 1. Configure Environment Variables
```bash
# Copy the example environment file
cp .env.production.example .env.production

# Edit with your production values
nano .env.production
```

### 2. Build and Run with Docker Compose
```bash
# Build the application
docker-compose build

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f web
```

### 3. Run Database Migrations
```bash
docker-compose exec web python backend/manage.py migrate
```

### 4. Create Superuser
```bash
docker-compose exec web python backend/manage.py createsuperuser
```

## Production Deployment Options

### Option 1: Docker Compose (Recommended for small to medium deployments)
```bash
# Start all services
docker-compose up -d

# Access application at http://localhost:8000
# Access Django admin at http://localhost:8000/admin
# Access API docs at http://localhost:8000/api/v1/docs
```

### Option 2: Single Docker Container (Simple deployment)
```bash
# Build the image
docker build -t church-platform:latest .

# Run with environment file
docker run -d \
  --name church-platform \
  -p 8000:8000 \
  --env-file .env.production \
  church-platform:latest

# Run migrations
docker exec church-platform python backend/manage.py migrate

# Create superuser
docker exec -it church-platform python backend/manage.py createsuperuser
```

### Option 3: Cloud Deployment (AWS, Azure, GCP)

#### AWS Elastic Container Service (ECS)
1. Push image to Amazon ECR
2. Create ECS task definition
3. Configure load balancer
4. Set up RDS for PostgreSQL
5. Configure ElastiCache for Redis

#### Azure Container Apps
1. Push image to Azure Container Registry
2. Create container app
3. Configure Azure Database for PostgreSQL
4. Set up Azure Cache for Redis

#### Google Cloud Run
1. Push image to Google Container Registry
2. Deploy to Cloud Run
3. Configure Cloud SQL for PostgreSQL
4. Set up Memorystore for Redis

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
│                                                             │
│  React SPA (served from Django static files)               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Nginx (Optional)                          │
│  - SSL Termination                                          │
│  - Static file serving                                      │
│  - Load balancing                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Django + Gunicorn (Port 8000)                  │
│                                                             │
│  ┌─────────────────────────────────────────────┐           │
│  │  React Static Files (Whitenoise)            │           │
│  │  - Served at /                               │           │
│  │  - All routes → index.html                   │           │
│  └─────────────────────────────────────────────┘           │
│                                                             │
│  ┌─────────────────────────────────────────────┐           │
│  │  REST API (Django REST Framework)           │           │
│  │  - /api/v1/* endpoints                       │           │
│  │  - JWT authentication                        │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                    │                    │
                    ▼                    ▼
    ┌──────────────────────┐  ┌──────────────────────┐
    │   PostgreSQL         │  │   Redis              │
    │   (Database)         │  │   (Cache/Celery)     │
    └──────────────────────┘  └──────────────────────┘
```

## How It Works

### 1. Static File Serving (React + Django)
- React build output is copied to `/app/frontend-build` in Docker
- Django's `STATICFILES_DIRS` includes the React build directory
- `collectstatic` gathers React files into `/app/backend/staticfiles`
- Whitenoise serves static files directly from Django (no separate web server needed)

### 2. Routing Strategy
```
Request Flow:
1. User visits http://yoursite.com/
   → Django catches ALL routes (re_path r'^.*$')
   → ReactAppView serves index.html
   → React Router takes over client-side routing

2. API requests: http://yoursite.com/api/v1/*
   → Django REST Framework handles the request
   → Returns JSON response
   → React receives and processes data

3. Static assets: http://yoursite.com/static/main.js
   → Whitenoise serves from staticfiles directory
   → Cached and compressed for performance
```

### 3. Production Optimizations Implemented

#### Dockerfile
✓ Multi-stage build (separate frontend and backend builds)
✓ Minimized image size (alpine for Node, slim for Python)
✓ Non-root user for security
✓ Health checks for monitoring
✓ Optimized Gunicorn configuration (4 workers, 2 threads)
✓ Production environment variables
✓ Proper layer caching

#### Django Settings
✓ Whitenoise for efficient static file serving
✓ Compressed and manifest static storage
✓ CORS configuration for API access
✓ Security middleware enabled
✓ CSRF protection
✓ Static files collected from React build

#### URL Configuration
✓ API routes at `/api/v1/*`
✓ Django admin at `/admin/`
✓ React app catches all other routes
✓ Proper route precedence (API → Admin → React)

## Maintenance Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f db
docker-compose logs -f celery
```

### Database Operations
```bash
# Create migration
docker-compose exec web python backend/manage.py makemigrations

# Apply migrations
docker-compose exec web python backend/manage.py migrate

# Database shell
docker-compose exec web python backend/manage.py dbshell

# Backup database
docker-compose exec db pg_dump -U church_user church_platform > backup.sql
```

### Application Updates
```bash
# Rebuild after code changes
docker-compose build web

# Restart services
docker-compose restart web

# Or rebuild and restart in one command
docker-compose up -d --build web
```

### Scaling
```bash
# Scale web workers
docker-compose up -d --scale web=3

# Scale Celery workers
docker-compose up -d --scale celery=2
```

## Security Checklist

- [ ] Change SECRET_KEY to a strong random value
- [ ] Set DEBUG=False in production
- [ ] Configure ALLOWED_HOSTS with your domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure CSRF_TRUSTED_ORIGINS
- [ ] Use strong database passwords
- [ ] Enable firewall rules
- [ ] Set up regular backups
- [ ] Configure monitoring and alerting
- [ ] Review CORS settings
- [ ] Enable security headers
- [ ] Use environment variables (never hardcode secrets)

## Performance Optimization

### Database
- Use PostgreSQL (not SQLite) in production
- Set up connection pooling
- Create appropriate indexes
- Regular VACUUM operations

### Caching
- Configure Redis for caching
- Enable Django cache middleware
- Cache API responses where appropriate

### Static Files
- Whitenoise handles compression and caching headers
- CDN can be added for global distribution
- Consider using object storage (S3, Azure Blob) for media files

### Monitoring
```bash
# Application metrics
docker stats

# Database connections
docker-compose exec db psql -U church_user -d church_platform -c "SELECT count(*) FROM pg_stat_activity;"

# Memory usage
docker-compose exec web ps aux --sort=-%mem | head -n 10
```

## Troubleshooting

### React app shows 404
- Ensure `collectstatic` was run: `docker-compose exec web python backend/manage.py collectstatic --noinput`
- Check `STATICFILES_DIRS` includes frontend-build directory
- Verify React build succeeded in Dockerfile

### API requests fail with CORS errors
- Check `CORS_ALLOWED_ORIGINS` in settings
- Verify frontend is making requests to correct domain
- Ensure `corsheaders.middleware.CorsMiddleware` is in MIDDLEWARE

### Static files not loading
- Run `collectstatic` command
- Check STATIC_ROOT and STATIC_URL settings
- Verify Whitenoise is in MIDDLEWARE

### Database connection errors
- Check DATABASE_URL environment variable
- Ensure PostgreSQL service is running: `docker-compose ps db`
- Verify database credentials

## Support

For issues and questions:
- Check Django logs: `docker-compose logs web`
- Check React build: `docker-compose build --no-cache web`
- Review environment variables in `.env.production`
- Verify all services are healthy: `docker-compose ps`
