import React, { useState, useEffect } from 'react';
import { X, Star, Sparkles, Trophy, Heart, Calendar } from 'lucide-react';
import { Achievement } from '../../types';
import Button from '../ui/Button';

interface AchievementJarProps {
  isVisible: boolean;
  onClose: () => void;
  achievements: Achievement[];
  onAddAchievement?: () => void;
}

const AchievementJar: React.FC<AchievementJarProps> = ({
  isVisible,
  onClose,
  achievements,
  onAddAchievement
}) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (isVisible && achievements.length > 0) {
      // Select a random achievement
      const randomIndex = Math.floor(Math.random() * achievements.length);
      setSelectedAchievement(achievements[randomIndex]);
      setIsAnimating(true);
      
      // Generate sparkles
      const newSparkles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2
      }));
      setSparkles(newSparkles);

      // Reset animation after delay
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, achievements]);

  if (!isVisible) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      {/* Warm golden glow overlay */}
      <div 
        className={`
          absolute inset-0 transition-all duration-2000 ease-out
          ${isVisible ? 'bg-gradient-radial from-yellow-200/20 via-orange-100/10 to-transparent' : 'bg-transparent'}
        `}
      />
      
      {/* Sparkles */}
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="absolute animate-ping"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            animationDelay: `${sparkle.delay}s`,
            animationDuration: '2s'
          }}
        >
          <Sparkles size={16} className="text-yellow-400 opacity-70" />
        </div>
      ))}

      <div className="relative max-w-lg mx-4 w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Achievement Jar */}
        <div className="relative">
          {/* Jar container */}
          <div 
            className={`
              relative bg-gradient-to-b from-blue-50/80 to-blue-100/60 dark:from-blue-900/30 dark:to-blue-800/20
              rounded-t-3xl rounded-b-lg border-2 border-blue-200/50 dark:border-blue-700/50
              backdrop-blur-sm shadow-2xl p-8 pt-12
              transform transition-all duration-1000 ease-out
              ${isAnimating ? 'scale-105 rotate-1' : 'scale-100 rotate-0'}
            `}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,248,255,0.8) 100%)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)'
            }}
          >
            {/* Jar lid */}
            <div 
              className={`
                absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-6
                bg-gradient-to-b from-amber-400 to-amber-600 rounded-full
                border-2 border-amber-500 shadow-lg
                transition-all duration-500 ease-out
                ${isAnimating ? '-translate-y-2 rotate-12' : 'translate-y-0 rotate-0'}
              `}
            >
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-amber-300 rounded-full" />
            </div>

            {/* Jar label */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <Trophy size={14} className="mr-1 text-yellow-500" />
                  Achievement Jar
                </span>
              </div>
            </div>

            {achievements.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Trophy size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Your jar is empty</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  Add your achievements and proud moments to create your personal mood booster!
                </p>
                <Button variant="primary" onClick={onAddAchievement}>
                  Add Your First Achievement
                </Button>
              </div>
            ) : selectedAchievement ? (
              <div className="text-center">
                {/* Achievement card */}
                <div 
                  className={`
                    bg-white/95 dark:bg-gray-800/95 rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-600/50
                    transform transition-all duration-700 ease-out
                    ${isAnimating ? 'scale-105 -rotate-1' : 'scale-100 rotate-0'}
                  `}
                >
                  {/* Achievement emoji/icon */}
                  {selectedAchievement.emoji && (
                    <div className="text-4xl mb-3">
                      {selectedAchievement.emoji}
                    </div>
                  )}

                  {/* Achievement title */}
                  <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">
                    {selectedAchievement.title}
                  </h3>

                  {/* Achievement description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {selectedAchievement.description}
                  </p>

                  {/* Date and feeling */}
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(selectedAchievement.date)}
                    </div>
                    {selectedAchievement.feeling && (
                      <div className="flex items-center">
                        <Heart size={14} className="mr-1 text-red-400" />
                        {selectedAchievement.feeling}
                      </div>
                    )}
                  </div>

                  {/* Achievement image */}
                  {selectedAchievement.imageUrl && (
                    <div className="mb-4">
                      <img 
                        src={selectedAchievement.imageUrl} 
                        alt="Achievement" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Inspirational message */}
                <div 
                  className={`
                    mt-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30
                    rounded-lg border border-yellow-200 dark:border-yellow-700/50
                    transform transition-all duration-1000 ease-out delay-500
                    ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                  `}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Star size={20} className="text-yellow-500 mr-2" />
                    <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Keep it up!
                    </span>
                    <Star size={20} className="text-yellow-500 ml-2" />
                  </div>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    You've overcome challenges before, and you'll do it again. 
                    This moment of difficulty will pass, just like the others did.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex justify-center space-x-3 mt-6">
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Thank You
                  </Button>
                  {onAddAchievement && (
                    <Button variant="primary" size="sm" onClick={onAddAchievement}>
                      Add New Achievement
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementJar;