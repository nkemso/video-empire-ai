import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use Gemini 1.5 Flash (FREE tier - 15 RPM, 1500 RPD)
export const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.8,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
});

export async function generateContent(prompt: string): Promise<{
  content: string;
  tokensUsed: number;
  generationTimeMs: number;
}> {
  const startTime = Date.now();
  
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const content = response.text();
    
    const generationTimeMs = Date.now() - startTime;
    const tokensUsed = response.usageMetadata?.totalTokenCount || 0;
    
    return {
      content,
      tokensUsed,
      generationTimeMs
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}
