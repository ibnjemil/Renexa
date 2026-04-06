import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Global counter for the 10-prompt limit (Reset on redeploy)
let sessionUsage = 0;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const userInput = messages[messages.length - 1].content;

    // 1. THE LIMIT (10 Prompts)
    if (sessionUsage >= 10) {
      return new Response(JSON.stringify({ error: "Daily limit of 10 prompts reached." }), { status: 403, headers: corsHeaders });
    }

    // 2. THE TOPIC FILTER (Small & Strict)
    const isTech = /invent|build|design|engine|solar|tech|prototype|create|machine/i.test(userInput);
    if (!isTech) {
      return new Response(JSON.stringify({ error: "I only discuss inventions. Please ask about a technical project." }), { status: 400, headers: corsHeaders });
    }

    // 3. THE AI CALL (Using your Hugging Face Token)
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
      method: "POST",
      headers: { 
        Authorization: "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", // PASTE YOUR FULL TOKEN HERE
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        inputs: `<s>[INST] Act as Renexa Expert. Analyze this invention: ${userInput}. 
        Provide: 💡Name, 🎯Problem, 🔧Tech Specs (detailed), 🚀Roadmap. [/INST]`,
      }),
    });

    const result = await response.json();
    sessionUsage++; // Update count

    return new Response(JSON.stringify({ 
      choices: [{ message: { content: result[0].generated_text.split("[/INST]")[1].trim() } }] 
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    return new Response(JSON.stringify({ error: "System error" }), { status: 500, headers: corsHeaders });
  }
});
