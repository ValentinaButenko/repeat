"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

interface GenerationProgress {
  isVisible: boolean;
  current: number;
  total: number;
  setName: string;
  onStop?: () => void;
}

interface GenerationContextType {
  progress: GenerationProgress;
  showProgress: (current: number, total: number, setName: string, onStop?: () => void) => void;
  updateProgress: (current: number) => void;
  hideProgress: () => void;
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export function GenerationProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<GenerationProgress>({
    isVisible: false,
    current: 0,
    total: 0,
    setName: '',
  });

  const showProgress = (current: number, total: number, setName: string, onStop?: () => void) => {
    setProgress({
      isVisible: true,
      current,
      total,
      setName,
      onStop,
    });
  };

  const updateProgress = (current: number) => {
    setProgress(prev => ({
      ...prev,
      current,
    }));
  };

  const hideProgress = () => {
    setProgress(prev => ({
      ...prev,
      isVisible: false,
    }));
  };

  return (
    <GenerationContext.Provider value={{ progress, showProgress, updateProgress, hideProgress }}>
      {children}
    </GenerationContext.Provider>
  );
}

export function useGeneration() {
  const context = useContext(GenerationContext);
  if (context === undefined) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
}
