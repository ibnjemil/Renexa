import React, { useState } from 'react';
import { User, Edit2, Save, X, LogOut } from 'lucide-react';

export const UserProfile = ({ user, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');

  if (!user) return <div className="text-center py-20"><User size={64} className="mx-auto text-gray-600 mb-4" /><h2 className="text-2xl font-bold text-white mb-3">Not Logged In</h2></div>;

  const handleSave = () => {
    if (editedName.trim()) {
      const updatedUser = { ...user, name: editedName, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(editedName)}` };
      localStorage.setItem('renexa_user', JSON.stringify(updatedUser));
      localStorage.setItem('renexa_author', editedName);
      window.location.reload();
    }
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-2xl p-8 text-center">
        <img src={user.avatar} className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-cyan-500" />
        {isEditing ? (
          <div className="flex justify-center gap-2"><input value={editedName} onChange={e => setEditedName(e.target.value)} className="px-4 py-2 bg-gray-800 rounded-lg text-white" /><button onClick={handleSave} className="p-2 bg-green-600 rounded"><Save size={18} /></button><button onClick={() => setIsEditing(false)} className="p-2 bg-red-600 rounded"><X size={18} /></button></div>
        ) : (
          <div className="flex justify-center items-center gap-2"><h1 className="text-2xl font-bold text-white">{user.name}</h1><button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-cyan-400"><Edit2 size={16} /></button></div>
        )}
        <p className="text-gray-400 mt-2">Innovator</p>
      </div>
      <div className="mt-6 bg-gray-800/30 rounded-xl p-6"><h3 className="font-bold text-white mb-4">Profile Info</h3><div className="space-y-3"><div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-white">{user.email}</span></div><div className="flex justify-between"><span className="text-gray-400">Member Since</span><span className="text-white">{new Date(user.joined).toLocaleDateString()}</span></div></div></div>
      <div className="mt-8"><button onClick={onLogout} className="w-full py-3 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">Logout</button></div>
    </div>
  );
};
