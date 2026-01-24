#!/usr/bin/env python
"""
Database Management Utility

Provides common database operations for PostgreSQL in Docker.

Usage:
    python manage_database.py [command]

Commands:
    backup      - Create a database backup
    restore     - Restore from a backup
    reset       - Drop and recreate the database
    shell       - Open PostgreSQL shell
    stats       - Show database statistics
    migrate     - Run Django migrations
"""

import os
import sys
import subprocess
from pathlib import Path
from datetime import datetime
import argparse

BASE_DIR = Path(__file__).resolve().parent

def run_command(cmd, capture=False):
    """Run a shell command."""
    if capture:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.returncode, result.stdout, result.stderr
    else:
        return subprocess.run(cmd, shell=True).returncode

def backup_database():
    """Create a PostgreSQL backup."""
    print("=" * 70)
    print("Database Backup")
    print("=" * 70)
    
    # Create backups directory
    backups_dir = BASE_DIR / 'backups'
    backups_dir.mkdir(exist_ok=True)
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = backups_dir / f'church_platform_{timestamp}.sql'
    
    print(f"Creating backup: {backup_file}")
    
    cmd = f'docker-compose exec -T db pg_dump -U church_user church_platform > "{backup_file}"'
    returncode = run_command(cmd)
    
    if returncode == 0:
        size_mb = backup_file.stat().st_size / 1024 / 1024
        print(f"✅ Backup created successfully!")
        print(f"   File: {backup_file}")
        print(f"   Size: {size_mb:.2f} MB")
        
        # Compress backup
        print("\n Compressing backup...")
        import gzip
        import shutil
        
        gz_file = backup_file.with_suffix('.sql.gz')
        with open(backup_file, 'rb') as f_in:
            with gzip.open(gz_file, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        
        # Remove uncompressed file
        backup_file.unlink()
        
        compressed_size_mb = gz_file.stat().st_size / 1024 / 1024
        print(f"✅ Backup compressed!")
        print(f"   File: {gz_file}")
        print(f"   Size: {compressed_size_mb:.2f} MB")
        print(f"   Compression: {(1 - compressed_size_mb/size_mb)*100:.1f}%")
    else:
        print("❌ Backup failed!")
        sys.exit(1)

def restore_database():
    """Restore PostgreSQL from backup."""
    print("=" * 70)
    print("Database Restore")
    print("=" * 70)
    
    backups_dir = BASE_DIR / 'backups'
    if not backups_dir.exists() or not list(backups_dir.glob('*.sql*')):
        print("❌ No backups found in ./backups/")
        sys.exit(1)
    
    # List available backups
    backups = sorted(backups_dir.glob('*.sql*'), reverse=True)
    print("\nAvailable backups:")
    for i, backup in enumerate(backups, 1):
        size_mb = backup.stat().st_size / 1024 / 1024
        print(f"  {i}. {backup.name} ({size_mb:.2f} MB)")
    
    # Get user selection
    choice = input("\nSelect backup to restore (1-{}): ".format(len(backups)))
    try:
        backup_file = backups[int(choice) - 1]
    except (ValueError, IndexError):
        print("❌ Invalid selection")
        sys.exit(1)
    
    print(f"\n⚠️  WARNING: This will ERASE all current data!")
    print(f"   Restoring from: {backup_file.name}")
    confirm = input("   Type 'YES' to continue: ")
    
    if confirm != 'YES':
        print("Cancelled.")
        sys.exit(0)
    
    # Decompress if needed
    if backup_file.suffix == '.gz':
        print("\nDecompressing backup...")
        import gzip
        sql_file = backup_file.with_suffix('')
        with gzip.open(backup_file, 'rb') as f_in:
            with open(sql_file, 'wb') as f_out:
                f_out.write(f_in.read())
        backup_file = sql_file
    
    print(f"\n Restoring database...")
    cmd = f'cat "{backup_file}" | docker-compose exec -T db psql -U church_user church_platform'
    returncode = run_command(cmd)
    
    if returncode == 0:
        print("✅ Database restored successfully!")
    else:
        print("❌ Restore failed!")
        sys.exit(1)

def reset_database():
    """Drop and recreate the database."""
    print("=" * 70)
    print("Database Reset")
    print("=" * 70)
    print("\n⚠️  WARNING: This will DELETE ALL DATA!")
    confirm = input("   Type 'DELETE ALL DATA' to continue: ")
    
    if confirm != 'DELETE ALL DATA':
        print("Cancelled.")
        sys.exit(0)
    
    print("\n1. Dropping database...")
    cmd = 'docker-compose exec db psql -U church_user -d postgres -c "DROP DATABASE IF EXISTS church_platform;"'
    run_command(cmd)
    
    print("2. Creating database...")
    cmd = 'docker-compose exec db psql -U church_user -d postgres -c "CREATE DATABASE church_platform OWNER church_user;"'
    run_command(cmd)
    
    print("3. Running migrations...")
    cmd = 'docker-compose exec web python backend/manage.py migrate'
    run_command(cmd)
    
    print("\n✅ Database reset complete!")
    print("\n   Next steps:")
    print("   - Create superuser: docker-compose exec web python backend/manage.py createsuperuser")
    print("   - Import data: python import_to_postgresql.py")

def database_shell():
    """Open PostgreSQL shell."""
    print("Opening PostgreSQL shell...")
    print("(Type \\q to exit)")
    cmd = 'docker-compose exec db psql -U church_user church_platform'
    run_command(cmd)

def database_stats():
    """Show database statistics."""
    print("=" * 70)
    print("Database Statistics")
    print("=" * 70)
    
    queries = [
        ("Database Size", "SELECT pg_size_pretty(pg_database_size('church_platform'));"),
        ("Total Tables", "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"),
        ("Active Connections", "SELECT COUNT(*) FROM pg_stat_activity WHERE datname = 'church_platform';"),
    ]
    
    for title, query in queries:
        returncode, stdout, stderr = run_command(
            f'docker-compose exec db psql -U church_user church_platform -t -c "{query}"',
            capture=True
        )
        if returncode == 0:
            print(f"\n{title}: {stdout.strip()}")
    
    # Table sizes
    print("\n" + "-" * 70)
    print("Table Sizes:")
    print("-" * 70)
    
    query = """
    SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    LIMIT 10;
    """
    
    cmd = f'docker-compose exec db psql -U church_user church_platform -c "{query}"'
    run_command(cmd)

def run_migrations():
    """Run Django migrations."""
    print("Running Django migrations...")
    cmd = 'docker-compose exec web python backend/manage.py migrate'
    returncode = run_command(cmd)
    
    if returncode == 0:
        print("✅ Migrations complete!")
    else:
        print("❌ Migrations failed!")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Database Management Utility')
    parser.add_argument('command', choices=['backup', 'restore', 'reset', 'shell', 'stats', 'migrate'],
                        help='Command to execute')
    
    args = parser.parse_args()
    
    commands = {
        'backup': backup_database,
        'restore': restore_database,
        'reset': reset_database,
        'shell': database_shell,
        'stats': database_stats,
        'migrate': run_migrations,
    }
    
    commands[args.command]()

if __name__ == '__main__':
    main()
