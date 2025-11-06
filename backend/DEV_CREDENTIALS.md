# Development credentials

These are development/test accounts created during local development. Do NOT use these in production.

Admin
- email: admin@example.com
- username: admin (or `Jon` if previously created)
- password: Password123!

Mayor
- username: single_mayor
- email: single_mayor@example.com
- password: Password123!
- City: Singleton (country: Freedonia)

Viewer 1
- username: viewer_a
- email: viewer_a@example.com
- password: Password123!
- linked mayor: single_mayor

Viewer 2
- username: viewer_b
- email: viewer_b@example.com
- password: Password123!
- linked mayor: single_mayor

Other generated users (from earlier helper scripts)
- mayor_a / mayor_a@example.com — Password123! (City: Aveland)
- mayor_b / mayor_b@example.com — Password123! (City: Benville)
- mayor_c / mayor_c@example.com — Password123! (City: Caraville)
- mayor2 / mayor2@example.com — Password123!
- viewer3 / viewer3@example.com — Password123!
- viewer4 / viewer4@example.com — Password123!

How to (re)create these accounts
- Run the repository seed:
  - cd backend
  - npm run seed
- Create admin (idempotent):
  - node backend/tools/create_admin.mjs
- Reset DB and create single mayor + viewers (destructive):
  - node backend/tools/reset_db_and_create_mayor.mjs

Notes
- Passwords are hashed in the database using bcrypt. These plaintext passwords are for local/dev use only.
- To change a password when creating via scripts, set the `PASSWORD` environment variable before running the script.
