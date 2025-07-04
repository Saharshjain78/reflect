import jwt from 'jsonwebtoken';
import { logger } from '../services/logger.js';
import { auditLog } from '../services/audit.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      auditLog('AUTH_FAILURE', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        reason: 'No token provided'
      });
      
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check token expiration
    if (decoded.exp < Date.now() / 1000) {
      auditLog('AUTH_FAILURE', {
        userId: decoded.userId,
        ip: req.ip,
        reason: 'Token expired'
      });
      
      return res.status(401).json({ 
        error: 'Token expired. Please login again.' 
      });
    }

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user'
    };

    // Log successful authentication
    auditLog('AUTH_SUCCESS', {
      userId: decoded.userId,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    auditLog('AUTH_FAILURE', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      reason: 'Invalid token',
      error: error.message
    });
    
    res.status(401).json({ 
      error: 'Invalid token.' 
    });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    auditLog('UNAUTHORIZED_ACCESS', {
      userId: req.user.userId,
      ip: req.ip,
      attemptedResource: req.path,
      reason: 'Insufficient privileges'
    });
    
    return res.status(403).json({ 
      error: 'Access denied. Admin privileges required.' 
    });
  }
  
  next();
};

export const ownershipMiddleware = (resourceIdParam = 'id') => {
  return async (req, res, next) => {
    const resourceId = req.params[resourceIdParam];
    const userId = req.user.userId;
    
    // For admin users, allow access to all resources for monitoring
    if (req.user.role === 'admin') {
      return next();
    }
    
    try {
      // Check if user owns the resource
      const resource = await getResourceOwnership(resourceId, req.path);
      
      if (!resource || resource.userId !== userId) {
        auditLog('UNAUTHORIZED_ACCESS', {
          userId: req.user.userId,
          ip: req.ip,
          attemptedResource: req.path,
          resourceId: resourceId,
          reason: 'Resource not owned by user'
        });
        
        return res.status(403).json({ 
          error: 'Access denied. You do not own this resource.' 
        });
      }
      
      next();
    } catch (error) {
      logger.error('Ownership check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Helper function to check resource ownership
const getResourceOwnership = async (resourceId, path) => {
  // This would query the database to check ownership
  // Implementation depends on your database structure
  if (path.includes('/journal/')) {
    // Check journal entry ownership
    return await checkJournalEntryOwnership(resourceId);
  }
  
  return null;
};

const checkJournalEntryOwnership = async (entryId) => {
  // Mock implementation - replace with actual database query
  return { userId: 'mock-user-id', id: entryId };
};