import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- CONFIGURATION ---
const HUGGING_FACE_TOKEN = "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"; // PASTE YOUR FULL TOKEN HERE
const MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1";

// Simple in-memory limit for the demo (resets if the function sleeps)
let globalPromptCounter = 0;
const PROMPT_LIMIT = 10;

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1].content.toLowerCase();

    // 1. 🛡️ THE 10-PROMPT LIMIT CHECK
    if (globalPromptCounter >= PROMPT_LIMIT) {
      return new Response(JSON.stringify({ 
        error: "Daily Limit Reached: Renexa's free tier allows 10 technical brainstorms per session. Upgrade to Pro for unlimited access." 
      }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2. 🛡️ THE TOPIC LIMIT (Strict Filter)
    const allowedKeywords = ["invent", "design", "build", "create", "tech", "prototype", "engine", "solar", "machine", "software", "product", "material"];
    const isInventionRelated = allowedKeywords.some(word => userMessage.includes(word));

    if (!isInventionRelated) {
      return new Response(JSON.stringify({ 
        error: "Topic Restriction: I am hard-coded to only discuss inventions and engineering. Please ask about a project idea!" 
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 3. 🧠 COMPLEX SYSTEM PROMPT
    const systemInstruction = `You are the Renexa Technical Engine. Format your response exactly like this:
    ## 💡 Invention Name: [Catchy Name]
    ## 🎯 Problem: [Who does this help and why?]
    ## 🔧 Engineering Specs: [Detailed technical explanation of how it works]
    ## 📊 Market Fit: [Who would buy this in Ethiopia or globally?]
    ## 🚀 Next Steps: [Step 1, 2, 3 to build it]`;

    // 4. 📡 CALL HUGGING FACE
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUGGING_FACE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `<s>[INST] ${systemInstruction} \n\n User Idea: ${userMessage} [/INST]`,
        parameters: { max_new_tokens: 1200, temperature: 0.7 }
      }),
    });

    if (!response.ok) throw new Error("AI Brain offline");

    const result = await response.json();
    const fullText = result[0].generated_text;
    const aiResponse = fullText.split("[/INST]")[1]?.trim() || "Technical analysis complete.";

    globalPromptCounter++; // Increase usage count

    return new Response(JSON.stringify({ 
      choices: [{ message: { content: aiResponse } }],
      usage: { remaining: PROMPT_LIMIT - globalPromptCounter }
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
