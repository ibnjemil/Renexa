const HUGGING_FACE_TOKEN = "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"; // Paste your FULL token from your screenshot

export const generateAIResponse = async (userPrompt) => {
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
          inputs: `<s>[INST] You are Renexa AI, helping an inventor. ${userPrompt} [/INST]`,
        }),
      }
    );

    const result = await response.json();
    // This cleans up the text so you only see the AI's answer
    return result[0].generated_text.split("[/INST]")[1].trim();
  } catch (error) {
    return "The AI is resting. Check your internet connection!";
  }
};
