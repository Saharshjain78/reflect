import crypto from 'crypto';

// Simple CSRF protection middleware
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests and auth endpoints
  if (req.method === 'GET' || req.path.includes('/auth/')) {
    return next();
  }
  
  const token = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;
  
  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ 
      error: 'Invalid CSRF token' 
    });
  }
  
  next();
};

// Generate CSRF token
export const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};