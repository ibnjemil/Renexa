const API_BASE = '/api';

export interface Post {
  id: string;
  title?: string;
  content: string;
  author_name: string;
  author_avatar?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const getPosts = () => fetchJSON(`${API_BASE}/posts`) as Promise<Post[]>;

export const createPost = (data: { title?: string; content: string; author_name: string; author_avatar?: string; user_id?: string }) =>
  fetchJSON(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }) as Promise<Post>;

export const likePost = (id: string) =>
  fetchJSON(`${API_BASE}/posts/${id}/like`, { method: 'POST' }) as Promise<Post>;

export const addComment = (postId: string, content: string, author_name: string, author_avatar?: string) =>
  fetchJSON(`${API_BASE}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, author_name, author_avatar }),
  });

export const getStats = () => fetchJSON(`${API_BASE}/stats`);

let sessionId = localStorage.getItem('renexa_session');
if (!sessionId) {
  sessionId = crypto.randomUUID();
  localStorage.setItem('renexa_session', sessionId);
}
export const brainstorm = (prompt: string) =>
  fetchJSON(`${API_BASE}/brainstorm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, sessionId }),
  }) as Promise<{ response: string; remaining?: number }>;

export const adminLogin = (username: string, password: string) =>
  fetchJSON(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }) as Promise<{ success: boolean; token?: string }>;
