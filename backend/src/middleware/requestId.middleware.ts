import { RequestHandler } from 'express'
import { randomUUID } from 'crypto'

// Attaches a requestId to each request and sets X-Request-Id header on the response.
export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const existing = (req.headers['x-request-id'] as string) || (req.headers['x_correlation_id'] as string)
  const id = existing || randomUUID()
  // attach to req for later use
  ;(req as any).requestId = id
  // expose as response header for clients
  res.setHeader('X-Request-Id', id)
  // also make available in res.locals
  res.locals.requestId = id
  next()
}

export default requestIdMiddleware
