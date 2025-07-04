import { User } from '../types';

// Enhanced authentication service with security measures
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

interface LoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

class SecureAuthService {
  private loginAttempts: Map<string, LoginAttempt> = new Map();
  private sessionTimer: NodeJS.Timeout | null = null;

  // Check if user is already logged in with session validation
  getCurrentUser = async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const userData = localStorage.getItem(USER_DATA_KEY);
      const sessionStart = localStorage.getItem('session_start');
      
      if (!token || !userData || !sessionStart) {
        this.clearSession();
        return null;
      }

      // Check session timeout
      const sessionAge = Date.now() - parseInt(sessionStart);
      if (sessionAge > SESSION_TIMEOUT) {
        this.clearSession();
        throw new Error('Session expired. Please login again.');
      }

      // Validate token format (basic check)
      if (!this.isValidTokenFormat(token)) {
        this.clearSession();
        throw new Error('Invalid session. Please login again.');
      }

      const user = JSON.parse(userData);
      
      // Start session timeout timer
      this.startSessionTimer();
      
      return user;
    } catch (error) {
      this.clearSession();
      return null;
    }
  };

  // Secure login with rate limiting and account lockout
  login = async (email: string, password: string): Promise<User> => {
    // Check for account lockout
    const attemptKey = email.toLowerCase();
    const attempts = this.loginAttempts.get(attemptKey);
    
    if (attempts?.lockedUntil && Date.now() < attempts.lockedUntil) {
      const remainingTime = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
      throw new Error(`Account temporarily locked. Try again in ${remainingTime} minutes.`);
    }

    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo credentials - in production, this would validate against secure backend
    const validCredentials = [
      { email: 'user@example.com', password: 'password', name: 'John Doe' },
      { email: 'jane@example.com', password: 'securepass123', name: 'Jane Smith' },
      { email: 'admin@example.com', password: 'admin123', name: 'Admin User', role: 'admin' }
    ];

    const validUser = validCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    if (!validUser) {
      this.recordFailedAttempt(attemptKey);
      throw new Error('Invalid email or password.');
    }

    // Clear failed attempts on successful login
    this.loginAttempts.delete(attemptKey);

    // Generate secure user session
    const user: User = {
      id: this.generateSecureUserId(email),
      email: validUser.email,
      name: validUser.name,
      locale: 'en',
      preferences: {
        lowDataMode: false,
        aiLiteInsights: true,
        scrapbookView: true,
        darkMode: false
      },
      streak: 3,
      role: validUser.role || 'user'
    };

    // Create secure session
    const sessionToken = this.generateSessionToken();
    const sessionData = {
      token: sessionToken,
      userId: user.id,
      email: user.email,
      role: user.role,
      loginTime: Date.now(),
      expiresAt: Date.now() + SESSION_TIMEOUT
    };

    // Store session data securely
    localStorage.setItem(AUTH_TOKEN_KEY, sessionToken);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    localStorage.setItem('session_start', Date.now().toString());
    localStorage.setItem('session_data', JSON.stringify(sessionData));

    // Start session timeout timer
    this.startSessionTimer();

    // Log successful authentication
    this.logSecurityEvent('LOGIN_SUCCESS', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString()
    });

    return user;
  };

  // Secure registration with validation
  register = async (email: string, password: string, name?: string): Promise<User> => {
    // Validate password strength
    if (!this.isStrongPassword(password)) {
      throw new Error('Password must be at least 8 characters with uppercase, lowercase, number, and special character.');
    }

    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new Error('Please enter a valid email address.');
    }

    // Check if user already exists (simulate)
    const existingUsers = this.getExistingUsers();
    if (existingUsers.includes(email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create new user
    const user: User = {
      id: this.generateSecureUserId(email),
      email: email.toLowerCase(),
      name: name || '',
      locale: 'en',
      preferences: {
        lowDataMode: false,
        aiLiteInsights: true,
        scrapbookView: true,
        darkMode: false
      },
      streak: 0,
      role: 'user'
    };

    // Store user in "database" (localStorage for demo)
    this.storeNewUser(user, password);

    // Create session
    const sessionToken = this.generateSessionToken();
    localStorage.setItem(AUTH_TOKEN_KEY, sessionToken);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    localStorage.setItem('session_start', Date.now().toString());

    this.startSessionTimer();

    this.logSecurityEvent('REGISTRATION_SUCCESS', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString()
    });

    return user;
  };

  // Secure logout with session cleanup
  logout = async (): Promise<void> => {
    const userData = localStorage.getItem(USER_DATA_KEY);
    const user = userData ? JSON.parse(userData) : null;

    this.logSecurityEvent('LOGOUT', {
      userId: user?.id,
      email: user?.email,
      timestamp: new Date().toISOString()
    });

    this.clearSession();
  };

  // Update user preferences with validation
  updateUserPreferences = async (userId: string, preferences: Partial<User['preferences']>): Promise<User> => {
    const userData = localStorage.getItem(USER_DATA_KEY);
    
    if (!userData) {
      throw new Error('User session not found');
    }

    const user = JSON.parse(userData) as User;
    
    // Verify user ID matches session
    if (user.id !== userId) {
      this.logSecurityEvent('UNAUTHORIZED_ACCESS', {
        sessionUserId: user.id,
        requestedUserId: userId,
        timestamp: new Date().toISOString()
      });
      throw new Error('Unauthorized access attempt');
    }

    // Update preferences
    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        ...preferences
      }
    };

    localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));

    this.logSecurityEvent('PREFERENCES_UPDATED', {
      userId: user.id,
      updatedFields: Object.keys(preferences),
      timestamp: new Date().toISOString()
    });

    return updatedUser;
  };

  // Validate session token
  validateSession = (): boolean => {
    const sessionData = localStorage.getItem('session_data');
    const sessionStart = localStorage.getItem('session_start');
    
    if (!sessionData || !sessionStart) {
      return false;
    }

    try {
      const session = JSON.parse(sessionData);
      const sessionAge = Date.now() - parseInt(sessionStart);
      
      return sessionAge < SESSION_TIMEOUT && Date.now() < session.expiresAt;
    } catch {
      return false;
    }
  };

  // Private helper methods
  private recordFailedAttempt(email: string): void {
    const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
    
    attempts.count += 1;
    attempts.lastAttempt = Date.now();
    
    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
      attempts.lockedUntil = Date.now() + LOCKOUT_DURATION;
      this.logSecurityEvent('ACCOUNT_LOCKED', {
        email,
        attempts: attempts.count,
        timestamp: new Date().toISOString()
      });
    }
    
    this.loginAttempts.set(email, attempts);
    
    this.logSecurityEvent('LOGIN_FAILURE', {
      email,
      attempts: attempts.count,
      timestamp: new Date().toISOString()
    });
  }

  private generateSecureUserId(email: string): string {
    // Generate a secure, unique user ID
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const emailHash = btoa(email).substring(0, 8);
    return `user_${emailHash}_${timestamp}_${random}`;
  }

  private generateSessionToken(): string {
    // Generate a secure session token
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private isValidTokenFormat(token: string): boolean {
    // Basic token format validation
    return /^[a-f0-9]{64}$/.test(token);
  }

  private isStrongPassword(password: string): boolean {
    // Password strength validation
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private getExistingUsers(): string[] {
    // Simulate checking existing users
    const existingUsers = localStorage.getItem('existing_users');
    return existingUsers ? JSON.parse(existingUsers) : ['user@example.com', 'admin@example.com'];
  }

  private storeNewUser(user: User, password: string): void {
    // Store user securely (in production, this would be handled by backend)
    const existingUsers = this.getExistingUsers();
    existingUsers.push(user.email);
    localStorage.setItem('existing_users', JSON.stringify(existingUsers));
    
    // Store user credentials (encrypted in production)
    const userCredentials = {
      email: user.email,
      passwordHash: btoa(password), // In production, use proper hashing
      userId: user.id,
      createdAt: new Date().toISOString()
    };
    
    const allCredentials = JSON.parse(localStorage.getItem('user_credentials') || '[]');
    allCredentials.push(userCredentials);
    localStorage.setItem('user_credentials', JSON.stringify(allCredentials));
  }

  private startSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    
    this.sessionTimer = setTimeout(() => {
      this.logSecurityEvent('SESSION_TIMEOUT', {
        timestamp: new Date().toISOString()
      });
      this.clearSession();
      window.location.href = '/login';
    }, SESSION_TIMEOUT);
  }

  private clearSession(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem('session_start');
    localStorage.removeItem('session_data');
    
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  private logSecurityEvent(event: string, data: any): void {
    const securityLog = {
      event,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: 'client-side' // In production, this would be logged server-side
    };
    
    // Store security logs
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(securityLog);
    
    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem('security_logs', JSON.stringify(logs));
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Security Event:', securityLog);
    }
  }
}

export const auth = new SecureAuthService();