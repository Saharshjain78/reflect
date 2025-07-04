import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { BookOpen, AlertTriangle, Shield } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [securityWarning, setSecurityWarning] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Check for security warnings
  useEffect(() => {
    const violations = localStorage.getItem('security_violations');
    if (violations) {
      const violationList = JSON.parse(violations);
      const recentViolations = violationList.filter(
        (v: any) => Date.now() - new Date(v.timestamp).getTime() < 24 * 60 * 60 * 1000
      );
      
      if (recentViolations.length > 0) {
        setSecurityWarning(`${recentViolations.length} security event(s) detected in the last 24 hours.`);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      await login(email, password);
      // Navigation will be handled by useEffect
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center mb-4">
              <BookOpen size={32} className="text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">
            reflect
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your secure personal journaling companion
          </p>
        </div>

        {/* Security Warning */}
        {securityWarning && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-md">
            <div className="flex items-center">
              <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400 mr-2" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                {securityWarning}
              </span>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center space-x-2">
              <Shield size={20} className="text-green-600 dark:text-green-400" />
              <h2 className="text-center text-xl font-medium">Secure Sign In</h2>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
              Your data is encrypted and private
            </p>
          </CardHeader>
          <CardBody>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter your email"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Demo: user@example.com</p>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter your password"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Demo: password</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>
                
                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                    Forgot password?
                  </a>
                </div>
              </div>
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                disabled={!email || !password}
              >
                {isLoading ? 'Signing in...' : 'Sign in securely'}
              </Button>
            </form>

            {/* Security Features */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Security Features:
              </h3>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• End-to-end encryption</li>
                <li>• Secure session management</li>
                <li>• Private data isolation</li>
                <li>• Activity monitoring</li>
              </ul>
            </div>
          </CardBody>
          <CardFooter>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                Create secure account
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Demo Accounts */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Demo Accounts:</h4>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <div>User: user@example.com / password</div>
            <div>Admin: admin@example.com / admin123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;