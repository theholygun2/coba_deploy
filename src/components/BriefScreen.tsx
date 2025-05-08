'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';

const BriefScreen: React.FC = () => {
  const { state, updateState } = useAppContext();

  const clientBriefs: Record<string, string> = {
    'LoveSummer': "Hey! I run a local fashion brand for women who love feeling stylish and empowered. Can you create a post that promotes our new summer collection? We want it to feel elegant, fun, and modern.",
    'GoodFood': "Yo! I&apos;m launching a new spicy ramen and I want it to go viral. Make something bold and mouth-watering. Don&apos;t hold back – the caption should slap. This is for flavor lovers.",
    'Gentleman Palace': "Hello. I own a minimalist barbershop focused on precision and clean grooming. I need a social media post for our &quot;Fresh Fade Friday&quot; promo. Keep it sharp, clear, and professional."
  };

  const handleStartCampaign = () => {
    // Start the timer
    updateState({
      timerStart: Date.now(),
      currentStep: 4
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-purple-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Your Brief</h1>
        
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
              {state.clientName[0]}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{state.clientName}</h2>
              <p className="text-sm text-gray-500">{state.clientType} • {state.clientPersonality}</p>
            </div>
          </div>
          
          <div className="bg-gray-100 p-6 rounded-lg border-l-4 border-blue-500 italic">
            {clientBriefs[state.clientName] || 
              `I need a compelling social media post for my ${state.clientType} business. Please create something that matches our brand identity and resonates with our target audience.`
            }
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg mb-8 border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">Your Task</h3>
          <p className="text-yellow-700">
            You have 10 minutes to create an Instagram post for {state.clientName}. 
            You'll need to fill out a campaign form, generate a poster image, write a caption, 
            and submit your work for feedback.
          </p>
        </div>
        
        <button
          onClick={handleStartCampaign}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
        >
          Start Campaign (10:00 Timer)
        </button>
      </div>
    </div>
  );
};

export default BriefScreen;
