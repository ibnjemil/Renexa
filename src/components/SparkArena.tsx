import React, { useState, useEffect } from 'react';
import { getPosts, createPost, likePost, addComment } from '../services/api';
import { Flame, Plus } from 'lucide-react';

export const SparkArena = ({ user, onLogin }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    setLoading(true);
    const data = await getPosts();
    setPosts(data);
    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    let author_name = user?.name;
    if (!author_name) {
      author_name = prompt('Enter your name:');
      if (author_name) onLogin(author_name);
      else return;
    }
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${author_name}`;
    const post = await createPost({ content: newPost, author_name, author_avatar: avatar });
    if (post) {
      setPosts([post, ...posts]);
      setNewPost('');
    }
  };

  const handleLike = async (id) => {
    const updated = await likePost(id);
    if (updated) setPosts(posts.map(p => p.id === id ? updated : p));
  };

  if (loading) return <div className="text-center py-20">Loading sparks...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-orange-500/20 px-4 py-2 rounded-full mb-4"><Flame className="text-orange-400" size={18} /><span className="text-orange-400 text-sm">Spark Arena</span></div>
        <h1 className="text-3xl font-bold text-white mb-3">Where Ideas Ignite</h1>
      </div>
      <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
        <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="What's your invention idea?" className="w-full p-3 bg-gray-900 rounded-lg text-white" rows={3} />
        <button onClick={handleCreatePost} className="mt-3 px-5 py-2 bg-cyan-600 rounded-lg flex items-center gap-2"><Plus size={18} /> Spark an Idea</button>
      </div>
      <div className="space-y-5">
        {posts.map(post => (
          <div key={post.id} className="bg-gray-800/40 rounded-xl p-5 border border-gray-700">
            <div className="flex gap-3">
              <img src={post.author_avatar} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <div className="flex justify-between"><h3 className="font-semibold text-white">{post.author_name}</h3><span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span></div>
                <p className="text-gray-300 my-2">{post.content}</p>
                <button onClick={() => handleLike(post.id)} className="text-gray-400 hover:text-red-500">❤️ {post.likes_count}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
