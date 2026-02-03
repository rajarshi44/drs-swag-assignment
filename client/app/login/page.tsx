"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/users/login' : '/users';
      const payload = isLogin 
         ? { email: formData.email, password: formData.password }
         : formData;

      const { data } = await api.post(endpoint, payload);
      
      login(data.token, {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role
      });

    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xl p-8">
        <div className="text-center mb-8">
           <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
             {isLogin ? 'Welcome Back' : 'Join DRS Swag'}
           </h1>
           <p className="text-zinc-500 dark:text-zinc-400">
             {isLogin ? 'Sign in to manage your orders' : 'Create an account to start shopping'}
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
             <div>
               <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
               <input 
                 type="text" 
                 required 
                 className="w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-black dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-white"
                 value={formData.name}
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
               />
             </div>
          )}
          
          <div>
             <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
             <input 
               type="email" 
               required 
               className="w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-black dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-white"
               value={formData.email}
               onChange={(e) => setFormData({...formData, email: e.target.value})}
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</label>
             <input 
               type="password" 
               required 
               className="w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-black dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-white"
               value={formData.password}
               onChange={(e) => setFormData({...formData, password: e.target.value})}
             />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-xl bg-black text-white py-3 font-semibold hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
          >
             {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
           <p className="text-zinc-600 dark:text-zinc-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="font-bold text-black dark:text-white hover:underline"
              >
                 {isLogin ? 'Sign Up' : 'Log In'}
              </button>
           </p>
        </div>
        
        <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600">
               ← Back to Store
            </Link>
        </div>
      </div>
    </div>
  );
}
