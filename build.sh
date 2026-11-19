#!/usr/bin/env bash
# Render Build Script — runs during each deploy
# Installs Python deps, runs migrations, collects static files

set -o errexit  # Exit on error

echo "==> Installing Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "==> Running database migrations..."
cd backend
python manage.py migrate --noinput

echo "==> Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "==> Build complete."
