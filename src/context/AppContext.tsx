'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the types based on the variables from the PRD
interface AppState {
  userName: string;
  clientName: string;
  clientType: string;
  clientPersonality: string;
  headline: string;
  usp: string;
  cta: string;
  visualDescription: string;
  imagePrompt: string;
  generatedImage: string | null;
  captionText: string;
  timerStart: number | null;
  feedbackMessage: string;
  score: number | null;
  currentStep: number;
  elapsedTime: number;
  isGeneratingImage: boolean;
  isGeneratingCaption: boolean;
  isGeneratingFeedback: boolean;
}

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  updateState: (updates: Partial<AppState>) => void;
  resetState: () => void;
}

const initialState: AppState = {
  userName: '',
  clientName: '',
  clientType: '',
  clientPersonality: '',
  headline: '',
  usp: '',
  cta: '',
  visualDescription: '',
  imagePrompt: '',
  generatedImage: null,
  captionText: '',
  timerStart: null,
  feedbackMessage: '',
  score: null,
  currentStep: 1, // Start at welcome screen
  elapsedTime: 0,
  isGeneratingImage: false,
  isGeneratingCaption: false,
  isGeneratingFeedback: false
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(initialState);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState(initialState);
  };

  return (
    <AppContext.Provider value={{ state, setState, updateState, resetState }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
