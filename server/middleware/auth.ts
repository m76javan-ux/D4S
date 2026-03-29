import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export async function verifyToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);

  if (!match) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(match[1]);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('verifyToken failed:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
}
