"use client";
import { useState, useEffect } from 'react';
import { StopCircle } from '@phosphor-icons/react';

interface ProgressPopoverProps {
  isVisible: boolean;
  current: number;
  total: number;
  setName: string;
  onStop: () => void;
}

export default function ProgressPopover({ isVisible, current, total, setName, onStop }: ProgressPopoverProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isVisible) return null;

  const progressPercentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-[#F6F4F0] border border-[#E8E2D9] rounded-lg shadow-lg" style={{ padding: '24px', width: '680px' }}>
        {/* Title and Stop button row */}
        <div className="flex items-start justify-between gap-4" style={{ marginBottom: '16px' }}>
          <div 
            className="text-[#1C1D17]" 
            style={{ 
              fontFamily: 'var(--font-bitter)', 
              fontWeight: 500, 
              fontSize: '16px'
            }}
          >
            Generating {current} of {total} cards in {setName}
          </div>
          
          <button
            onClick={onStop}
            className="text-[#1C1D17] hover:opacity-70 transition-opacity flex-shrink-0"
            aria-label="Stop generation"
          >
            <StopCircle size={20} />
          </button>
        </div>
        
        {/* Progress bar - full width */}
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-[#1C1D17] h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
