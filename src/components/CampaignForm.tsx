'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { generateImage } from '@/services/openai';
import Timer from './Timer';
import Image from 'next/image';

const CampaignForm: React.FC = () => {
  const { state, updateState } = useAppContext();
  const [formData, setFormData] = useState({
    headline: '',
    usp: '',
    cta: '',
    visualDescription: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.headline.trim()) {
      newErrors.headline = 'Headline is required';
    }
    
    if (!formData.usp.trim()) {
      newErrors.usp = 'USP is required';
    }
    
    if (!formData.cta.trim()) {
      newErrors.cta = 'CTA is required';
    }
    
    if (!formData.visualDescription.trim()) {
      newErrors.visualDescription = 'Visual description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGeneratePoster = async () => {
    if (!validateForm()) {
      return;
    }
    
    // Build image prompt based on form data specifically for gpt-image-1 model
    let clientSpecificDetails = '';
    
    if (state.clientType === 'Fashion') {
      clientSpecificDetails = 'Include stylish clothing, modern fashion elements, and an elegant aesthetic. The image should convey sophistication and trendy appeal.';
    } else if (state.clientType === 'F&B') {
      clientSpecificDetails = 'Include appetizing food imagery, vibrant colors, and mouth-watering presentation. The image should make viewers hungry and excited about the food.';
    } else if (state.clientType === 'Barbershop') {
      clientSpecificDetails = 'Include clean, precise grooming imagery, modern barbershop elements, and a professional aesthetic. The image should convey precision and style.';
    }
    
    const imagePrompt = `Create a professional Instagram-style poster for a ${state.clientType} brand with the following details:

Headline: "${formData.headline}"
Unique Selling Proposition: "${formData.usp}"
Call to Action: "${formData.cta}"
Visual Style: ${formData.visualDescription}

${clientSpecificDetails}

The image should be vibrant, visually striking, and suitable for social media marketing. The composition should be clean with balanced elements and professional typography. Create a realistic, high-quality image that would look authentic on Instagram.`;
    
    // Update global state with form data and set loading state
    updateState({
      headline: formData.headline,
      usp: formData.usp,
      cta: formData.cta,
      visualDescription: formData.visualDescription,
      imagePrompt: imagePrompt,
      isGeneratingImage: true
    });
    
    try {
      console.log('Starting image generation with prompt:', imagePrompt);
      
      // Call OpenAI API to generate image with client type
      const imageUrl = await generateImage(imagePrompt, state.clientType);
      
      console.log('Image generation successful, URL:', imageUrl);
      
      // Check if the returned URL is a placeholder (indicating an error)
      if (imageUrl.includes('/placeholder-image.jpg')) {
        throw new Error('Received placeholder image from generation service');
      }
      
      // Log the image URL for debugging
      console.log('Using image URL:', imageUrl);
      
      // Show the image preview instead of immediately proceeding to next step
      setImagePreview(imageUrl);
      setShowPreview(true);
      updateState({
        generatedImage: imageUrl,
        isGeneratingImage: false
      });
    } catch (error) {
      console.error('Error generating image:', error);
      
      // Get client-specific placeholder based on client type
      let placeholderUrl = '/placeholder-image.jpg';
      
      if (state.clientType === 'Fashion') {
        placeholderUrl = '/placeholders/fashion.jpg';
      } else if (state.clientType === 'F&B') {
        placeholderUrl = '/placeholders/food.jpg';
      } else if (state.clientType === 'Barbershop') {
        placeholderUrl = '/placeholders/barbershop.jpg';
      }
      
      setImagePreview(placeholderUrl);
      setShowPreview(true);
      updateState({
        generatedImage: placeholderUrl,
        isGeneratingImage: false
      });
      
      // Use a more subtle notification instead of an alert
      console.warn('Using placeholder image due to generation error');
    }
  };

  // Function to proceed to caption screen
  const handleProceedToCaptionScreen = () => {
    updateState({
      currentStep: 5
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-100 p-4">
      <Timer />
      
      {showPreview ? (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-16">
          <h1 className="text-3xl font-bold text-blue-600 mb-6">Generated Image Preview</h1>
          
          <div className="mb-6 bg-gray-100 p-4 rounded-lg">
            <div className="w-full aspect-square relative rounded-md overflow-hidden">
              {imagePreview && (
                <Image 
                  src={imagePreview}
                  alt="Generated poster image"
                  fill
                  style={{ objectFit: 'cover' }}
                  onError={() => {
                    console.error('Error loading image from URL:', imagePreview);
                    // If image fails to load, use a placeholder image without showing an alert
                    console.warn('Using placeholder image due to loading error');
                    
                    // Always use the main placeholder image to avoid missing file errors
                    setImagePreview('/placeholder-image.jpg');
                  }}
                />
              )}
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setShowPreview(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-md transition duration-200"
            >
              Back to Form
            </button>
            
            <button
              onClick={handleProceedToCaptionScreen}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
            >
              Continue to Caption
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-16">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Campaign Form</h1>
          <p className="text-gray-600 mb-2">
            Fill out the details for {state.clientName}'s {state.clientType} campaign
          </p>
          
          {/* Client Brief Section */}
          <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-blue-500 italic mb-6">
            <h3 className="font-semibold text-gray-800 mb-1 not-italic">Client Brief:</h3>
            {state.clientName === 'LoveSummer' && (
              <p>"Hey! I run a local fashion brand for women who love feeling stylish and empowered. Can you create a post that promotes our new summer collection? We want it to feel elegant, fun, and modern."</p>
            )}
            {state.clientName === 'GoodFood' && (
              <p>"Yo! I'm launching a new spicy ramen and I want it to go viral. Make something bold and mouth-watering. Don't hold back – the caption should slap. This is for flavor lovers."</p>
            )}
            {state.clientName === 'Gentleman Palace' && (
              <p>"Hello. I own a minimalist barbershop focused on precision and clean grooming. I need a social media post for our \"Fresh Fade Friday\" promo. Keep it sharp, clear, and professional."</p>
            )}
            {!['LoveSummer', 'GoodFood', 'Gentleman Palace'].includes(state.clientName) && (
              <p>"I need a compelling social media post for my {state.clientType} business. Please create something that matches our brand identity and resonates with our target audience."</p>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Headline
              </label>
              <input
                type="text"
                id="headline"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.headline ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter a catchy headline"
              />
              {errors.headline && <p className="mt-1 text-sm text-red-600">{errors.headline}</p>}
            </div>
            
            <div>
              <label htmlFor="usp" className="block text-sm font-medium text-gray-700 mb-1">
                Unique Selling Proposition (USP)
              </label>
              <input
                type="text"
                id="usp"
                name="usp"
                value={formData.usp}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.usp ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="What makes this product/service special?"
              />
              {errors.usp && <p className="mt-1 text-sm text-red-600">{errors.usp}</p>}
            </div>
            
            <div>
              <label htmlFor="cta" className="block text-sm font-medium text-gray-700 mb-1">
                Call to Action (CTA)
              </label>
              <input
                type="text"
                id="cta"
                name="cta"
                value={formData.cta}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.cta ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="What should viewers do next?"
              />
              {errors.cta && <p className="mt-1 text-sm text-red-600">{errors.cta}</p>}
            </div>
            
            <div>
              <label htmlFor="visualDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Visual Description
              </label>
              <textarea
                id="visualDescription"
                name="visualDescription"
                value={formData.visualDescription}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border ${errors.visualDescription ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Describe the visual style, colors, mood, and elements you want in the poster"
              />
              {errors.visualDescription && <p className="mt-1 text-sm text-red-600">{errors.visualDescription}</p>}
            </div>
            
            <button
              onClick={handleGeneratePoster}
              disabled={state.isGeneratingImage}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {state.isGeneratingImage ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Image...
                </>
              ) : (
                'Generate Poster'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignForm;
