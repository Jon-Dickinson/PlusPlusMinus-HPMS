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

	Important: adding a model to schema.prisma does not automatically change the production DB
	-------------------------------------------------------------------------------

	If you (or a PR) added a model to `prisma/schema.prisma` (for example `PermissionQueryAudit`) but did not create + commit a corresponding migration, production will not have the table and API calls that rely on it will return 500s (Prisma error: table does not exist).

	Safe remediation steps (recommended order):

	1) Backup production DB (pg_dump or provider snapshot). Do NOT skip this step.
		Example: `pg_dump --format=custom --file=backup.before.permission_audit.dump "$DATABASE_URL"`

	2) Deploy the committed migration(s) to the production database. From the backend container (or a secure machine with DB access):

	```powershell
	cd backend
	# ensure DATABASE_URL points to production DB (use the secret or env var managed by your host)
	npx prisma migrate deploy
	```

	3) Redeploy the API (if your platform doesn't automatically roll or reload after schema updates).

	4) Verify the new table exists and audit endpoint returns 200:

	```powershell
	# quickly check via psql or a small query
	npx prisma db execute --sql "select count(*) from \"PermissionQueryAudit\";"
	```

	If a committed migration for the model doesn't exist yet
	-------------------------------------------------------

	If the model was added directly to `schema.prisma` but there's no migration committed, create one locally, commit it, and follow the steps above:

	```powershell
	cd backend
	npx prisma migrate dev --name add_permission_query_audit
	# commit the migration folder and push your change

	# then run migration deploy on production as shown earlier
	```

	If you want me to create the migration file in the repo now, I already added one that matches `PermissionQueryAudit` and it can be deployed to production with `npx prisma migrate deploy`.

	New: safer apply-migrations tooling
	----------------------------------

	Two helpers are now included to make applying migrations safer and more auditable:

	1) Local/remote script: `backend/tools/apply-migration.cjs`
		- Creates an optional `pg_dump` backup, runs `npx prisma migrate deploy`, and performs a small verification query.
		- Requires `FORCE=1` in the environment or `--force` option. Example:

	```powershell
	# dry-run (shows commands, does not execute)
	node backend/tools/apply-migration.cjs --dry-run --backup=./tmp/pre-migration.dump

	# real run (make sure DATABASE_URL points to production and you have a backup)
	FORCE=1 node backend/tools/apply-migration.cjs --backup=./tmp/pre-migration.dump
	```

	2) GitHub Actions workflow: `.github/workflows/apply-migrations-manual.yml`
		- Manual workflow that requires typing the confirmation code `APPLY-MIGRATION` to proceed.
		- Creates a `pg_dump` backup artifact, uploads it to the workflow run, runs `npx prisma migrate deploy`, and runs a quick verification query.
		- To run: Actions → Manual: Apply DB Migrations (Safe) → Choose environment → Type `APPLY-MIGRATION` → Run. Ensure the repo has a `DATABASE_URL` secret for the target DB.

	Both of these are meant to be used carefully in production. Always ensure you have a working backup before applying migrations.
