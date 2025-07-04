import React, { createContext, useContext, useState, useEffect } from 'react';
import { Achievement } from '../types';
import { achievementService } from '../services/achievementService';
import { useAuth } from './AuthContext';

interface AchievementContextType {
  achievements: Achievement[];
  isLoading: boolean;
  showJar: boolean;
  setShowJar: (show: boolean) => void;
  triggerJar: () => void;
  addAchievement: (achievement: Omit<Achievement, 'id' | 'createdAt'>) => Promise<void>;
  updateAchievement: (id: string, achievement: Partial<Achievement>) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;
  loadAchievements: () => Promise<void>;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showJar, setShowJar] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadAchievements();
    }
  }, [isAuthenticated]);

  const loadAchievements = async () => {
    setIsLoading(true);
    try {
      const data = await achievementService.getAchievements();
      setAchievements(data);
    } catch (error) {
      console.error('Failed to load achievements', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAchievement = async (achievementData: Omit<Achievement, 'id' | 'createdAt'>) => {
    try {
      const newAchievement = await achievementService.createAchievement(achievementData);
      setAchievements(prev => [newAchievement, ...prev]);
    } catch (error) {
      console.error('Failed to add achievement', error);
      throw error;
    }
  };

  const updateAchievement = async (id: string, achievementData: Partial<Achievement>) => {
    try {
      const updated = await achievementService.updateAchievement(id, achievementData);
      setAchievements(prev => prev.map(a => a.id === id ? updated : a));
    } catch (error) {
      console.error('Failed to update achievement', error);
      throw error;
    }
  };

  const deleteAchievement = async (id: string) => {
    try {
      await achievementService.deleteAchievement(id);
      setAchievements(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to delete achievement', error);
      throw error;
    }
  };

  const triggerJar = () => {
    if (achievements.length > 0) {
      setShowJar(true);
    }
  };

  const value = {
    achievements,
    isLoading,
    showJar,
    setShowJar,
    triggerJar,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    loadAchievements
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievements = (): AchievementContextType => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
};