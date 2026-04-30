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
    try:
        conn = psycopg2.connect(
            host=os.getenv('POSTGRES_HOST'),
            database=os.getenv('POSTGRES_DATABASE'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            port=5432,
            sslmode='require'
        )
        print("✓ Connected to Supabase PostgreSQL database")
        return conn
    except Exception as e:
        print(f"✗ Failed to connect to database: {e}")
        sys.exit(1)

def run_migration(conn, migration_file):
    """Execute a single migration file"""
    try:
        with open(migration_file, 'r') as f:
            sql_content = f.read()
        
        cursor = conn.cursor()
        cursor.execute(sql_content)
        conn.commit()
        cursor.close()
        print(f"✓ Successfully executed: {migration_file}")
        return True
    except Exception as e:
        print(f"✗ Failed to execute {migration_file}: {e}")
        conn.rollback()
        return False

def get_migrations():
    """Get all migration files sorted by name"""
    migrations_dir = Path(__file__).parent.parent / 'supabase' / 'migrations'
    if not migrations_dir.exists():
        print(f"✗ Migrations directory not found: {migrations_dir}")
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
        print("✓ All migrations executed successfully!")
        print("=" * 60)
        sys.exit(0)
    else:
        print(f"✗ {failed} migration(s) failed!")
        print("=" * 60)
        sys.exit(1)

if __name__ == "__main__":
    main()
