'use client';

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';

const Timer: React.FC = () => {
  const { state, updateState } = useAppContext();
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes in seconds
  const [clientSide, setClientSide] = useState(false);

  // Only run on client side
  useEffect(() => {
    setClientSide(true);
  }, []);

  // Initialize and update timer
  useEffect(() => {
    if (!clientSide) return;
    
    // If timer hasn't started, don't do anything
    if (!state.timerStart) return;
    
    // Calculate initial time left and elapsed time
    const calculateTimes = () => {
      const now = Date.now();
      // Handle the case where timerStart might be null
      if (state.timerStart === null) return { remaining: 600, elapsed: 0 };
      const elapsed = Math.floor((now - state.timerStart) / 1000);
      const remaining = Math.max(600 - elapsed, 0);
      return { remaining, elapsed };
    };
    
    // Get initial times
    const { remaining, elapsed } = calculateTimes();
    
    // Set initial time left
    setTimeLeft(remaining);
    
    // Update global state with elapsed time
    updateState({ elapsedTime: elapsed });
    
    // Update timer every second
    const interval = setInterval(() => {
      const { remaining, elapsed } = calculateTimes();
      setTimeLeft(remaining);
      
      // Update global state with elapsed time
      updateState({ elapsedTime: elapsed });
      
      // If timer reaches zero, clear interval
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    
    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [clientSide, state.timerStart, updateState]);

  // Format time display
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Don't render anything during SSR to avoid hydration mismatch
  if (!clientSide) return null;

  return (
    <div className="fixed top-4 right-4 bg-white shadow-md rounded-lg p-2 text-center">
      <div className="text-sm font-semibold text-gray-600">Time Remaining</div>
      <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-blue-600'}`}>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
    </div>
  );
};

export default Timer;
