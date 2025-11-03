declare namespace Express {
  export interface Request {
    user?: { id: number; role: 'ADMIN'|'MAYOR'|'VIEWER' };
    requestId?: string;
  }
}
