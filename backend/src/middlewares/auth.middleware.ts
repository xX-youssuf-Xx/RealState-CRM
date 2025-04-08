import type { Request, Response } from 'express';
import type { NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Add a fallback for JWT_SECRET
const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';

// Define the AuthRequest interface
export interface AuthRequest extends Request {
  user?: {
    id: number; // Adjust the type of id based on your user object
    role: string; // Adjust the type of role based on your user object
    // Add other user properties as needed
  };
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.sendStatus(401);
    return;
  }

  const token = authHeader.split(' ')[1]; // Assuming Bearer token

  if (!token) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      res.sendStatus(403); // Forbidden
      return;
    }

    // Attach user information to the request for later use in controllers
    (req as AuthRequest).user = user as AuthRequest['user'];
    next();
  });
};

// You'll need a similar middleware for role-based authorization
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthRequest).user;
        if (user && roles.includes(user.role)) {
      next();
    } else {
      res.sendStatus(403); // Forbidden
    }
  };
};

export const checkDeleted = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthRequest).user;
        if (user && (user.role !== 'DELETED')) {
      next();
    } else {
      res.sendStatus(403); 
    }
  };
};