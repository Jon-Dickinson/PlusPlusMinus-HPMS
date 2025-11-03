import { Request, Response, NextFunction } from 'express';

function makeReqId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const id = makeReqId();
  (req as any).requestId = id;
  console.log(`[${id}] ${req.method} ${req.path}`);
  next();
}
