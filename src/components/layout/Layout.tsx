import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import OfflineIndicator from '../ui/OfflineIndicator';
import SecurityIndicator from '../security/SecurityIndicator';
import AchievementJar from '../achievement/AchievementJar';
import { useTheme } from '../../contexts/ThemeContext';
import { useAchievements } from '../../contexts/AchievementContext';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { darkMode } = useTheme();
  const { achievements, showJar, setShowJar } = useAchievements();
  const { isAuthenticated } = useAuth();
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);
  
  // Check if user is on auth pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  React.useEffect(() => {
    // Handle online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {!isAuthPage && <Navbar />}
      
      <div className="flex">
        {!isAuthPage && <Sidebar />}
        
        <main className={`flex-1 transition-all duration-300 ${!isAuthPage ? 'p-4 md:p-6 pb-24' : ''}`}>
          {isOffline && <OfflineIndicator />}
          {children}
        </main>
      </div>

      {/* Security Indicator - only show when authenticated */}
      {isAuthenticated && !isAuthPage && <SecurityIndicator />}

      {/* Achievement Jar Modal */}
      <AchievementJar
        isVisible={showJar}
        onClose={() => setShowJar(false)}
        achievements={achievements}
        onAddAchievement={() => {
          setShowJar(false);
          // Navigate to achievements page - you might want to use navigate here
          window.location.href = '/achievements';
        }}
      />
    </div>
  );
};

export default Layout;