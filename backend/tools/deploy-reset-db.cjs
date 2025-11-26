#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const args = process.argv.slice(2);
const hasFlag = (name) => args.includes(name);
const getArg = (prefix) => {
  const found = args.find((a) => a.startsWith(prefix + '='));
  return found ? found.split('=')[1] : undefined;
};

const FORCE = process.env.FORCE_RESET === '1' || hasFlag('--force') || process.env.FORCE === '1';
const DRY = hasFlag('--dry-run');
const BACKUP_PATH = getArg('--backup') || process.env.BACKUP_PATH;

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`);
  const parts = cmd.split(' ');
  const res = spawnSync(parts.shift(), parts, { stdio: 'inherit', shell: true, ...opts });
  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error(`Command failed: ${cmd}`);
}

function verifyWithPrisma() {
  const script = `node -e "(async()=>{const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); try{ const hl = await prisma.hierarchyLevel.count(); const u = await prisma.user.count(); console.log('VERIFY: HierarchyLevel=',hl,'Users=',u); process.exit(hl>0 && u>0 ? 0 : 2);}catch(e){ console.error('VERIFY FAILED',e.message); process.exit(3); } finally{ await prisma.$disconnect(); }})();"`;
  console.log('\nRunning verification...');
  const res = spawnSync(script, { stdio: 'inherit', shell: true });
  return res.status === 0;
}

function main() {
  console.log('DEPLOY RESET DB script running');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL is not set in environment. Aborting.');
    process.exit(1);
  }

  console.log(`Target DATABASE_URL: ${dbUrl.split('@')[0]}@...`);

  if (!FORCE) {
    console.error('\n*** SAFETY: destructive operation aborted. You must explicitly confirm.');
    console.error('Set environment variable FORCE_RESET=1 or pass --force to proceed.');
    console.error('Example: FORCE_RESET=1 node tools/deploy-reset-db.cjs --force');
    console.error('Use --dry-run to see the commands without executing.');
    process.exit(2);
  }

  if (DRY) {
    console.log('\n--dry-run: the following commands would run (no changes will be made)');
    console.log(' npx prisma migrate reset --force  # (destructive) drop db & re-apply migrations & seed');
    console.log(' or: npx prisma migrate deploy && npm run seed');
    process.exit(0);
  }

  if (BACKUP_PATH) {
    console.log('\nBackup requested to:', BACKUP_PATH);
    console.log('NOTE: backup feature will attempt to call pg_dump if available on PATH.');
    try {
      run(`pg_dump "$${'DATABASE_URL'}" -f "${BACKUP_PATH}"`);
      console.log('Backup complete.');
    } catch (err) {
      console.warn('Backup failed or pg_dump not available. Proceeding anyway. Error:', err.message);
    }
  }

  try {
    console.log('\nSTEP 1: Resetting database (this WILL DROP ALL DATA)');
    run('npx prisma migrate reset --force');

    console.log('\nSTEP 2: Ensure migrations are applied (migrate deploy)');
    run('npx prisma migrate deploy');

    console.log('\nSTEP 3: Run seed script (npm run seed)');
    run('npm run seed');

    const ok = verifyWithPrisma();
    if (!ok) {
      console.error('\nVerification failed: expected tables/rows were not present.');
      process.exit(10);
    }

    console.log('\nSUCCESS: Database reset, migrations applied, seeds run, and verification passed.');
  } catch (err) {
    console.error('\nERROR: deploy-reset-db failed:', err.message);
    process.exit(11);
  }
}

main();
