'use client';

import React, { useState } from 'react';
import { generateImage } from '@/services/openai';

const SupabaseTest: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Generate the image and get the Supabase URL
      const generatedImageUrl = await generateImage(prompt);
      setImageUrl(generatedImageUrl);
    } catch (err: any) {
      console.error('Error in image generation workflow:', err);
      setError(err.message || 'Failed to generate image');
      setImageUrl('/placeholder-image.jpg');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-16">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Image Generation Test</h1>
        <p className="text-gray-600 mb-6">
          Test the OpenAI + Supabase image generation workflow
        </p>
        
        <form onSubmit={handleGenerateImage} className="mb-6">
          <div className="mb-4">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Image Prompt
            </label>
            <input
              id="prompt"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a creative prompt for image generation..."
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Image...
              </>
            ) : (
              'Generate Image'
            )}
          </button>
        </form>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        {imageUrl && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Generated Image:</h2>
            <div className="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
              <img 
                src={imageUrl} 
                alt="Generated image" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error('Error loading image from URL:', imageUrl);
                  e.currentTarget.src = '/placeholder-image.jpg';
                  setError('Failed to load the generated image');
                }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 break-all">
              Image URL: {imageUrl}
            </p>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-500">
          <p>This component tests the complete image generation workflow:</p>
          <ol className="list-decimal ml-5 mt-2 space-y-1">
            <li>Takes a prompt from the user</li>
            <li>Sends it to OpenAI's gpt-image-1 model</li>
            <li>Downloads the generated image</li>
            <li>Uploads it to Supabase Storage</li>
            <li>Displays the Supabase-hosted image</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTest;
