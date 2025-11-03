import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export const validate =
  (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    try {
      // First try to validate the request body directly (common case: schema expects the body shape)
      schema.parse(req.body);
      return next();
    } catch (errBody: any) {
      try {
        // Fallback: some schemas validate an object containing body/query/params
        schema.parse({ body: req.body, query: req.query, params: req.params });
        return next();
      } catch (err: any) {
        return res.status(400).json({ message: 'Validation error', errors: (err.errors || errBody.errors) });
      }
    }
  };
