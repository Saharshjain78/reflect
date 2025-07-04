import { Achievement } from '../types';
import { generateId } from '../utils/helpers';

// LocalStorage key
const ACHIEVEMENTS_KEY = 'achievements';

// Helper to get achievements from localStorage
const getAchievementsFromStorage = (): Achievement[] => {
  const achievements = localStorage.getItem(ACHIEVEMENTS_KEY);
  return achievements ? JSON.parse(achievements) : [];
};

// Helper to save achievements to localStorage
const saveAchievementsToStorage = (achievements: Achievement[]): void => {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
};

export const achievementService = {
  // Get all achievements
  getAchievements: async (): Promise<Achievement[]> => {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return getAchievementsFromStorage();
  },

  // Create a new achievement
  createAchievement: async (achievementData: Omit<Achievement, 'id' | 'createdAt'>): Promise<Achievement> => {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const achievements = getAchievementsFromStorage();
    const now = new Date().toISOString();
    
    const newAchievement: Achievement = {
      id: generateId(),
      ...achievementData,
      createdAt: now
    };
    
    // Add to beginning of array (newest first)
    const updatedAchievements = [newAchievement, ...achievements];
    saveAchievementsToStorage(updatedAchievements);
    
    return newAchievement;
  },

  // Update an existing achievement
  updateAchievement: async (id: string, achievementData: Partial<Achievement>): Promise<Achievement> => {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const achievements = getAchievementsFromStorage();
    const achievementIndex = achievements.findIndex(a => a.id === id);
    
    if (achievementIndex === -1) {
      throw new Error('Achievement not found');
    }
    
    const updatedAchievement = {
      ...achievements[achievementIndex],
      ...achievementData
    };
    
    achievements[achievementIndex] = updatedAchievement;
    saveAchievementsToStorage(achievements);
    
    return updatedAchievement;
  },

  // Delete an achievement
  deleteAchievement: async (id: string): Promise<void> => {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const achievements = getAchievementsFromStorage();
    const filteredAchievements = achievements.filter(achievement => achievement.id !== id);
    
    saveAchievementsToStorage(filteredAchievements);
  },

  // Get a random achievement (for the jar)
  getRandomAchievement: async (): Promise<Achievement | null> => {
    const achievements = getAchievementsFromStorage();
    
    if (achievements.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * achievements.length);
    return achievements[randomIndex];
  }
};