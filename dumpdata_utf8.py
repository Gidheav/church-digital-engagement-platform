import os
import sys
import django
from pathlib import Path
from io import StringIO

# Add backend directory to Python path
BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / 'backend'
sys.path.insert(0, str(BACKEND_DIR))

# Set Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
os.environ.setdefault("PYTHONIOENCODING", "utf-8")

django.setup()

from django.core.management import call_command

# Create migration_data directory if it doesn't exist
output_dir = BASE_DIR / "migration_data"
output_dir.mkdir(exist_ok=True)

# Export data using Django's dumpdata command
output_path = output_dir / "db.json"

print(f"Exporting SQLite data to {output_path}...")
print("This may take a few minutes for large databases...")

# Capture output to StringIO to handle UTF-8 properly
output_buffer = StringIO()

try:
    call_command(
        'dumpdata',
        '--natural-foreign',
        '--natural-primary',
        '--indent', '2',
        '--exclude', 'contenttypes',
        '--exclude', 'auth.permission',
        '--exclude', 'sessions',
        stdout=output_buffer,
    )
    
    # Write to file with UTF-8 encoding
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output_buffer.getvalue())
    
    print(f"✅ Database dumped successfully to {output_path}")
    print(f"   Size: {output_path.stat().st_size / 1024 / 1024:.2f} MB")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
