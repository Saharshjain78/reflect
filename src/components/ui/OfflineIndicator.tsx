import React, { useState } from 'react';
import { WifiOff, X } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-amber-500 text-amber-900 px-4 py-3 mb-4 rounded-lg shadow-sm animate-fade-in flex items-center justify-between">
      <div className="flex items-center">
        <WifiOff size={18} className="mr-2" />
        <span>
          You're currently offline. Journal entries will be saved locally and synced when you're back online.
        </span>
      </div>
      <button
        onClick={() => setIsDismissed(true)}
        className="ml-2 p-1 hover:bg-amber-400 rounded-full transition-colors"
        aria-label="Dismiss offline notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default OfflineIndicator;