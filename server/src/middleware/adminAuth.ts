import type { NextFunction, Request, Response } from 'express';
import { env } from '../utils/env.js';

export function requireAdminSecret(req: Request, res: Response, next: NextFunction) {
  const provided = req.header('x-admin-secret') || req.header('authorization')?.replace(/^Bearer\s+/i, '');

  if (!env.adminSecret || provided !== env.adminSecret) {
    return res.status(401).json({ error: 'Admin access required.' });
  }

  return next();
}
