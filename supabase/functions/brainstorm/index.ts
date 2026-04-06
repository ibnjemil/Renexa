import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple counter for the 10-prompt demo
let counter = 0;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const prompt = messages[messages.length - 1].content;

    // 🛡️ 10-Prompt Limit
    if (counter >= 10) return new Response(JSON.stringify({ error: "Limit reached (10/10)" }), { status: 403, headers: corsHeaders });

    // 🛡️ Topic Filter: Must include invention keywords
    if (!/invent|build|design|tech|engine|solar|prototype/i.test(prompt)) {
      return new Response(JSON.stringify({ error: "I only discuss technical inventions." }), { status: 400, headers: corsHeaders });
    }

    // 🧠 The AI Call
    const res = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
      method: "POST",
      headers: { Authorization: "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", "Content-Type": "application/json" }, // Use your FULL token from image_a9bfc6.jpg
      body: JSON.stringify({ inputs: `<s>[INST] Expert Inventor Mode. Analyze: ${prompt}. Provide: 💡Name, 🎯Problem, 🔧Tech Specs, 🚀Roadmap. [/INST]` }),
    });

    const data = await res.json();
    counter++;

    return new Response(JSON.stringify({ choices: [{ message: { content: data[0].generated_text.split("[/INST]")[1].trim() } }] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "AI offline" }), { status: 500, headers: corsHeaders });
  }
});
