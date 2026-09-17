import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { UnauthorizedError } from './error.middleware';

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};
