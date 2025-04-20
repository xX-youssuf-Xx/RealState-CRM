import { Express } from 'express-serve-static-core';

declare global {
  namespace Express {
    interface Response {
      // Add any custom properties to the Response object here if needed
    }
  }
} 