import React, { useState } from 'react';
import { Save, Calendar, Heart, Image, Smile } from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardHeader, CardBody, CardFooter } from '../ui/Card';
import { Achievement } from '../../types';

interface AchievementFormProps {
  onSave: (achievement: Omit<Achievement, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initialData?: Partial<Achievement>;
}

const AchievementForm: React.FC<AchievementFormProps> = ({
  onSave,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    feeling: initialData?.feeling || '',
    emoji: initialData?.emoji || '',
    imageUrl: initialData?.imageUrl || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const commonEmojis = ['🏆', '🎉', '🌟', '💪', '🎯', '🚀', '💡', '❤️', '🎊', '🔥', '⭐', '🎈'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Add Achievement</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Record a moment you're proud of to boost your mood during tough times
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardBody className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Achievement Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 
                dark:bg-gray-800 dark:text-white
                ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
              `}
              placeholder="e.g., Completed my first marathon"
              maxLength={100}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 
                dark:bg-gray-800 dark:text-white h-24
                ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
              `}
              placeholder="Describe what you accomplished and why it matters to you..."
              maxLength={500}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar size={16} className="inline mr-1" />
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 
                dark:bg-gray-800 dark:text-white
                ${errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
              `}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          {/* Feeling */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Heart size={16} className="inline mr-1" />
              How did it make you feel?
            </label>
            <input
              type="text"
              value={formData.feeling}
              onChange={(e) => handleChange('feeling', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              placeholder="e.g., Proud, accomplished, confident, grateful..."
              maxLength={50}
            />
          </div>

          {/* Emoji */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Smile size={16} className="inline mr-1" />
              Choose an emoji (optional)
            </label>
            <div className="grid grid-cols-6 gap-2 mb-3">
              {commonEmojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleChange('emoji', emoji)}
                  className={`
                    w-12 h-12 text-2xl rounded-md border-2 transition-all
                    ${formData.emoji === emoji 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={formData.emoji}
              onChange={(e) => handleChange('emoji', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              placeholder="Or type your own emoji..."
              maxLength={10}
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Image size={16} className="inline mr-1" />
              Image URL (optional)
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              placeholder="https://example.com/image.jpg"
            />
            {formData.imageUrl && (
              <div className="mt-2">
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </CardBody>

        <CardFooter className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" leftIcon={<Save size={16} />}>
            Save Achievement
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AchievementForm;