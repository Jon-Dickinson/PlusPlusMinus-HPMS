export type JwtPayload = { id: number; role: 'ADMIN'|'MAYOR'|'VIEWER' };
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      requestId?: string;
    }
  }
}
