import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Heart, Star } from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardBody } from '../ui/Card';
import { Achievement } from '../../types';

interface AchievementListProps {
  achievements: Achievement[];
  onAdd: () => void;
  onEdit: (achievement: Achievement) => void;
  onDelete: (id: string) => void;
}

const AchievementList: React.FC<AchievementListProps> = ({
  achievements,
  onAdd,
  onEdit,
  onDelete
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      // Auto-cancel after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Achievement Jar</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your collection of proud moments ({achievements.length} achievements)
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={onAdd}>
          Add Achievement
        </Button>
      </div>

      {achievements.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Star size={24} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">Start Building Your Achievement Jar</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Add at least 10 achievements, proud moments, or positive experiences. 
              They'll automatically appear when you need a mood boost during challenging times.
            </p>
            <Button variant="primary" onClick={onAdd}>
              Add Your First Achievement
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(achievement => (
            <Card key={achievement.id} className="hover:shadow-md transition-shadow">
              <CardBody>
                <div className="flex justify-between items-start mb-3">
                  {achievement.emoji && (
                    <div className="text-2xl">{achievement.emoji}</div>
                  )}
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onEdit(achievement)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(achievement.id)}
                      className={`p-1 transition-colors ${
                        deleteConfirm === achievement.id
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold mb-2 line-clamp-2">
                  {achievement.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                  {achievement.description}
                </p>

                {achievement.imageUrl && (
                  <div className="mb-3">
                    <img 
                      src={achievement.imageUrl} 
                      alt="Achievement" 
                      className="w-full h-24 object-cover rounded-md"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {formatDate(achievement.date)}
                  </div>
                  {achievement.feeling && (
                    <div className="flex items-center">
                      <Heart size={12} className="mr-1 text-red-400" />
                      <span className="truncate max-w-20">{achievement.feeling}</span>
                    </div>
                  )}
                </div>

                {deleteConfirm === achievement.id && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                    <p className="text-red-700 dark:text-red-300 text-xs">
                      Click delete again to confirm
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {achievements.length > 0 && achievements.length < 10 && (
        <Card className="mt-6">
          <CardBody className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Add {10 - achievements.length} more achievements to complete your initial collection
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(achievements.length / 10) * 100}%` }}
              />
            </div>
            <Button variant="outline" onClick={onAdd}>
              Add Another Achievement
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default AchievementList;