import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { Document } from 'mongoose';
import { User } from '../models/User.js';
import { JWT_SECRET } from '../lib/auth.js';

export interface AuthedRequest extends Request {
  user?: Document & { _id: { toString: () => string }; role: string; email: string };
}

export async function optionalAuth(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    next();
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = await User.findById(payload.sub);
    if (user) req.user = user as AuthedRequest['user'];
  } catch {
    /* invalid token — treat as anonymous */
  }
  next();
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = await User.findById(payload.sub);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    req.user = user as AuthedRequest['user'];
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export async function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = await User.findById(payload.sub);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    req.user = user as AuthedRequest['user'];
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
