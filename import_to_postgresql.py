#!/usr/bin/env python
"""
Import JSON data into PostgreSQL database.

This script imports data that was exported from SQLite into PostgreSQL.

Usage:
    python import_to_postgresql.py
"""

import os
import sys
import subprocess
from pathlib import Path

# Add backend to Python path
BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / 'backend'
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BACKEND_DIR))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

def main():
    print("=" * 70)
    print("PostgreSQL Data Import Tool")
    print("=" * 70)
    
    # Check if data directory exists
    data_dir = BASE_DIR / 'migration_data'
    if not data_dir.exists():
        print(f"❌ Error: Migration data directory not found: {data_dir}")
        print("   Please run export_sqlite_data.py first!")
        sys.exit(1)
    
    # Check for main data file
    main_file = data_dir / 'sqlite_data.json'
    if not main_file.exists():
        print(f"❌ Error: Data file not found: {main_file}")
        print("   Please run export_sqlite_data.py first!")
        sys.exit(1)
    
    print(f"✓ Found data file: {main_file}")
    print(f"  Size: {main_file.stat().st_size / 1024 / 1024:.2f} MB")
    
    # Check DATABASE_URL
    db_url = os.environ.get('DATABASE_URL', '')
    if 'postgresql' not in db_url.lower():
        print("\n⚠️  WARNING: DATABASE_URL is not set to PostgreSQL!")
        print(f"   Current: {db_url or 'Not set'}")
        print("\n   To import to PostgreSQL, set DATABASE_URL:")
        print("   export DATABASE_URL=postgresql://church_user:password@localhost:5432/church_platform")
        response = input("\n   Continue anyway? (y/N): ")
        if response.lower() != 'y':
            sys.exit(0)
    else:
        print(f"✓ Using PostgreSQL database")
    
    # Import data
    print(f"\n📥 Importing data into PostgreSQL...")
    print("   This may take several minutes for large databases...")
    
    try:
        cmd = [
            sys.executable,
            str(BACKEND_DIR / 'manage.py'),
            'loaddata',
            str(main_file),
        ]
        
        result = subprocess.run(
            cmd,
            cwd=BACKEND_DIR,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"❌ Error importing data:")
            print(result.stderr)
            
            # Try importing individual app files
            print("\n⚠️  Main import failed. Trying individual app imports...")
            import_individual_apps(data_dir)
        else:
            print("✅ Data imported successfully!")
            if result.stdout:
                print(result.stdout)
        
        print("\n" + "=" * 70)
        print("✅ Import Complete!")
        print("=" * 70)
        print("\nNext steps:")
        print("1. Verify data: docker-compose exec web python backend/manage.py dbshell")
        print("2. Create superuser if needed: docker-compose exec web python backend/manage.py createsuperuser")
        print("3. Start application: docker-compose up -d")
        print("=" * 70)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

def import_individual_apps(data_dir):
    """Import data from individual app files."""
    apps = ['users', 'content', 'interactions', 'email_campaigns', 'moderation']
    
    for app in apps:
        app_file = data_dir / f'{app}_data.json'
        if not app_file.exists():
            print(f"   ⚠ Skipping {app}: file not found")
            continue
        
        print(f"\n   Importing {app}...")
        cmd = [
            sys.executable,
            str(BACKEND_DIR / 'manage.py'),
            'loaddata',
            str(app_file),
        ]
        
        result = subprocess.run(
            cmd,
            cwd=BACKEND_DIR,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print(f"   ✓ {app} imported successfully")
        else:
            print(f"   ❌ {app} import failed:")
            print(f"      {result.stderr}")

if __name__ == '__main__':
    main()
