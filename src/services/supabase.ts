import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '@/config/supabase.config';

// Supabase configuration from config file
const supabaseUrl = SUPABASE_CONFIG.url;
const supabaseAnonKey = SUPABASE_CONFIG.anonKey;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload an image to Supabase Storage
 * @param imageUrl URL of the image to upload
 * @param fileName Name to give the file in Supabase
 * @returns Public URL of the uploaded image
 */
export const uploadImageToSupabase = async (imageUrl: string, fileName: string): Promise<string> => {
  try {
    console.log('Downloading image from URL:', imageUrl);
    
    // Fetch the image as a blob
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const imageBlob = await response.blob();
    console.log('Image downloaded as blob, size:', imageBlob.size);
    
    // Upload the blob to Supabase Storage
    const { data, error } = await supabase.storage
      .from(SUPABASE_CONFIG.storage.bucketName)
      .upload(`generated/${fileName}`, imageBlob, {
        contentType: 'image/jpeg', // Adjust based on actual image type
        upsert: true
      });
    
    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }
    
    console.log('Image uploaded to Supabase:', data);
    
    // Get the public URL of the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from(SUPABASE_CONFIG.storage.bucketName)
      .getPublicUrl(`generated/${fileName}`);
    
    console.log('Public URL generated:', publicUrlData.publicUrl);
    
    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error('Error uploading image to Supabase:', error);
    throw error;
  }
};

export const getSupabaseClient = () => {
  return supabase;
};
