import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants';

// Extend Express Request type to include user data
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Middleware to verify JWT token
 */
export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'No token provided. Authorization header is required.'
      });
      return;
    }

    // Check if token starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Invalid token format. Use: Bearer <token>'
      });
      return;
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token is missing'
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
    };

    // Attach user data to request object
    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};
