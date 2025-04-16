const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, 'migrations', 'update_job_status_enum.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration...');
    await pool.query(migrationSQL);
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 