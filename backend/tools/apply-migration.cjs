#!/usr/bin/env node
/*
 * Safe migration runner for production-like environments.
 * Usage:
 *   FORCE=1 node tools/apply-migration.cjs --backup=./pre-migrate.dump
 * Options:
 *   --backup=<path>   : create a pg_dump to this path before applying migrations
 *   --dry-run         : print commands without executing
 *   --help            : show help
 *
 * Safety: this script requires either FORCE=1 in environment or --force flag.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Usage: FORCE=1 node tools/apply-migration.cjs [--backup=./file.dump] [--dry-run] [--force]');
  process.exit(1);
}

const args = process.argv.slice(2);
let backupPath = null;
let dryRun = false;
let forceFlag = false;

for (const a of args) {
  if (a.startsWith('--backup=')) backupPath = a.split('=')[1];
  if (a === '--dry-run') dryRun = true;
  if (a === '--force') forceFlag = true;
  if (a === '--help') usage();
}

const hardcore = process.env.FORCE === '1' || forceFlag;
if (!hardcore) {
  console.error('Refusing to run: set FORCE=1 or pass --force to proceed. This is a safety measure.');
  process.exit(2);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is required and not set.');
  process.exit(3);
}

const run = (cmd) => {
  console.log('> ' + cmd);
  if (!dryRun) execSync(cmd, { stdio: 'inherit', env: process.env });
};

(async function main() {
  try {
    console.log('Starting safe migration apply (production mode)');

    if (backupPath) {
      console.log('Creating pg_dump backup to', backupPath);
      const abs = path.resolve(backupPath);
      // If directory doesn't exist, create it
      const dir = path.dirname(abs);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      // Use pg_dump custom format
      run(`pg_dump --format=custom --file=${JSON.stringify(abs)} "${databaseUrl}"`);
      console.log('Backup finished:', abs);
    } else {
      console.log('No backup path provided — skipping pg_dump.');
    }

    console.log('Installing dependencies and running prisma migrate deploy...');
    run('npm ci --no-audit --no-fund');
    run('npx prisma migrate deploy');

    console.log('Running a quick verification query (count rows in PermissionQueryAudit)...');
    try {
      run('npx prisma db execute --sql "select count(*) from \"PermissionQueryAudit\";"');
    } catch (e) {
      console.warn('Warning: verification query failed — check the DB and logs.');
    }

    console.log('Migration deploy finished. Please restart/redeploy the API service so the new schema is picked up.');
  } catch (err) {
    console.error('Migration helper failed:', err && err.message ? err.message : err);
    process.exit(10);
  }
})();
