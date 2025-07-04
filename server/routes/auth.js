import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { logger } from '../services/logger.js';
import { auditLog } from '../services/audit.js';
import { securityMonitor } from '../services/securityMonitor.js';
import { encryptionService } from '../services/encryption.js';

const router = express.Router();

// Mock user database - replace with actual database
const users = new Map();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  body('name').optional().isLength({ min: 2, max: 50 }).trim()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Register endpoint
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      auditLog('REGISTRATION_FAILURE', {
        ip: req.ip,
        email: req.body.email,
        reason: 'Validation failed',
        errors: errors.array()
      });
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, name } = req.body;
    
    // Check if user already exists
    if (users.has(email)) {
      auditLog('REGISTRATION_FAILURE', {
        ip: req.ip,
        email,
        reason: 'User already exists'
      });
      
      return res.status(400).json({
        error: 'User already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const userId = encryptionService.generateSecureToken();
    const hashedUserId = encryptionService.hashUserId(userId);
    
    const user = {
      id: userId,
      hashedId: hashedUserId,
      email,
      password: hashedPassword,
      name: name || '',
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true
    };
    
    users.set(email, user);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: hashedUserId,
        email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    auditLog('REGISTRATION_SUCCESS', {
      userId: hashedUserId,
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: hashedUserId,
        email,
        name: user.name,
        role: user.role
      }
    });
    
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      securityMonitor.trackFailedLogin(req.ip, req.body.email);
      
      auditLog('LOGIN_FAILURE', {
        ip: req.ip,
        email: req.body.email,
        reason: 'Validation failed'
      });
      
      return res.status(400).json({
        error: 'Invalid credentials'
      });
    }

    const { email, password } = req.body;
    
    // Find user
    const user = users.get(email);
    if (!user || !user.isActive) {
      securityMonitor.trackFailedLogin(req.ip, email);
      
      auditLog('LOGIN_FAILURE', {
        ip: req.ip,
        email,
        reason: 'User not found or inactive'
      });
      
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      securityMonitor.trackFailedLogin(req.ip, email);
      
      auditLog('LOGIN_FAILURE', {
        userId: user.hashedId,
        ip: req.ip,
        email,
        reason: 'Invalid password'
      });
      
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.hashedId,
        email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    auditLog('LOGIN_SUCCESS', {
      userId: user.hashedId,
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.hashedId,
        email,
        name: user.name,
        role: user.role
      }
    });
    
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // In a real application, you would invalidate the token
  // For JWT, you might maintain a blacklist of tokens
  
  auditLog('LOGOUT', {
    userId: req.user?.userId,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.json({ message: 'Logout successful' });
});

// Get current user
router.get('/me', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by hashed ID
    const user = Array.from(users.values()).find(u => u.hashedId === decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: user.hashedId,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
    
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;