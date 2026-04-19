import React, { useState } from 'react';
import { generateAIResponse } from '../services/aiService';
import { Send, Bot, Trash2 } from 'lucide-react';

export const ChatBot = () => {
  const [messages, setMessages] = useState([{ role: 'bot', content: '✨ Hi! Ask me about inventions!' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    const reply = await generateAIResponse(userMsg);
    setMessages(prev => [...prev, { role: 'bot', content: reply }]);
    setLoading(false);
  };

  const clearChat = () => setMessages([{ role: 'bot', content: 'Chat cleared! Ask me about inventions.' }]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
          <div className="flex items-center gap-2"><Bot className="text-cyan-400" size={24} /><h2 className="font-bold text-white">Renexa AI</h2></div>
          <button onClick={clearChat} className="text-gray-400 hover:text-red-400"><Trash2 size={18} /></button>
        </div>
        <div className="h-[500px] overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-200'}`}>{msg.content}</div>
            </div>
          ))}
          {loading && <div className="flex justify-start"><div className="bg-gray-800 p-3 rounded-lg">Typing...</div></div>}
        </div>
        <div className="p-4 border-t border-gray-700 flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} className="flex-1 p-3 bg-gray-800 rounded-lg text-white" placeholder="Ask about your invention..." />
          <button onClick={sendMessage} disabled={loading || !input.trim()} className="p-3 bg-cyan-600 rounded-lg"><Send size={20} /></button>
        </div>
      </div>
    </div>
  );
};
