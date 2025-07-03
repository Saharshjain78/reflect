import { User } from '../types';

// Mock user data for development
const MOCK_USER: User = {
  id: '1',
  email: 'user@example.com',
  name: 'John Doe',
  locale: 'en',
  preferences: {
    lowDataMode: false,
    aiLiteInsights: true,
    scrapbookView: true,
    darkMode: true
  },
  streak: 3
};

// Simulate authentication with localStorage
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export const auth = {
  // Check if user is already logged in
  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userData = localStorage.getItem(USER_DATA_KEY);
    
    if (token && userData) {
      return JSON.parse(userData);
    }
    
    return null;
  },

  // Login with email and password
  login: async (email: string, password: string): Promise<User> => {
    // Simulate API call with 1s delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo login - in a real app this would be an API call
    if (email === 'user@example.com' && password === 'password') {
      // Save auth token and user data
      localStorage.setItem(AUTH_TOKEN_KEY, 'mock_jwt_token');
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(MOCK_USER));
      
      return MOCK_USER;
    }
    
    throw new Error('Invalid email or password');
  },

  // Register with email and password
  register: async (email: string, password: string): Promise<User> => {
    // Simulate API call with 1s delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would create a new user in the database
    const newUser = {
      ...MOCK_USER,
      email,
      id: Math.random().toString(36).substring(2, 9)
    };
    
    // Save auth token and user data
    localStorage.setItem(AUTH_TOKEN_KEY, 'mock_jwt_token');
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(newUser));
    
    return newUser;
  },

  // Logout
  logout: async (): Promise<void> => {
    // Clear auth token and user data
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },

  // Update user preferences
  updateUserPreferences: async (userId: string, preferences: Partial<User['preferences']>): Promise<User> => {
    // Get current user data
    const userData = localStorage.getItem(USER_DATA_KEY);
    
    if (!userData) {
      throw new Error('User not found');
    }
    
    const user = JSON.parse(userData) as User;
    
    // Update preferences
    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        ...preferences
      }
    };
    
    // Save updated user data
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
    
    return updatedUser;
  }
};