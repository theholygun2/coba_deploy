# Troubleshooting Guide for OpenAI Image Generation API

This guide provides solutions for common issues when working with OpenAI's image generation APIs, specifically focusing on the `gpt-image-1` model.

## Common Error: "Unknown parameter: 'response_format'"

### Problem
When making requests to OpenAI's image generation API, you might encounter this error if you're using parameters that aren't supported by the specific model you're using.

### Diagnosis
1. Check the API response for specific error messages
2. Look for parameters that might be causing conflicts
3. Verify you're using the correct endpoint and model

### Solution
1. **Remove unsupported parameters**: Different models support different parameters. For `gpt-image-1`, remove `response_format` if you're getting this error.

2. **Use flexible response handling**: Write your code to handle both possible response formats:

```javascript
// Server-side code (Node.js)
try {
  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt: "Your prompt here",
    n: 1,
    size: "1024x1024",
    quality: "high"
    // No response_format parameter
  });

  // Flexible response handling
  let imageData;
  let isBase64 = false;
  
  if (response.data[0].b64_json) {
    imageData = response.data[0].b64_json;
    isBase64 = true;
  } else if (response.data[0].url) {
    imageData = response.data[0].url;
  } else {
    throw new Error('No image data received from API');
  }
  
  // Return appropriate data to frontend
  res.json({
    success: true,
    image: imageData,
    isBase64: isBase64
  });
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: error.message
  });
}
```

3. **Frontend handling**: Make your frontend flexible enough to handle either response type:

```javascript
// Client-side code
if (data.success && data.image) {
  const logoImage = document.getElementById('logo-image');
  
  if (data.isBase64) {
    // If it's base64 data, create a data URL
    logoImage.src = `data:image/png;base64,${data.image}`;
  } else {
    // If it's a URL, use it directly
    logoImage.src = data.image;
  }
}
```

## Error: "No image data received"

### Problem
This error occurs when your code expects image data in a specific format, but the API response doesn't contain it in that format.

### Solution
1. **Debug the API response**: Log the full response to see what data structure is actually being returned
2. **Check API documentation**: Verify which parameters are supported for your specific model
3. **Use conditional logic**: As shown above, check for multiple possible response formats

## General Troubleshooting Steps

1. **Read the documentation carefully**: OpenAI frequently updates their APIs, so make sure you're using the latest documentation
   - [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
   - [Image Generation Guide](https://platform.openai.com/docs/guides/image-generation)

2. **Check your API key**: Ensure your API key is valid and has the necessary permissions

3. **Verify endpoint URLs**: Make sure you're using the correct endpoint:
   - For image generation: `https://api.openai.com/v1/images/generations`

4. **Inspect error responses**: OpenAI usually provides detailed error messages that can help diagnose the issue

5. **Test with minimal parameters**: Start with the minimal required parameters and add more as needed

6. **Use try/catch blocks**: Always wrap API calls in try/catch blocks to handle errors gracefully

## Model-Specific Notes

### gpt-image-1
- Latest and most advanced model for image generation
- Supports parameters: `model`, `prompt`, `n`, `size`, `quality`, `background`
- May return either base64 data or URLs depending on the circumstances
- Cannot be used with the chat completions endpoint

### dall-e-3
- High-quality image generation
- Supports larger resolutions
- Available only through the generations endpoint

### dall-e-2
- Lower cost, supports concurrent requests
- Supports variations and edits endpoints

## Best Practices

1. **Implement robust error handling**: Always check for errors and provide meaningful feedback to users

2. **Use flexible response handling**: Write code that can handle different response formats

3. **Log detailed error information**: For debugging purposes, log the full error object

4. **Implement retries for transient errors**: Network issues can cause temporary failures

5. **Keep dependencies updated**: Make sure you're using the latest version of the OpenAI SDK

```javascript
// Example of robust error handling
try {
  // API call here
} catch (error) {
  if (error.response) {
    console.error(`API Error: ${error.response.status} - ${error.response.data.error.message}`);
  } else if (error.request) {
    console.error('Network Error: No response received');
  } else {
    console.error(`Error: ${error.message}`);
  }
  // Handle the error appropriately
}
```

By following these guidelines, you can avoid common pitfalls and build more robust applications that use OpenAI's image generation capabilities.
cd "c:\Users\Lenovo\Documents\03_Projects\0. AI\Project2\10-minutes-marketer-v2"
npm run dev
d