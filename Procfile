# Render deployment — start the Django API server via Gunicorn
# Render automatically runs this when deploying
web: cd backend && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 4 --threads 2 --worker-tmp-dir /dev/shm --log-level info --access-logfile - --error-logfile -
