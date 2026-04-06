const HUGGING_FACE_TOKEN = "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"; // Your token from the screenshot
const MAX_PROMPTS = 10;

// This tracks how many times the user has asked a question
let promptCount = 0;

export const generateAIResponse = async (userPrompt: string) => {
  // 1. Check the 10-prompt limit
  if (promptCount >= MAX_PROMPTS) {
    return "Limit Reached: You have used your 10 free invention prompts for today.";
  }

  // 2. Check for "Invention" topics only (Topic Limit)
  const inventionKeywords = ["invent", "build", "create", "design", "how to", "idea", "engine", "solar", "tech"];
  const isRelevant = inventionKeywords.some(word => userPrompt.toLowerCase().includes(word));

  if (!isRelevant) {
    return "I am specialized in inventions only. Please ask me about building or designing something!";
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: { 
          Authorization: `Bearer ${HUGGING_FACE_TOKEN}`,
          "Content-Type": "application/json" 
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: `<s>[INST] You are Renexa AI, a specialized invention assistant for Ethiopian students. Help with this invention idea: ${userPrompt} [/INST]`,
        }),
      }
    );

    const result = await response.json();
    promptCount++; // Increase the count after a successful answer
    
    // Clean up the response
    const aiText = result[0].generated_text.split("[/INST]")[1].trim();
    return `${aiText}\n\n(Remaining prompts: ${MAX_PROMPTS - promptCount})`;

  } catch (error) {
    return "The AI is currently offline. Please check your internet connection.";
  }
};
