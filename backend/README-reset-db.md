Deploy: Reset DB helper
======================

This repository includes a destructive helper script that will completely remove the current database schema/data, apply migrations and run the seed script. Use it with extreme care — it is intended for controlled deployment automation and testing only.

Location
--------
backend/tools/deploy-reset-db.js

Key safety rules
----------------
- The script is intentionally guarded: you MUST set environment variable `FORCE_RESET=1` or pass the `--force` flag to actually perform destructive operations.
- Prefer creating a backup/snapshot of your production DB before running this on production.

Quick examples
--------------
Dry-run (no changes):

```powershell
cd backend
FORCE_RESET=1 node tools/deploy-reset-db.js --dry-run
```

Reset (destructive) and seed:

```powershell
cd backend
FORCE_RESET=1 node tools/deploy-reset-db.js --force
```

Optional pg_dump backup
-----------------------
If you have `pg_dump` available and want to take a quick dump before dropping, pass `--backup=./backup.sql`:

```powershell
FORCE_RESET=1 node tools/deploy-reset-db.js --backup=./dump-before-reset.sql --force
```

CI/Automation
-------------
You can wire the `deploy:reset-db` npm script into automation pipelines but ensure the pipeline only runs the script on intended environments and has a backup step.

GitHub Actions workflow
-----------------------
This repository includes a manual GitHub Actions workflow that runs the same reset/migrate/seed flow with safeguards and optional backup. The workflow requires a confirmation code and repository-level secrets with the database connection string for the target environment.

Required secrets
 

How to run
	1. Open Actions → Deploy — Reset DB → Run workflow
	2. Choose environment: production / staging / test
	3. Type the confirmation code: RESET-DB (exact match required)
	4. Choose whether to create a backup (default true)
	5. Run the workflow. The job will:
		 - create a DB dump artifact using pg_dump
		 - run the reset+deploy+seed script (destructive)
		 - run a small verification using Prisma

Security & safety
	- The run is manual and requires you to type the confirmation code.
	- The workflow will use secrets for the target DATABASE_URL — ensure they are stored in GitHub repository secrets and are correct.
	- Always snapshot/backup before performing destructive changes in production.
