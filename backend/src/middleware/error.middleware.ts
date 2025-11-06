import { NextFunction, Request, Response } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('❌', err);

  // Handle specific error types
  if (err?.message === 'Invalid credentials') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (err?.message === 'Username already exists' || err?.message === 'Email already exists') {
    return res.status(409).json({ error: err.message });
  }

  res.status(err?.status || 500).json({ error: err?.message || 'Server error' });
}
