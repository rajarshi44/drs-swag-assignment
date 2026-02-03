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

  // Helper to format text with **bold** and newlines
  const formatMessage = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i} className="block min-h-[1.2em]">
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-bold text-cyan-700 dark:text-cyan-300">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </span>
    ));
  };

  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col ${fullHeight ? 'h-full' : 'h-[500px]'}`}>
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
           <FiCpu className="text-white w-5 h-5" />
        </div>
        <div>
           <h3 className="font-semibold text-zinc-900 dark:text-white">AI Copilot</h3>
           <p className="text-xs text-zinc-500 dark:text-zinc-400">Powered by Gemini</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-black/20">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black rounded-tr-none' 
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-tl-none border border-zinc-100 dark:border-zinc-700/50'
            }`}>
              {formatMessage(msg.content)}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-zinc-800 rounded-2xl rounded-tl-none px-5 py-4 border border-zinc-100 dark:border-zinc-700/50 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></span>
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></span>
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2 relative"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about revenue, stock, or coupons..."
            className="flex-1 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-5 py-3 pr-12 text-sm outline-none focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-zinc-400"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1.5 bg-cyan-600 text-white p-1.5 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-cyan-500/20"
          >
            <FiSend className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
