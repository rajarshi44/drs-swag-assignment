"use client";

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { FiSend, FiMessageSquare, FiX, FiCpu, FiShoppingBag, FiTag, FiCopy, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

type ProductSuggestion = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type CouponSuggestion = {
  code: string;
  discount: string;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  products?: ProductSuggestion[];
  coupon?: CouponSuggestion;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! 👋 I\'m your DevRelSquad assistant. Looking for some cool swag or need a discount code?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const { data } = await api.post('/ai/public-chat', { message: userMsg });
      // Expecting structure: { answer: string, products?: [], coupon?: {} }
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer,
        products: data.products,
        coupon: data.coupon
      }]);
    } catch (error) {
      console.error('Chatbot Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! My circuits differ. Please try again later. 🤖' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-[380px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[600px] h-[500px]"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-cyan-600 to-teal-600 flex justify-between items-center text-white shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <FiCpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">DevRelSquad Bot</h3>
                    <p className="text-[10px] text-cyan-100 opacity-90">Always here to help!</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-zinc-50 dark:bg-zinc-950">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {/* Text Bubble */}
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm whitespace-pre-wrap ${
                        msg.role === 'user' 
                        ? 'bg-cyan-600 text-white rounded-br-none' 
                        : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none border border-zinc-100 dark:border-zinc-700'
                    }`}>
                      {msg.content}
                    </div>

                    {/* Products Carousel */}
                    {msg.role === 'assistant' && msg.products && msg.products.length > 0 && (
                      <div className="w-full flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide snap-x">
                        {msg.products.map((product) => (
                          <div key={product.id} className="snap-center min-w-[200px] w-[200px] bg-white dark:bg-zinc-800 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm flex-shrink-0">
                            <div className="relative h-24 w-full bg-zinc-100 dark:bg-zinc-900">
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className='w-full h-full object-cover'
                                />
                            </div>
                            <div className="p-3">
                              <h4 className="font-medium text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1">{product.name}</h4>
                              <p className="text-cyan-600 dark:text-cyan-400 font-bold text-sm mt-1">${product.price.toFixed(2)}</p>
                              <Link 
                                href={`/shop/${product.id}`}
                                className="mt-2 block w-full text-center py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Coupon Card */}
                    {msg.role === 'assistant' && msg.coupon && (
                      <div className="max-w-[85%] bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-0.5 shadow-md">
                        <div className="bg-white dark:bg-zinc-900 rounded-[10px] p-3 flex flex-col gap-2">
                           <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                              <FiTag className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Exclusive Deal</span>
                           </div>
                           <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                             Use code <span className="font-mono font-bold text-amber-600 dark:text-amber-500">{msg.coupon.code}</span> for {msg.coupon.discount}!
                           </p>
                           <button 
                             onClick={() => copyToClipboard(msg.coupon!.code)}
                             className="flex items-center justify-center gap-2 w-full py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                           >
                             {copiedCoupon ? <FiCheck /> : <FiCopy />}
                             {copiedCoupon ? 'Copied!' : 'Copy Code'}
                           </button>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                     <div className="bg-white dark:bg-zinc-800 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1 shadow-sm border border-zinc-100 dark:border-zinc-700">
                        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></span>
                        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></span>
                        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></span>
                     </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about swag..."
                    className="flex-1 rounded-full border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-cyan-500 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-cyan-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-cyan-600 text-white p-2.5 rounded-full hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                  >
                    <FiSend className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-full shadow-lg transition-colors flex items-center justify-center ${
            isOpen 
              ? 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' 
              : 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-cyan-500/25'
          }`}
        >
          {isOpen ? <FiX className="w-6 h-6" /> : <FiMessageSquare className="w-6 h-6" />}
        </motion.button>
      </div>
    </>
  );
}
