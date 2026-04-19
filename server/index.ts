import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;
const adminTokens = new Map<string, string>();
const promptLimits = new Map<string, { count: number; date: string }>();

// Admin auth
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "12345678") {
    const token = Math.random().toString(36).substring(2);
    adminTokens.set(token, username);
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false });
  }
});

app.get("/api/admin/check", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  res.json({ isAdmin: !!token && adminTokens.has(token) });
});

// Posts CRUD
app.get("/api/posts", async (req, res) => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.post("/api/posts", async (req, res) => {
  const { title, content, author_name, author_avatar, user_id } = req.body;
  if (!content || !author_name) {
    return res.status(400).json({ error: "Missing content or author" });
  }
  const { data, error } = await supabase
    .from("posts")
    .insert([{ title, content, author_name, author_avatar, user_id }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.put("/api/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const { data, error } = await supabase
    .from("posts")
    .update({ title, content, updated_at: new Date() })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete("/api/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.post("/api/posts/:id/like", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  if (user_id) {
    await supabase.from("likes").insert([{ post_id: id, user_id }]);
  }
  const { data, error } = await supabase
    .from("posts")
    .update({ likes_count: supabase.raw("likes_count + 1") })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/posts/:id/comments", async (req, res) => {
  const { id } = req.params;
  const { content, author_name, author_avatar, user_id } = req.body;
  if (!content || !author_name) {
    return res.status(400).json({ error: "Missing content or author" });
  }
  const { data: comment, error: commentErr } = await supabase
    .from("comments")
    .insert([{ post_id: id, content, author_name, author_avatar, user_id }])
    .select()
    .single();
  if (commentErr) return res.status(500).json({ error: commentErr.message });
  await supabase
    .from("posts")
    .update({ comments_count: supabase.raw("comments_count + 1") })
    .eq("id", id);
  res.json({ comment });
});

// AI Brainstorm
app.post("/api/brainstorm", async (req, res) => {
  const { prompt, sessionId } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  const today = new Date().toDateString();
  let limit = promptLimits.get(sessionId);
  if (!limit || limit.date !== today) limit = { count: 0, date: today };
  if (limit.count >= 10) {
    return res.json({ response: "✨ You've used your 10 free prompts today. Come back tomorrow!", remaining: 0 });
  }

  const inventionKeywords = ["invent", "build", "create", "design", "make", "idea", "engine", "solar", "tech", "robot", "device", "prototype"];
  const isRelevant = inventionKeywords.some(kw => prompt.toLowerCase().includes(kw));
  if (!isRelevant) {
    return res.json({ response: "💡 I specialise in inventions! Ask me about building, designing, or prototyping.", remaining: 10 - limit.count });
  }

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are Renexa AI, an invention assistant for Ethiopian students. Give practical, encouraging advice under 250 words." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });
    const data = await response.json();
    const aiText = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    limit.count++;
    promptLimits.set(sessionId, limit);
    await supabase.from("ai_chat_history").insert([{ session_id: sessionId, user_prompt: prompt, ai_response: aiText, remaining_prompts: 10 - limit.count }]);
    res.json({ response: aiText, remaining: 10 - limit.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI service temporarily unavailable" });
  }
});

// Stats & Users
app.get("/api/stats", async (req, res) => {
  const { data, error } = await supabase.from("posts").select("likes_count, comments_count");
  if (error) return res.status(500).json({ error: error.message });
  const totalPosts = data.length;
  const totalLikes = data.reduce((s, p) => s + (p.likes_count || 0), 0);
  const totalComments = data.reduce((s, p) => s + (p.comments_count || 0), 0);
  const uniqueAuthors = new Set(data.map(p => p.author_name)).size;
  res.json({ totalPosts, totalLikes, totalComments, uniqueAuthors });
});

app.get("/api/users", async (req, res) => {
  const { data, error } = await supabase.from("posts").select("author_name, author_avatar");
  if (error) return res.status(500).json({ error: error.message });
  const userMap = new Map();
  data.forEach(p => {
    if (!userMap.has(p.author_name)) {
      userMap.set(p.author_name, { name: p.author_name, avatar: p.author_avatar, postCount: 0 });
    }
    userMap.get(p.author_name).postCount++;
  });
  res.json(Array.from(userMap.values()));
});

// Export the app for Vercel (no app.listen)
export default app;
