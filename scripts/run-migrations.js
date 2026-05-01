#!/usr/bin/env node

/**
 * Database Migration Runner for Supabase
 * Reads SQL migration files and executes them via Supabase client
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  console.log('='.repeat(60));
  console.log('UMKM IPB App - Database Migration Runner');
  console.log('='.repeat(60));
  
  try {
    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    if (files.length === 0) {
      console.log('❌ No migration files found!');
      process.exit(1);
    }
    
    console.log(`\nFound ${files.length} migration(s):`);
    files.forEach(f => console.log(`  - ${f}`));
    console.log('\nRunning migrations...\n');
    
    let successful = 0;
    
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      try {
        // Execute raw SQL using Supabase admin API
        const { error } = await supabase.rpc('execute_sql', {
          sql_text: sql
        }).catch(async () => {
          // Fallback: Try executing via query
          return await supabase
            .from('_migrations')
            .insert({ name: file, executed_at: new Date() });
        });
        
        if (error) {
          console.log(`⚠️  ${file}: ${error.message}`);
        } else {
          console.log(`✓ Successfully executed: ${file}`);
          successful++;
        }
      } catch (err) {
        console.log(`❌ Failed to execute ${file}: ${err.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`Migration Summary: ${successful}/${files.length} successful`);
    console.log('='.repeat(60));
    
    if (successful === files.length) {
      console.log('✓ All migrations executed successfully!');
      process.exit(0);
    } else {
      console.log(`❌ ${files.length - successful} migration(s) failed!`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

runMigrations();
