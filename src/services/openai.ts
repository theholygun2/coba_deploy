import OpenAI from 'openai';

// Get API key from environment variable
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

// Initialize the OpenAI client
const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made from the server
}) : null;

export const getOpenAI = () => {
  return openai;
};

/**
 * Generate an image using OpenAI's gpt-image-1 model
 * 
 * @param prompt The text prompt to generate an image from
 * @param clientType The type of client (Fashion, F&B, Barbershop)
 * @returns URL or base64 data of the generated image
 */
export const generateImage = async (prompt: string, clientType: string): Promise<string> => {
  const client = getOpenAI();
  
  if (!client) {
    console.error('OpenAI client not initialized');
    return '/placeholder-image.jpg';
  }
  
  // Set client name based on client type - not used in this function but kept for reference
  // const clientName = clientType === 'Fashion' ? 'LoveSummer' : 
  //                    clientType === 'F&B' ? 'GoodFood' : 
  //                    clientType === 'Barbershop' ? 'GentlemanPalace' : '';
  
  // Use the original prompt without logo instructions
  const enhancedPrompt = prompt;
  
  try {
    console.log('Generating image with prompt:', enhancedPrompt);
    
    // Using gpt-image-1 model as specified in the documentation
    const response = await client.images.generate({
      model: 'gpt-image-1',
      prompt: enhancedPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'high'
      // No response_format parameter as it's not supported by gpt-image-1
    });
    
    console.log('Image generation response received');
    
    // Flexible response handling for both URL and base64 data
    if (response.data && response.data.length > 0) {
      const imageResult = response.data[0];
      
      if (imageResult.b64_json) {
        // If we got base64 data, create a data URL
        return `data:image/png;base64,${imageResult.b64_json}`;
      } else if (imageResult.url) {
        // If we got a URL, return it directly
        return imageResult.url;
      }
    }
    
    console.error('No image data in response');
    return '/placeholder-image.jpg';
  } catch (error) {
    const handleError = (err: unknown) => {
      console.error('Error generating image:', err);
      
      // Log detailed error information
      if (err && typeof err === 'object' && 'response' in err && err.response) {
        console.error('Error response:', (err.response as any).data);
        console.error('Error status:', (err.response as any).status);
      } else if (err instanceof Error) {
        console.error('Error message:', err.message);
      }
      
      // For demo purposes, return client-specific placeholder images as fallback
      if (clientType === 'Fashion') {
        return 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1000&auto=format&fit=crop';
      } else if (clientType === 'F&B') {
        return 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=1000&auto=format&fit=crop';
      } else if (clientType === 'Barbershop') {
        return 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1000&auto=format&fit=crop';
      } else {
        return 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=1000&auto=format&fit=crop';
      }
    };
    
    return handleError(error);
  }
};

/**
 * Get a placeholder image based on the prompt content
 * Uses local images to avoid external URL issues
 */
export const getPlaceholderImage = (promptText: string): string => {
  // Return a placeholder image based on the prompt or client type
  if (promptText.toLowerCase().includes('fashion') || promptText.toLowerCase().includes('clothing')) {
    return '/placeholders/fashion.jpg';
  } else if (promptText.toLowerCase().includes('food') || promptText.toLowerCase().includes('restaurant')) {
    return '/placeholders/food.jpg';
  } else if (promptText.toLowerCase().includes('barber') || promptText.toLowerCase().includes('haircut')) {
    return '/placeholders/barbershop.jpg';
  }
  
  // Default placeholder
  return '/placeholder-image.jpg';
};

/**
 * Generate feedback from a client using OpenAI's GPT-4 Turbo
 * @param params Parameters for feedback generation
 * @returns Generated feedback and score
 */
export const generateFeedback = async (params: {
  clientName: string;
  clientPersonality: string;
  clientType: string;
  headline: string;
  usp: string;
  cta: string;
  captionText: string;
  elapsedTime: number;
}): Promise<{ feedbackMessage: string; score: number }> => {
  const client = getOpenAI();
  
  if (!client) {
    throw new Error('OpenAI client not initialized. Please provide an API key.');
  }
  
  // Get the client's personal name based on business name
  let clientPersonalName = '';
  if (params.clientName === 'LoveSummer') {
    clientPersonalName = 'Rina';
  } else if (params.clientName === 'GoodFood') {
    clientPersonalName = 'Budi';
  } else if (params.clientName === 'Gentleman Palace') {
    clientPersonalName = 'Brian';
  } else {
    clientPersonalName = 'Alex'; // Default name if client name is not recognized
  }

  const prompt = `You are the client reviewing an Instagram marketing post for your business. Your name is ${clientPersonalName} and you own ${params.clientName}. Based on the following inputs, generate a comprehensive, detailed feedback message that SPECIFICALLY comments on the exact content submitted and give a quality score (0–100).

Inputs:
- Your Name: ${clientPersonalName}
- Your Business: ${params.clientName} (${params.clientType})
- Your Personality: ${params.clientPersonality}
- Headline Submitted: "${params.headline}"
- USP Submitted: "${params.usp}"
- CTA Submitted: "${params.cta}"
- Caption Submitted: "${params.captionText}"
- Time Taken (in seconds): ${params.elapsedTime}

Client Details:
- Rina owns LoveSummer: A warm, encouraging, and sophisticated fashion brand for women who love feeling stylish and empowered
- Budi owns GoodFood: A direct, playful, and bold F&B business launching a new spicy ramen targeting flavor lovers
- Brian owns Gentleman Palace: A technical, structured, and minimalist barbershop focused on precision and clean grooming

Your feedback MUST:
1. Start by introducing yourself by your first name (e.g., "Hey there, Rina from LoveSummer here!")
2. DIRECTLY QUOTE and comment on the specific headline, USP, CTA, and caption submitted
3. Mention specific elements of the visual/image that you liked or would improve
4. Maintain your brand's voice throughout

Analyze each of these marketing aspects in detail, ALWAYS referring to the specific content submitted:

1. HEADLINE ANALYSIS (20% of feedback):
   - DIRECTLY QUOTE the headline: "${params.headline}"
   - Provide specific feedback on this exact headline
   - Suggest specific improvements or praise specific elements

2. USP ANALYSIS (20% of feedback):
   - DIRECTLY QUOTE the USP: "${params.usp}"
   - Comment on how effectively it communicates your brand's unique value
   - Suggest specific improvements or praise specific elements

3. CALL-TO-ACTION ANALYSIS (20% of feedback):
   - DIRECTLY QUOTE the CTA: "${params.cta}"
   - Analyze its effectiveness for your specific audience
   - Suggest specific improvements or praise specific elements

4. CAPTION ANALYSIS (20% of feedback):
   - DIRECTLY QUOTE parts of the caption: "${params.captionText.substring(0, 50)}..."
   - Comment on tone, length, engagement potential, and brand alignment
   - Suggest specific improvements or praise specific elements

5. VISUAL ELEMENTS (10% of feedback):
   - Comment on specific elements of the generated image
   - Discuss color scheme, composition, and brand alignment
   - Suggest specific improvements or praise specific elements

6. OVERALL CAMPAIGN EFFECTIVENESS (10% of feedback):
   - How well all elements work together for your specific business
   - Comment on the cohesiveness of the marketing message

Your feedback should be written in first person, as if you (the actual client) wrote it, with your specific voice and concerns. DO NOT mention being a marketing expert - speak purely as the business owner. BE SPECIFIC and DIRECTLY REFERENCE the actual content submitted.

Output Format:
Feedback: "...comprehensive, detailed message directly referencing the submitted content..."
Score: XX`;

  try {
    console.log('Starting feedback generation with prompt:', prompt);
    
    // Create a timeout promise to handle API timeouts
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API request timed out')), 25000);
    });
    
    // Race the API call against the timeout
    const response = await Promise.race([
      client.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000, // Limit token count to ensure faster response
      }),
      timeoutPromise
    ]) as OpenAI.Chat.Completions.ChatCompletion;
    
    console.log('Feedback generation response received');
    
    const content = response.choices[0]?.message?.content || '';
    console.log('Raw feedback content:', content);
    
    // Parse the response to extract feedback and score
    // Using a more flexible regex pattern to capture multi-line feedback
    const feedbackMatch = content.match(/Feedback: "([\s\S]*?)"/);
    const scoreMatch = content.match(/Score: (\d+)/);
    
    const feedbackMessage = feedbackMatch ? feedbackMatch[1] : 'Great work on this campaign!';
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 75;
    
    return { feedbackMessage, score };
  } catch (error) {
    console.error('Error generating feedback:', error);
    
    // Generate client-specific fallback feedback instead of throwing an error
    const clientFeedback: Record<string, string> = {
      'LoveSummer': "As both your client and a marketing expert, I'm impressed with your work! The overall marketing strategy aligns perfectly with our fashion brand identity - elegant, empowering, and modern. Your copywriting has the warm, sophisticated tone our audience responds to, and the headline is memorable and impactful. The visual elements beautifully complement our brand colors and aesthetic, creating an Instagram-worthy post that will stand out in feeds. The call-to-action is clear and compelling, encouraging immediate engagement. Your caption strikes the perfect balance between being informative and conversational, with just the right amount of emojis to enhance engagement without appearing unprofessional. If I could suggest one improvement, perhaps adding a subtle seasonal reference would make it even more timely and relevant. Overall, this is excellent work that captures the essence of LoveSummer!",
      'GoodFood': "Yo, this campaign is straight FIRE! From a marketing standpoint, you've absolutely nailed our bold, in-your-face brand identity. The copywriting has that perfect casual, energetic vibe that speaks directly to our food-obsessed audience. Your headline is punchy and memorable - exactly what we need to cut through the noise on social. The visual description you've created is mouth-watering and scroll-stopping - those colors and food styling details will definitely make people crave our spicy ramen! The CTA is direct and creates urgency, which is exactly what we want. Your caption has the perfect amount of attitude and slang that resonates with our younger demographic. The emoji game is on point too! One small thing to consider: maybe add something about the unique spice level to really highlight what makes our ramen different. But honestly, this is exactly the kind of content that's going to make our product go viral. Mad respect for understanding the GoodFood vibe so perfectly!",
      'Gentleman Palace': "I've analyzed your marketing campaign with precision, and I'm pleased to report that it meets our quality standards. From a strategic perspective, you've successfully aligned with our minimalist barbershop brand identity through clean design elements and professional presentation. The copywriting demonstrates technical expertise and structured messaging that our clientele expects. Your headline is concise and informative, clearly communicating our Fresh Fade Friday promotion without unnecessary embellishment. The visual elements you've selected maintain our monochromatic palette and showcase the precision of our grooming services. The call-to-action is appropriately direct and provides clear next steps for booking. Your caption maintains the proper balance of professionalism while still being engaging. I particularly appreciate the absence of excessive emojis, as this aligns with our brand guidelines. One recommendation would be to include more specific technical terminology related to our signature cuts to further establish expertise. Overall, this campaign demonstrates the attention to detail and professional quality that Gentleman Palace represents."
    };
    
    // Create a default feedback if client-specific feedback isn't available
    const defaultFeedback = `As both your client and a marketing expert, I'm impressed with your ${params.clientType} campaign! \n\nYour marketing strategy effectively targets our audience with a compelling message. The copywriting is engaging and aligns well with our brand voice. Your headline "${params.headline}" is attention-grabbing and memorable. \n\nThe visual elements you've chosen complement our brand identity and will stand out on social media. The call-to-action "${params.cta}" is clear and encourages engagement. Your caption is well-crafted with the right tone and personality for our audience.\n\nOverall, this is excellent work that will help us achieve our marketing goals. The campaign elements work together cohesively to create a strong social media presence.`;
    
    // Calculate fallback score
    const timeBonus = params.elapsedTime < 600 ? 10 : 0;
    const completenessBonus = params.headline && params.usp && params.cta && params.captionText ? 10 : 0;
    // Use a fixed base score instead of random to avoid hydration errors
    const baseScore = 85; // Fixed middle-range score
    const score = Math.min(baseScore + timeBonus + completenessBonus, 100);
    
    return { 
      feedbackMessage: clientFeedback[params.clientName] || defaultFeedback,
      score 
    };
  }
};

/**
 * Generate a caption suggestion using OpenAI's GPT-4 Turbo
 * @param params Parameters for caption generation
 * @returns Generated caption suggestion
 */
export const generateCaption = async (params: {
  headline: string;
  usp: string;
  cta: string;
  clientType: string;
  clientName: string;
  clientPersonality: string;
}): Promise<string> => {
  const client = getOpenAI();
  
  if (!client) {
    throw new Error('OpenAI client not initialized. Please provide an API key.');
  }
  
  let personalityGuidance = '';
  
  if (params.clientPersonality === 'Appreciative') {
    personalityGuidance = 'The tone should be warm, elegant, and encouraging. Use sophisticated language that appeals to fashion-conscious customers.';
  } else if (params.clientPersonality === 'Outspoken') {
    personalityGuidance = 'The tone should be bold, direct, and playful. Use casual, energetic language with some slang that appeals to food enthusiasts.';
  } else if (params.clientPersonality === 'Technical') {
    personalityGuidance = 'The tone should be precise, structured, and professional. Use clean, clear language that appeals to customers who value quality grooming.';
  }
  
  const prompt = `You are a social media copywriter. Write a catchy, engaging Instagram caption for a brand campaign.

Inputs:
- Headline: ${params.headline}
- USP: ${params.usp}
- CTA: ${params.cta}
- Client Type: ${params.clientType}
- Client Name: ${params.clientName}
- Client Personality: ${params.clientPersonality}

${personalityGuidance}

Output a caption in 1–2 short paragraphs with 2–3 emojis that perfectly matches the client's personality and business type.`;

  try {
    console.log('Starting caption generation with prompt:', prompt);
    
    // Create a timeout promise to handle API timeouts
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API request timed out')), 25000);
    });
    
    // Race the API call against the timeout
    const response = await Promise.race([
      client.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500, // Limit token count to ensure faster response
      }),
      timeoutPromise
    ]) as OpenAI.Chat.Completions.ChatCompletion;
    
    console.log('Caption generation response received');
    
    const content = response.choices[0]?.message?.content || '';
    console.log('Generated caption:', content);
    
    return content;
  } catch (error) {
    console.error('Error generating caption:', error);
    // Return a fallback caption instead of throwing an error
    const clientTypeEmojis: Record<string, string[]> = {
      'Fashion': ['👗', '✨', '💃'],
      'F&B': ['🍜', '🔥', '😋'],
      'Barbershop': ['💈', '✂️', '👔']
    };
    
    const emojis = clientTypeEmojis[params.clientType] || ['🎯', '🚀', '💯'];
    
    if (params.clientPersonality === 'Appreciative') {
      return `${emojis[0]} Elevate your style with our ${params.headline}! ${emojis[1]}\n\n${params.usp} Don't miss out on looking and feeling your best. ${params.cta} ${emojis[2]}`;
    } else if (params.clientPersonality === 'Outspoken') {
      return `${emojis[0]} Introducing: ${params.headline} that will blow your taste buds away! ${emojis[1]}\n\n${params.usp} Ready for a flavor explosion? ${params.cta} ${emojis[2]}`;
    } else {
      return `${emojis[0]} ${params.headline} - for those who appreciate precision and style. ${emojis[1]}\n\n${params.usp} Looking sharp has never been easier. ${params.cta} ${emojis[2]}`;
    }
  }
};
