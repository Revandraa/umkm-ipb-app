#!/usr/bin/env python3
"""
Migration runner for Supabase database
This script reads SQL migration files and executes them against Supabase
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import psycopg2
from psycopg2 import sql

# Load environment variables
load_dotenv()

def get_db_connection():
    """Create connection to Supabase PostgreSQL database"""
    db_url = os.getenv('DATABASE_URL')
    try:
        if db_url and (db_url.startswith('postgresql://') or db_url.startswith('postgres://')):
            # psycopg2 accepts postgresql:// or postgres:// URI
            conn = psycopg2.connect(db_url)
        else:
            conn = psycopg2.connect(
                host=os.getenv('POSTGRES_HOST'),
                database=os.getenv('POSTGRES_DATABASE'),
                user=os.getenv('POSTGRES_USER'),
                password=os.getenv('POSTGRES_PASSWORD'),
                port=int(os.getenv('POSTGRES_PORT', '5432')),
                sslmode='require'
            )
        print("SUCCESS: Connected to Supabase PostgreSQL database")
        return conn
    except Exception as e:
        print(f"ERROR: Failed to connect to database: {e}")
        sys.exit(1)

def run_migration(conn, migration_file):
    """Execute a single migration file"""
    try:
        with open(migration_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        cursor = conn.cursor()
        cursor.execute(sql_content)
        conn.commit()
        cursor.close()
        print(f"SUCCESS: Successfully executed: {migration_file.name}")
        return True
    except Exception as e:
        print(f"ERROR: Failed to execute {migration_file.name}: {e}")
        conn.rollback()
        return False

def get_migrations():
    """Get all migration files sorted by name"""
    # Check in frontend/supabase/migrations first, then root supabase/migrations
    root_dir = Path(__file__).parent.parent
    migrations_dir = root_dir / 'frontend' / 'supabase' / 'migrations'
    if not migrations_dir.exists():
        migrations_dir = root_dir / 'supabase' / 'migrations'
        
    if not migrations_dir.exists():
        print(f"ERROR: Migrations directory not found: checked {root_dir / 'frontend' / 'supabase' / 'migrations'} and {root_dir / 'supabase' / 'migrations'}")
        return []
    
    migrations = sorted([f for f in migrations_dir.glob('*.sql')])
    return migrations

def main():
    print("=" * 60)
    print("UMKM IPB App - Database Migration Runner")
    print("=" * 60)
    
    # Get database connection
    conn = get_db_connection()
    
    # Get migrations
    migrations = get_migrations()
    
    if not migrations:
        print("No migrations found!")
        conn.close()
        sys.exit(1)
    
    print(f"\nFound {len(migrations)} migration(s):")
    for m in migrations:
        print(f"  - {m.name}")
    
    print("\nRunning migrations...\n")
    
    # Execute migrations
    failed = 0
    for migration in migrations:
        if not run_migration(conn, migration):
            failed += 1
    
    # Close connection
    conn.close()
    
    # Print summary
    print("\n" + "=" * 60)
    successful = len(migrations) - failed
    print(f"Migration Summary: {successful}/{len(migrations)} successful")
    
    if failed == 0:
        print("SUCCESS: All migrations executed successfully!")
        print("=" * 60)
        sys.exit(0)
    else:
        print(f"ERROR: {failed} migration(s) failed!")
        print("=" * 60)
        sys.exit(1)

if __name__ == "__main__":
    main()
