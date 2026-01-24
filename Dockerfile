# Use official Python image as base
FROM python:3.13-slim

# Install Node.js for React build
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy everything
COPY . /app

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r backend/requirements.txt

# Build React frontend
WORKDIR /app
RUN cd frontend && npm install && CI=false npm run build

# Collect Django static files
ENV DJANGO_SETTINGS_MODULE=backend.settings
RUN python backend/manage.py collectstatic --noinput

# Expose port (Django default)
EXPOSE 8000

# Start Django server
CMD ["python", "backend/manage.py", "runserver", "0.0.0.0:8000"]
