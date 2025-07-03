import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Download, Trash2, Moon, Sun, Globe, WifiOff, BrainCircuit, Image } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserPreferences, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [preferences, setPreferences] = useState({
    lowDataMode: user?.preferences?.lowDataMode || false,
    aiLiteInsights: user?.preferences?.aiLiteInsights || true,
    scrapbookView: user?.preferences?.scrapbookView || true,
    darkMode: darkMode
  });
  const [locale, setLocale] = useState<'en' | 'hi'>(user?.locale || 'en');
  
  const handleTogglePreference = (key: keyof typeof preferences) => {
    if (key === 'darkMode') {
      toggleDarkMode();
      setPreferences(prev => ({
        ...prev,
        darkMode: !prev.darkMode
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };
  
  const handleSavePreferences = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Extract only the preferences that should be saved to the user profile
      // (excluding darkMode which is handled separately)
      const { darkMode: _, ...prefsToSave } = preferences;
      
      await updateUserPreferences(prefsToSave);
      
      // Show success message (could use a toast notification in a real app)
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Failed to save preferences', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleExportData = () => {
    // In a real app, this would retrieve all user data and generate a download
    alert('This feature will allow you to export all your journal entries and media in a future update.');
  };
  
  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    
    try {
      // In a real app, this would make an API call to delete the user's account
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to delete account', error);
      alert('Failed to delete account. Please try again.');
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-serif font-bold mb-6">Profile Settings</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-medium">Your Profile</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white text-xl font-medium">
                  {user.name ? user.name.charAt(0) : user.email.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="font-medium">{user.name || 'User'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Save size={16} />}
                  isLoading={isSaving}
                  onClick={handleSavePreferences}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader>
            <h2 className="text-xl font-medium">Language</h2>
          </CardHeader>
          <CardBody>
            <div className="flex items-center mb-4">
              <Globe size={20} className="text-gray-500 dark:text-gray-400 mr-2" />
              <h3 className="font-medium">Interface Language</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                className={`
                  py-2 px-4 border rounded-md text-center transition-colors
                  ${locale === 'en' ? 'bg-primary-100 border-primary-500 text-primary-800 dark:bg-primary-900/30 dark:border-primary-400 dark:text-primary-300' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}
                `}
                onClick={() => setLocale('en')}
              >
                English
              </button>
              
              <button
                className={`
                  py-2 px-4 border rounded-md text-center transition-colors
                  ${locale === 'hi' ? 'bg-primary-100 border-primary-500 text-primary-800 dark:bg-primary-900/30 dark:border-primary-400 dark:text-primary-300' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}
                `}
                onClick={() => setLocale('hi')}
              >
                हिंदी (Hindi)
              </button>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader>
            <h2 className="text-xl font-medium">App Preferences</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {darkMode ? <Moon size={20} className="text-gray-500 dark:text-gray-400 mr-3" /> : <Sun size={20} className="text-gray-500 dark:text-gray-400 mr-3" />}
                  <div>
                    <h3 className="font-medium">Dark Mode</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Switch between light and dark themes
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.darkMode}
                    onChange={() => handleTogglePreference('darkMode')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <WifiOff size={20} className="text-gray-500 dark:text-gray-400 mr-3" />
                  <div>
                    <h3 className="font-medium">Low-Data Mode</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Reduce data usage by loading fewer images
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.lowDataMode}
                    onChange={() => handleTogglePreference('lowDataMode')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BrainCircuit size={20} className="text-gray-500 dark:text-gray-400 mr-3" />
                  <div>
                    <h3 className="font-medium">AI-Lite Insights</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable sentiment analysis for journal entries
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.aiLiteInsights}
                    onChange={() => handleTogglePreference('aiLiteInsights')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Image size={20} className="text-gray-500 dark:text-gray-400 mr-3" />
                  <div>
                    <h3 className="font-medium">Scrapbook View</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Show media gallery with all your uploads
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.scrapbookView}
                    onChange={() => handleTogglePreference('scrapbookView')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader>
            <h2 className="text-xl font-medium">Data Management</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Export Your Data</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Download all your journal entries and media in JSON or CSV format.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download size={16} />}
                  onClick={handleExportData}
                >
                  Export Data
                </Button>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="font-medium mb-2 text-red-600 dark:text-red-400">Delete Account</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                
                {showDeleteConfirm ? (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4">
                    <p className="text-red-700 dark:text-red-300 text-sm mb-3">
                      Are you sure you want to delete your account? This will permanently erase all your journal entries and cannot be undone.
                    </p>
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<Trash2 size={16} />}
                        onClick={handleDeleteAccount}
                      >
                        Confirm Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 size={16} />}
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Profile;