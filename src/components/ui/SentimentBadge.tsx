import React from 'react';
import { JournalEntry } from '../../types';

interface SentimentBadgeProps {
  sentiment: JournalEntry['sentiment'];
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SentimentBadge: React.FC<SentimentBadgeProps> = ({ 
  sentiment, 
  size = 'md',
  showLabel = false 
}) => {
  if (!sentiment) return null;

  const { label, score } = sentiment;
  
  // Color based on sentiment
  const getBgColor = () => {
    if (label === 'Positive') return 'bg-green-500';
    if (label === 'Negative') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const getTextColor = () => {
    if (label === 'Positive') return 'text-green-800';
    if (label === 'Negative') return 'text-red-800';
    return 'text-yellow-800';
  };

  const getBgColorLight = () => {
    if (label === 'Positive') return 'bg-green-100';
    if (label === 'Negative') return 'bg-red-100';
    return 'bg-yellow-100';
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="inline-flex items-center">
      {showLabel ? (
        <div className={`${getBgColorLight()} ${getTextColor()} rounded-full px-2.5 py-0.5 flex items-center ${textSizeClasses[size]}`}>
          <div className={`${getBgColor()} rounded-full ${sizeClasses[size]} mr-1.5`}></div>
          <span>{label}</span>
        </div>
      ) : (
        <div className={`${getBgColor()} rounded-full ${sizeClasses[size]}`} title={`Mood: ${label} (${score.toFixed(2)})`}></div>
      )}
    </div>
  );
};

export default SentimentBadge;