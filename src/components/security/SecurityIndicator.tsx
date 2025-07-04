import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Clock, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SecurityIndicator: React.FC = () => {
  const { user, validateSession } = useAuth();
  const [sessionStatus, setSessionStatus] = useState<'valid' | 'warning' | 'expired'>('valid');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const checkSession = () => {
      if (!validateSession()) {
        setSessionStatus('expired');
        return;
      }

      // Calculate time remaining
      const sessionData = localStorage.getItem('session_data');
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          const remaining = session.expiresAt - Date.now();
          
          if (remaining < 5 * 60 * 1000) { // Less than 5 minutes
            setSessionStatus('warning');
          } else {
            setSessionStatus('valid');
          }
          
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } catch {
          setSessionStatus('expired');
        }
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 1000);
    
    return () => clearInterval(interval);
  }, [validateSession]);

  const getStatusIcon = () => {
    switch (sessionStatus) {
      case 'valid':
        return <ShieldCheck size={16} className="text-green-500" />;
      case 'warning':
        return <ShieldAlert size={16} className="text-yellow-500" />;
      case 'expired':
        return <Shield size={16} className="text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (sessionStatus) {
      case 'valid':
        return 'Secure Session';
      case 'warning':
        return 'Session Expiring Soon';
      case 'expired':
        return 'Session Expired';
    }
  };

  const getStatusColor = () => {
    switch (sessionStatus) {
      case 'valid':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'expired':
        return 'text-red-600 dark:text-red-400';
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 max-w-xs">
      <div className="flex items-center space-x-2 mb-2">
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div className="flex items-center space-x-1">
          <User size={12} />
          <span>User: {user.email}</span>
        </div>
        
        {sessionStatus !== 'expired' && (
          <div className="flex items-center space-x-1">
            <Clock size={12} />
            <span>Time left: {timeRemaining}</span>
          </div>
        )}
        
        <div className="text-xs">
          Role: {user.role || 'user'}
        </div>
      </div>
      
      {sessionStatus === 'warning' && (
        <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
          Your session will expire soon. Save your work.
        </div>
      )}
      
      {sessionStatus === 'expired' && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
          Please log in again to continue.
        </div>
      )}
    </div>
  );
};

export default SecurityIndicator;