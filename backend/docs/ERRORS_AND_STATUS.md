# Error codes & HTTP status strategy

This document describes the backend's error response contract and the mapping we use from common error cases (including Prisma and Zod) to HTTP status codes. The goal is to provide consistency for frontend consumers and make server-side error handling predictable.

## Error response contract

All error responses are JSON with the following minimal shape:

- `error` (string) — human-readable message
- `code` (optional string) — machine-friendly error code (e.g. `VALIDATION_FAILED`, `NOT_FOUND`, `P2002`)
- `details` (optional any) — structured details (validation issues, field-level errors)
- `meta` (optional object) — auxiliary data (e.g. field name, query info)

Example:

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_FAILED",
  "details": [ { "path": ["name"], "message": "Required" } ]
}
```

## General mapping (recommended)

- 200 OK — Successful GET, PATCH (when returning resource), or other idempotent success.
- 201 Created — Resource created (POST). Return the created resource in body.
- 204 No Content — Successful delete or update when no body is returned.
- 400 Bad Request — Malformed request, missing fields, or Zod validation errors. Use code `VALIDATION_FAILED`.
- 401 Unauthorized — Authentication is missing/invalid. Use code `UNAUTHORIZED`.
- 403 Forbidden — Authenticated but insufficient permissions. Use code `FORBIDDEN`.
- 404 Not Found — Resource not found. Use code `NOT_FOUND`.
- 409 Conflict — Resource conflict, e.g., uniqueness constraint violation. Use code `CONFLICT` or provider code like `P2002`.
- 422 Unprocessable Entity — Optional: semantic validation (business-rule failure) distinct from structural validation.
- 429 Too Many Requests — Rate-limiting.
- 500 Internal Server Error — Unexpected errors. Use code `INTERNAL_ERROR` and log full stack on server.

## Prisma-specific errors mapping

Prisma returns errors with codes (e.g. `P2002`). Map the most common codes:

- `P2002` — Unique constraint failed → 409 Conflict
- `P2025` — An operation failed because it depends on one or more records that were required but not found → 404 Not Found
- `P2003` — Foreign key constraint failed → 409 Conflict or 400 depending on context

In the global error middleware we expose `err.code` and the message; the frontend can use `code` for specialized UI treatment.

## Validation (Zod)

- Use Zod schemas for request validation (we already have `validate.middleware.ts`).
- Zod errors are returned with HTTP 400, code `VALIDATION_FAILED` and `details` set to `err.issues` (array of issue objects containing `path`, `message`, `code`).

Example response for Zod error:

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_FAILED",
  "details": [
    { "path": ["sizeX"], "message": "Expected number", "code": "invalid_type" }
  ]
}
```

## Error classes & throwing from controllers

Recommendation: implement and use a small ApiError helper in server code to throw structured errors from controllers and services. Example shape:

```ts
class ApiError extends Error {
  status: number
  code?: string
  details?: any
  constructor(status: number, message: string, code?: string, details?: any) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

// Usage in a controller:
if (!resource) throw new ApiError(404, 'Building not found', 'NOT_FOUND')
```

The global error middleware should detect `instanceof ApiError` and use its `status`, `code`, and `details` to construct the response.

## Logging & observability

- Log full stack traces for 5xx errors on the server (use structured logger in future).
- For 4xx errors, log minimally (request id, route, user id if present) to reduce noise.

## Frontend UX guidance

- Use `code` for programmatic flows (e.g., highlight a field on `VALIDATION_FAILED`).
- Display `error` to users for context. Avoid exposing raw DB errors (e.g., SQL statements).

## Examples

- Unique email on register (Prisma P2002):

HTTP 409

```json
{ "error": "Email already exists", "code": "P2002" }
```

- Unauthorized request:

HTTP 401

```json
{ "error": "Missing Authorization", "code": "UNAUTHORIZED" }
```

## Extending

- Add more Prisma code handling in `error.middleware.ts` as needed.
- Consider adding `requestId` to responses for correlating logs.

---
Document created to standardize error handling across backend and frontend. If you want, I can:
- Add the `ApiError` class and wire controllers to use it.
- Add requestId middleware and attach it to logs and error responses.
- Add unit tests to assert middleware behavior.
