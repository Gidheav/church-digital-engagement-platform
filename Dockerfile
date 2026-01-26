# ============================================================================
# STAGE 1: Build React Frontend
# ============================================================================
FROM node:22-alpine AS frontend-builder

WORKDIR /frontend-build

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --production=false

# Copy frontend source files
COPY public/ ./public/
COPY src/ ./src/
COPY tsconfig.json ./

# Build optimized production React app
ENV NODE_ENV=production
RUN npm run build


# ============================================================================
# STAGE 2: Build Django Backend + Serve Application
# ============================================================================
FROM python:3.12-slim

# Set environment variables for Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    DJANGO_SETTINGS_MODULE=config.settings

# Set working directory
WORKDIR /app

# Copy backend files
COPY backend/ ./backend/

# Install Python dependencies with timeout and retries
# Using longer timeout for slow connections
RUN pip install \
    --default-timeout=300 \
    --retries 15 \
    --no-cache-dir \
    -r backend/requirements.txt

# Copy React build output from frontend-builder stage INTO backend directory
COPY --from=frontend-builder /frontend-build/build ./backend/frontend-build

# Create necessary directories and set permissions
RUN mkdir -p backend/staticfiles backend/media && \
    useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Collect static files (includes Django admin + frontend build)
RUN python backend/manage.py collectstatic --noinput --clear

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/docs/').read()" || exit 1

# Run Django via Gunicorn with production settings
CMD ["gunicorn", \
    "--chdir", "backend", \
    "--bind", "0.0.0.0:8000", \
    "--workers", "4", \
    "--threads", "2", \
    "--worker-class", "sync", \
    "--worker-tmp-dir", "/dev/shm", \
    "--log-level", "info", \
    "--access-logfile", "-", \
    "--error-logfile", "-", \
    "config.wsgi:application"]
