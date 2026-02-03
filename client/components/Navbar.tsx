"use client";

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { FiShoppingBag, FiUser, FiLogOut, FiGrid } from 'react-icons/fi';
import { useState } from 'react';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { items } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-zinc-100 dark:bg-zinc-950/90 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              href="/" 
              className="text-2xl font-cursive italic text-zinc-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              SwagStore
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              {isAuthenticated ? (
                <div className="flex items-center gap-5">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:block">
                    <span className="font-cursive italic text-zinc-700 dark:text-zinc-300">{user?.name.split(' ')[0]}</span>
                  </span>
                  
                  {user?.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                    >
                      <FiGrid className="w-4 h-4" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                  )}
                  
                  {user?.role !== 'admin' && (
                    <Link 
                      href="/orders" 
                      className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors elegant-link"
                    >
                      Orders
                    </Link>
                  )}
                  
                  <button 
                    onClick={logout} 
                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800" 
                    title="Logout"
                  >
                    <FiLogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  <FiUser className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-all rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="Cart"
              >
                <FiShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-violet-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
