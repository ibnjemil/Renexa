import React, { useState, useEffect } from 'react';
import { getPosts, getStats } from '../services/api';
import { Shield, FileText, Users, Heart, MessageCircle } from 'lucide-react';

export const AdminDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalLikes: 0, totalComments: 0, uniqueAuthors: 0 });

  useEffect(() => {
    getPosts().then(setPosts);
    getStats().then(setStats);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8"><Shield className="text-purple-400" size={28} /><h1 className="text-3xl font-bold text-white">Admin Dashboard</h1></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-xl p-5"><FileText className="text-cyan-400 mb-2" /><div className="text-2xl font-bold text-white">{stats.totalPosts}</div><div className="text-sm text-gray-400">Total Posts</div></div>
        <div className="bg-gradient-to-br from-red-600/20 to-pink-600/20 rounded-xl p-5"><Heart className="text-red-400 mb-2" /><div className="text-2xl font-bold text-white">{stats.totalLikes}</div><div className="text-sm text-gray-400">Likes</div></div>
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-5"><MessageCircle className="text-green-400 mb-2" /><div className="text-2xl font-bold text-white">{stats.totalComments}</div><div className="text-sm text-gray-400">Comments</div></div>
        <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-xl p-5"><Users className="text-purple-400 mb-2" /><div className="text-2xl font-bold text-white">{stats.uniqueAuthors}</div><div className="text-sm text-gray-400">Users</div></div>
      </div>
      <div className="bg-gray-800/30 rounded-xl overflow-hidden"><div className="p-5 border-b border-gray-700"><h3 className="font-bold text-white">All Posts</h3></div><div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-800/50"><tr><th className="px-5 py-3 text-left text-sm text-gray-400">Author</th><th className="px-5 py-3 text-left text-sm text-gray-400">Content</th><th className="px-5 py-3 text-left text-sm text-gray-400">Likes</th><th className="px-5 py-3 text-left text-sm text-gray-400">Comments</th></tr></thead><tbody>{posts.map(p => <tr key={p.id} className="border-t border-gray-700"><td className="px-5 py-3">{p.author_name}</td><td className="px-5 py-3 text-gray-300">{p.content.substring(0,50)}...</td><td className="px-5 py-3">{p.likes_count}</td><td className="px-5 py-3">{p.comments_count}</td></tr>)}</tbody></table></div></div>
    </div>
  );
};
