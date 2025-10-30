import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // attach or read requestId for correlation
  const requestId = (req as any).requestId || res.locals?.requestId

  // Logging for observability
  console.error(`Unhandled error [requestId=${requestId}]:`, err && err.stack ? err.stack : err)

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', code: 'VALIDATION_FAILED', details: err.issues, meta: { requestId } })
  }

  // Prisma known error (optional shape)
  if (err?.code && typeof err.code === 'string') {
    // Example Prisma error handling: P2002 unique constraint
    const status = err.code === 'P2002' ? 409 : 500
    return res.status(status).json({ error: err.message || 'Database error', code: err.code, meta: { requestId } })
  }

  const status = err?.status || err?.statusCode || 500
  const message = err?.message || 'Internal Server Error'
  const details = err?.details ?? undefined

  res.status(status).json({ error: message, details, meta: { requestId } })
}

export default errorHandler
