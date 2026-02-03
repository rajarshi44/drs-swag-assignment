"use client";

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { FiSend, FiCpu } from 'react-icons/fi';
import { motion } from 'framer-motion';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface AdminChatProps {
  fullHeight?: boolean;
}

export default function AdminChat({ fullHeight = false }: AdminChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello Admin! I can help you analyze stock, revenue, or verify coupons. Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const { data } = await api.post('/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the AI core.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col ${fullHeight ? 'h-full' : 'h-[500px]'}`}>
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center gap-2">
        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
           <FiCpu className="text-cyan-600 dark:text-cyan-400" />
        </div>
        <div>
           <h3 className="font-semibold text-zinc-900 dark:text-white">AI Copilot</h3>
           <p className="text-xs text-zinc-500 dark:text-zinc-400">Powered by Gemini</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user' 
                ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-none' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></span>
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></span>
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about revenue, stock, or coupons..."
            className="flex-1 rounded-xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-cyan-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-cyan-600 text-white p-2 rounded-xl hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
