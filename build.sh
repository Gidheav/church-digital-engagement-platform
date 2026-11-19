#!/usr/bin/env bash
# Render Build Script — runs during each deploy
# Builds React frontend, installs Python deps, runs migrations, collects static files

set -o errexit  # Exit on error

echo "==> Installing Node dependencies..."
npm ci

echo "==> Building React frontend..."
npm run build

echo "==> Copying frontend build to backend..."
rm -rf backend/frontend-build
cp -r build backend/frontend-build

echo "==> Installing Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "==> Running database migrations..."
cd backend
python manage.py migrate --noinput

echo "==> Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "==> Build complete."
