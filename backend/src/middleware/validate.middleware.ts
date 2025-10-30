import { RequestHandler } from 'express'
import { ZodSchema } from 'zod'

// Generic validation middleware using Zod
export function validateBody(schema: ZodSchema<any>): RequestHandler {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req.body)
      // replace body with parsed value
      req.body = parsed
      next()
    } catch (err: any) {
      // Zod error
      return res.status(400).json({ error: 'Invalid request', details: err?.errors ?? err?.message })
    }
  }
}

export function validateParams(schema: ZodSchema<any>): RequestHandler {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req.params)
      req.params = parsed
      next()
    } catch (err: any) {
      return res.status(400).json({ error: 'Invalid parameters', details: err?.errors ?? err?.message })
    }
  }
}

export default { validateBody, validateParams }
