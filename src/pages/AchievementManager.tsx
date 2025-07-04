import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AchievementList from '../components/achievement/AchievementList';
import AchievementForm from '../components/achievement/AchievementForm';
import { Achievement } from '../types';
import { achievementService } from '../services/achievementService';

const AchievementManager: React.FC = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setIsLoading(true);
      const data = await achievementService.getAchievements();
      setAchievements(data);
    } catch (error) {
      console.error('Failed to load achievements', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (achievementData: Omit<Achievement, 'id' | 'createdAt'>) => {
    try {
      if (editingAchievement) {
        const updated = await achievementService.updateAchievement(editingAchievement.id, achievementData);
        setAchievements(prev => prev.map(a => a.id === editingAchievement.id ? updated : a));
      } else {
        const newAchievement = await achievementService.createAchievement(achievementData);
        setAchievements(prev => [newAchievement, ...prev]);
      }
      setShowForm(false);
      setEditingAchievement(null);
    } catch (error) {
      console.error('Failed to save achievement', error);
    }
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await achievementService.deleteAchievement(id);
      setAchievements(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to delete achievement', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAchievement(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-4"
        >
          <ArrowLeft size={20} className="mr-1" />
          <span>Back</span>
        </button>
      </div>

      {showForm ? (
        <AchievementForm
          onSave={handleSave}
          onCancel={handleCancel}
          initialData={editingAchievement || undefined}
        />
      ) : (
        <AchievementList
          achievements={achievements}
          onAdd={() => setShowForm(true)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default AchievementManager;