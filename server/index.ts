import express from "express";
import cors from "cors";
import { createViteServer } from "./viteDevServer.js";

const isDev = process.env.NODE_ENV !== "production";

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = "https://ymwhedotzhgrgpybfjmt.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const SYSTEM_PROMPT = `You are the Renexa AI Brainstorm Assistant — a world-class invention development partner. Help inventors develop their ideas into full invention concepts with deep technical analysis.

For each idea, provide a comprehensive breakdown:

## 💡 Invention Name
A catchy, memorable name

## 🎯 Problem Statement
What real-world problem this solves, who suffers from it, and how big the problem is

## 🔧 Technical Approach
Specific engineering methods, technologies, materials, and how they work together. Be detailed and practical.

## 📊 Market Opportunity
Target market size, demographics, competitive landscape, and potential revenue

## 🚀 Implementation Roadmap
Step-by-step plan from concept to prototype to market, with estimated timelines

## 💰 Revenue Model
How to monetize — pricing strategies, business models, licensing opportunities

## ⚡ Key Risks & Mitigations
Potential challenges and how to overcome them

Be enthusiastic, specific, technically accurate, and actionable. Use clear markdown formatting with headers, bullet points, and emphasis where appropriate.`;

// ─── AI Brainstorm ──────────────────────────────────────────────────────────
app.post("/api/brainstorm", async (req, res) => {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: "AI API key is not configured on the server." });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.REPLIT_DEV_DOMAIN
          ? `https://${process.env.REPLIT_DEV_DOMAIN}`
          : "https://renexa.app",
        "X-Title": "Renexa AI Brainstorm",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenRouter error:", response.status, text);
      if (response.status === 429) return res.status(429).json({ error: "Rate limited. Please try again in a moment." });
      if (response.status === 402) return res.status(402).json({ error: "AI credits exhausted." });
      return res.status(500).json({ error: "AI gateway error" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (!response.body) return res.status(500).json({ error: "No response body" });

    const reader = response.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { res.end(); break; }
        res.write(value);
      }
    };
    pump().catch((err) => { console.error("Stream error:", err); res.end(); });
  } catch (err) {
    console.error("Brainstorm error:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// ─── Public inventions (bypasses RLS using service role) ──────────────────
app.get("/api/inventions", async (_req, res) => {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Service role key not configured" });
  }
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/inventions?select=*&verified=eq.true&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Inventions fetch error:", err);
    res.status(500).json({ error: "Failed to fetch inventions" });
  }
});

// ─── Public single invention ──────────────────────────────────────────────
app.get("/api/inventions/:id", async (req, res) => {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Service role key not configured" });
  }
  try {
    const { id } = req.params;
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/inventions?id=eq.${id}&select=*`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(data[0]);
  } catch (err) {
    console.error("Invention fetch error:", err);
    res.status(500).json({ error: "Failed to fetch invention" });
  }
});

const PORT = parseInt(process.env.PORT || "5000", 10);

if (isDev) {
  const vite = await createViteServer();
  app.use(vite.middlewares);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dev server running on port ${PORT}`);
  });
} else {
  const { default: path } = await import("path");
  const { fileURLToPath } = await import("url");
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.join(__dirname, "../dist");
  const { default: serveStatic } = await import("serve-static");
  app.use(serveStatic(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
