import { auditLog } from '../services/audit.js';

export const auditLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  auditLog('REQUEST', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId,
    timestamp: new Date().toISOString()
  });
  
  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    auditLog('RESPONSE', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: duration,
      userId: req.user?.userId,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    return originalJson.call(this, data);
  };
  
  next();
};