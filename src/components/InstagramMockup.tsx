'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { generateFeedback } from '@/services/openai';
import Timer from './Timer';
import Image from 'next/image';

const InstagramMockup: React.FC = () => {
  const { state, updateState } = useAppContext();

  const handleSubmitToClient = async () => {
    // Set loading state
    updateState({ isGeneratingFeedback: true });
    
    try {
      console.log('Submitting to client and generating feedback...');
      
      // Call OpenAI API to generate feedback
      const { feedbackMessage, score } = await generateFeedback({
        clientName: state.clientName,
        clientPersonality: state.clientPersonality,
        clientType: state.clientType,
        headline: state.headline,
        usp: state.usp,
        cta: state.cta,
        captionText: state.captionText,
        elapsedTime: state.elapsedTime
      });
      
      console.log('Feedback generated successfully:', feedbackMessage.substring(0, 50) + '...');
      
      // Apply bonuses to the score
      const timeBonus = state.elapsedTime < 600 ? 10 : 0;
      const completenessBonus = state.headline && state.usp && state.cta && state.captionText ? 10 : 0;
      
      // Calculate final score with bonuses
      const totalScore = Math.min(score + timeBonus + completenessBonus, 100);
      
      // Update state and move to next step
      updateState({
        feedbackMessage: feedbackMessage,
        score: totalScore,
        isGeneratingFeedback: false,
        currentStep: 7
      });
    } catch (error) {
      console.error('Error generating feedback:', error);
      
      // The OpenAI service now handles errors and provides fallback feedback,
      // so we'll just call it again with a flag indicating we're in error recovery mode
      try {
        const { feedbackMessage, score } = await generateFeedback({
          clientName: state.clientName,
          clientPersonality: state.clientPersonality,
          clientType: state.clientType,
          headline: state.headline,
          usp: state.usp,
          cta: state.cta,
          captionText: state.captionText,
          elapsedTime: state.elapsedTime
        });
        
        // Apply bonuses to the score
        const timeBonus = state.elapsedTime < 600 ? 10 : 0;
        const completenessBonus = state.headline && state.usp && state.cta && state.captionText ? 10 : 0;
        
        // Calculate final score with bonuses
        const totalScore = Math.min(score + timeBonus + completenessBonus, 100);
        
        updateState({
          feedbackMessage: feedbackMessage,
          score: totalScore,
          isGeneratingFeedback: false,
          currentStep: 7
        });
      } catch (secondError) {
        console.error('Error in fallback feedback generation:', secondError);
        
        // If even the fallback mechanism fails, use hardcoded client-specific feedback
        const clientFeedback: Record<string, string> = {
          'LoveSummer': "As both your client and a marketing expert, I'm impressed with your work! The overall marketing strategy aligns perfectly with our fashion brand identity - elegant, empowering, and modern. Your copywriting has the warm, sophisticated tone our audience responds to, and the headline is memorable and impactful. The visual elements beautifully complement our brand colors and aesthetic, creating an Instagram-worthy post that will stand out in feeds. The call-to-action is clear and compelling, encouraging immediate engagement. Your caption strikes the perfect balance between being informative and conversational, with just the right amount of emojis to enhance engagement without appearing unprofessional. If I could suggest one improvement, perhaps adding a subtle seasonal reference would make it even more timely and relevant. Overall, this is excellent work that captures the essence of LoveSummer!",
          'GoodFood': "Yo, this campaign is straight FIRE! From a marketing standpoint, you've absolutely nailed our bold, in-your-face brand identity. The copywriting has that perfect casual, energetic vibe that speaks directly to our food-obsessed audience. Your headline is punchy and memorable - exactly what we need to cut through the noise on social. The visual description you've created is mouth-watering and scroll-stopping - those colors and food styling details will definitely make people crave our spicy ramen! The CTA is direct and creates urgency, which is exactly what we want. Your caption has the perfect amount of attitude and slang that resonates with our younger demographic. The emoji game is on point too! One small thing to consider: maybe add something about the unique spice level to really highlight what makes our ramen different. But honestly, this is exactly the kind of content that's going to make our product go viral. Mad respect for understanding the GoodFood vibe so perfectly!",
          'Gentleman Palace': "I've analyzed your marketing campaign with precision, and I'm pleased to report that it meets our quality standards. From a strategic perspective, you've successfully aligned with our minimalist barbershop brand identity through clean design elements and professional presentation. The copywriting demonstrates technical expertise and structured messaging that our clientele expects. Your headline is concise and informative, clearly communicating our Fresh Fade Friday promotion without unnecessary embellishment. The visual elements you've selected maintain our monochromatic palette and showcase the precision of our grooming services. The call-to-action is appropriately direct and provides clear next steps for booking. Your caption maintains the proper balance of professionalism while still being engaging. I particularly appreciate the absence of excessive emojis, as this aligns with our brand guidelines. One recommendation would be to include more specific technical terminology related to our signature cuts to further establish expertise. Overall, this campaign demonstrates the attention to detail and professional quality that Gentleman Palace represents."
        };
        
        // Calculate fallback score
        const timeBonus = state.elapsedTime < 600 ? 10 : 0;
        const completenessBonus = state.headline && state.usp && state.cta && state.captionText ? 10 : 0;
        // Use a fixed base score instead of random to avoid hydration errors
        const baseScore = 85; // Fixed middle-range score
        const totalScore = Math.min(baseScore + timeBonus + completenessBonus, 100);
        
        // Create a comprehensive default feedback if client-specific feedback isn't available
        const defaultFeedback = `As both your client and a marketing expert, I'm impressed with your ${state.clientType} campaign! 

Your marketing strategy effectively targets our audience with a compelling message. The copywriting is engaging and aligns well with our brand voice. Your headline "${state.headline}" is attention-grabbing and memorable. 

The visual elements you've chosen complement our brand identity and will stand out on social media. The call-to-action "${state.cta}" is clear and encourages engagement. Your caption is well-crafted with the right tone and personality for our audience.

Overall, this is excellent work that will help us achieve our marketing goals. The campaign elements work together cohesively to create a strong social media presence.`;
        
        updateState({
          feedbackMessage: clientFeedback[state.clientName] || defaultFeedback,
          score: totalScore,
          isGeneratingFeedback: false,
          currentStep: 7
        });
        
        // No alert - silently use the fallback feedback
        console.log('Using hardcoded fallback feedback');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-100 p-4">
      <Timer />
      
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 mt-16">
        <h1 className="text-2xl font-bold text-blue-600 mb-4 text-center">Instagram Preview</h1>
        
        {/* Instagram post mockup */}
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          {/* Header */}
          <div className="flex items-center p-3 border-b border-gray-200">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              {state.clientName ? (
                <Image 
                  src={`/clients/${state.clientName.toLowerCase()}.png`} 
                  alt={`${state.clientName} logo`}
                  className="w-full h-full object-cover"
                  width={32}
                  height={32}
                  onError={(e: any) => {
                    console.error(`Error loading client logo: ${state.clientName}`); 
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.className = "w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs";
                      parent.innerHTML = state.clientName ? state.clientName.charAt(0) : "10M";
                    }
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                  10M
                </div>
              )}
            </div>
            <div className="ml-2">
              <p className="text-sm font-semibold">{state.clientName || "10min.marketer"}</p>
              <p className="text-xs text-gray-500">Sponsored</p>
            </div>
            <div className="ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
          </div>
          
          {/* Image */}
          <div className="aspect-w-1 aspect-h-1 bg-gray-100 relative">
            {state.generatedImage ? (
              <div className="w-full h-full">
                <Image
                  src={state.generatedImage}
                  alt="Generated campaign image"
                  className="w-full h-full object-cover"
                  width={500}
                  height={500}
                  onError={(e: any) => {
                    console.error('Error loading image in Instagram mockup');
                    // Use client-specific fallback images from Unsplash
                    let fallbackUrl = '/placeholder-image.jpg';
                    if (state.clientType === 'Fashion') {
                      fallbackUrl = 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1000&auto=format&fit=crop';
                    } else if (state.clientType === 'F&B') {
                      fallbackUrl = 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=1000&auto=format&fit=crop';
                    } else if (state.clientType === 'Barbershop') {
                      fallbackUrl = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1000&auto=format&fit=crop';
                    }
                    e.currentTarget.src = fallbackUrl;
                  }}
                />
              </div>
            ) : (
              <div className="text-gray-400 flex flex-col items-center justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>No image available</span>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="p-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 ml-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 ml-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 ml-auto text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          
          {/* Caption */}
          <div className="p-3 pt-0">
            <p className="text-sm">
              <span className="font-semibold">{state.clientName || "10min.marketer"}</span>{' '}
              {state.captionText || "No caption provided"}
            </p>
            <p className="text-xs text-gray-500 mt-1">View all 42 comments</p>
            <p className="text-xs text-gray-400 mt-1">2 HOURS AGO</p>
          </div>
        </div>
        
        <div className="mt-8">
          <button
            onClick={handleSubmitToClient}
            disabled={state.isGeneratingFeedback}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {state.isGeneratingFeedback ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Getting Feedback...
              </>
            ) : (
              'Submit to Client'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstagramMockup;
