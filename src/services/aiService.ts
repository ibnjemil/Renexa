import { brainstorm } from './api';

export const generateAIResponse = async (prompt: string): Promise<string> => {
  try {
    const result = await brainstorm(prompt);
    return result.response || "I'm here to help with your invention!";
  } catch (error) {
    console.error('AI error:', error);
    return "🔧 The invention lab is busy. Please try again later.";
  }
};
