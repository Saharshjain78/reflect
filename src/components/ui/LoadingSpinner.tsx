import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex justify-center items-center h-full w-full p-4">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary-600 dark:border-primary-400 ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default LoadingSpinner;