import React from 'react';
import { Sparkles, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-gray-800 bg-gray-900/30 mt-10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4"><Sparkles className="text-cyan-400" size={20} /><span className="font-bold text-white">Renexa</span></div>
            <p className="text-gray-500 text-sm">Empowering Ethiopian inventors to turn ideas into reality.</p>
          </div>
          <div><h4 className="font-semibold text-white mb-3">Platform</h4><ul className="space-y-2 text-sm text-gray-500"><li><a href="#" className="hover:text-cyan-400">Spark Arena</a></li><li><a href="#" className="hover:text-cyan-400">Inventors Club</a></li><li><a href="#" className="hover:text-cyan-400">AI Assistant</a></li></ul></div>
          <div><h4 className="font-semibold text-white mb-3">Resources</h4><ul className="space-y-2 text-sm text-gray-500"><li><a href="#" className="hover:text-cyan-400">Help Center</a></li><li><a href="#" className="hover:text-cyan-400">Community Guidelines</a></li><li><a href="#" className="hover:text-cyan-400">Success Stories</a></li></ul></div>
          <div><h4 className="font-semibold text-white mb-3">Connect</h4><div className="flex gap-3"><a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-cyan-600 transition"><Github size={16} /></a><a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-cyan-600 transition"><Twitter size={16} /></a><a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-cyan-600 transition"><Linkedin size={16} /></a><a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-cyan-600 transition"><Mail size={16} /></a></div></div>
        </div>
        <div className="text-center pt-8 mt-8 border-t border-gray-800 text-gray-500 text-sm">© 2025 Renexa. Empowering Ethiopian Innovation.</div>
      </div>
    </footer>
  );
};
