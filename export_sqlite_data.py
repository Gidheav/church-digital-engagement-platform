#!/usr/bin/env python
"""
Export SQLite data to JSON for migration to PostgreSQL.

This script exports all data from your SQLite database to JSON files
that can be imported into PostgreSQL.

Usage:
    python export_sqlite_data.py
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
os.environ.setdefault('DATABASE_URL', f'sqlite:///{BACKEND_DIR / "db.sqlite3"}')

def main():
    print("=" * 70)
    print("SQLite Data Export Tool")
    print("=" * 70)
    
    # Check if SQLite database exists
    sqlite_db = BACKEND_DIR / 'db.sqlite3'
    if not sqlite_db.exists():
        print(f"❌ Error: SQLite database not found at {sqlite_db}")
        sys.exit(1)
    
    print(f"✓ Found SQLite database: {sqlite_db}")
    print(f"  Size: {sqlite_db.stat().st_size / 1024 / 1024:.2f} MB")
    
    # Create data directory
    data_dir = BASE_DIR / 'migration_data'
    data_dir.mkdir(exist_ok=True)
    print(f"✓ Export directory: {data_dir}")
    
    # Export data
    output_file = data_dir / 'sqlite_data.json'
    print(f"\n📤 Exporting data to {output_file}...")
    
    try:
        # Use Django's dumpdata command
        cmd = [
            sys.executable,
            str(BACKEND_DIR / 'manage.py'),
            'dumpdata',
            '--natural-foreign',
            '--natural-primary',
            '--indent', '2',
            '--output', str(output_file),
            # Exclude contenttypes and sessions (they'll be recreated)
            '--exclude', 'contenttypes',
            '--exclude', 'auth.permission',
            '--exclude', 'sessions',
        ]
        
        result = subprocess.run(
            cmd,
            cwd=BACKEND_DIR,
            capture_output=True,
            text=True,
            env={**os.environ, 'DATABASE_URL': f'sqlite:///{sqlite_db}'}
        )
        
        if result.returncode != 0:
            print(f"❌ Error exporting data:")
            print(result.stderr)
            sys.exit(1)
        
        print("✅ Data exported successfully!")
        print(f"   File: {output_file}")
        print(f"   Size: {output_file.stat().st_size / 1024 / 1024:.2f} MB")
        
        # Export specific apps separately (optional, for better control)
        print("\n📦 Exporting individual apps...")
        apps = ['users', 'content', 'interactions', 'email_campaigns', 'moderation']
        
        for app in apps:
            app_file = data_dir / f'{app}_data.json'
            cmd = [
                sys.executable,
                str(BACKEND_DIR / 'manage.py'),
                'dumpdata',
                app,
                '--natural-foreign',
                '--natural-primary',
                '--indent', '2',
                '--output', str(app_file),
            ]
            
            result = subprocess.run(
                cmd,
                cwd=BACKEND_DIR,
                capture_output=True,
                text=True,
                env={**os.environ, 'DATABASE_URL': f'sqlite:///{sqlite_db}'}
            )
            
            if result.returncode == 0 and app_file.exists():
                print(f"   ✓ {app}: {app_file.stat().st_size / 1024:.2f} KB")
            else:
                print(f"   ⚠ {app}: No data or app not found")
        
        print("\n" + "=" * 70)
        print("✅ Export Complete!")
        print("=" * 70)
        print("\nNext steps:")
        print("1. Start PostgreSQL: docker-compose up -d db")
        print("2. Run migrations: docker-compose exec web python backend/manage.py migrate")
        print("3. Import data: python import_to_postgresql.py")
        print("=" * 70)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
