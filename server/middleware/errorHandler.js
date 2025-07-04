import { logger } from '../services/logger.js';
import { auditLog } from '../services/audit.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.userId
  });
  
  auditLog('ERROR', {
    error: err.message,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.userId,
    timestamp: new Date().toISOString()
  });
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
};