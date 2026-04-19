import React from 'react';
import { Sparkles, Home, Zap, Users, MessageCircle, LayoutDashboard, User, Shield } from 'lucide-react';

export const Navbar = ({ currentPage, setCurrentPage, user, onLogout, isAdmin }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'spark', label: 'Spark Arena', icon: Zap },
    { id: 'club', label: 'Club', icon: Users },
    { id: 'chat', label: 'AI Chat', icon: MessageCircle },
  ];

  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
          <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Sparkles className="text-white" size={18} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Renexa</h1>
        </div>
        <div className="hidden md:flex gap-1 bg-gray-800/30 rounded-lg p-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setCurrentPage(item.id)} className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${currentPage === item.id ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
          {user && (
            <button onClick={() => setCurrentPage('dashboard')} className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${currentPage === 'dashboard' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              <LayoutDashboard size={16} /> Dashboard
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button onClick={() => setCurrentPage('admin')} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition">
              <Shield size={16} /> Admin
            </button>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentPage('profile')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
                <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full" />
                <span className="text-sm text-white hidden sm:inline">{user.name.split(' ')[0]}</span>
              </button>
              <button onClick={onLogout} className="text-sm text-gray-400 hover:text-red-400 transition hidden sm:block">Logout</button>
            </div>
          ) : (
            <button onClick={() => setCurrentPage('spark')} className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-sm font-medium hover:from-cyan-500 hover:to-blue-500 transition shadow-lg">Join Free</button>
          )}
        </div>
      </div>
      <div className="flex md:hidden justify-around mt-3 pt-3 border-t border-gray-800">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => setCurrentPage(item.id)} className={`flex flex-col items-center gap-1 text-xs ${currentPage === item.id ? 'text-cyan-400' : 'text-gray-500'}`}>
              <Icon size={18} /><span>{item.label === 'Spark Arena' ? 'Spark' : item.label}</span>
            </button>
          );
        })}
        {user && (
          <button onClick={() => setCurrentPage('dashboard')} className="flex flex-col items-center gap-1 text-xs text-gray-500">
            <LayoutDashboard size={18} /><span>Dash</span>
          </button>
        )}
      </div>
    </nav>
  );
};
