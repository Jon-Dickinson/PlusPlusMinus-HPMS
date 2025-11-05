Running frontend unit tests

We use Vitest with React Testing Library for unit tests.

Install dev dependencies first (from project root or inside `frontend`):

PowerShell:

    cd frontend
    npm install

Run tests once:

    npm run test

Run tests in watch mode during development:

    npm run test:watch

Notes:
- Tests run in a happy-dom environment (configured in `vitest.config.ts`).
- The file `vitest.setup.ts` imports `@testing-library/jest-dom` so DOM matchers are available.
- A small ambient typings file `vitest-globals.d.ts` has been added to the project root (`frontend/`) to help editors and the TypeScript language server pick up Vitest globals (describe/it/test/beforeEach/afterEach/expect/vi) without needing per-file triple-slash references.

VS Code / TypeScript tips
- Make sure your editor is using the workspace TypeScript version so the language server reads project `tsconfig.json` and picks up `.d.ts` files:

    1. Open Command Palette (Ctrl+Shift+P)
    2. Choose "TypeScript: Select TypeScript Version"
    3. Select "Use Workspace Version"

- If you still see errors like "Cannot find name 'beforeEach'", restart the TS server from the Command Palette: "TypeScript: Restart TS Server".

- If your workspace or editor ignores `.d.ts` files, ensure `frontend/tsconfig.json` includes the project files (the default config already includes `**/*`). If you have a custom `exclude`, add `vitest-globals.d.ts` or include the `frontend` folder explicitly.

- Alternatively, you can keep using per-test triple-slash references at the top of test files:

        /// <reference types="vitest" />

Public API note
- The frontend registration form fetches available mayors from a public endpoint so unauthenticated users can select a mayor when registering as a Viewer:

    GET /api/public/mayors

    This endpoint returns a summary list of users with role MAYOR (includes id, firstName, lastName, role, city summary and a notes stub). If you need to run the register page locally, ensure the backend is running and reachable at the URL configured in `NEXT_PUBLIC_API_URL` (defaults to http://localhost:4000).

