"use client";

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { FiShoppingBag, FiUser, FiLogOut } from 'react-icons/fi';
import { useState } from 'react';
import CartDrawer from './CartDrawer';
import clsx from 'clsx';

export default function Navbar() {
  const { items } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 dark:bg-black/80 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-200">
              SwagStore
            </Link>

            <div className="flex items-center space-x-6">
              {isAuthenticated ? (
                  <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 hidden sm:block">
                          Welcome, {user?.name.split(' ')[0]}
                      </span>
                      {user?.role === 'admin' && (
                          <Link href="/admin" className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400">
                            Dashboard
                          </Link>
                      )}
                      {/* My Orders Link */}
                      {user?.role !== 'admin' && (
                           <Link href="/orders" className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
                              Orders
                           </Link>
                      )}
                      
                      <button onClick={logout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors" title="Logout">
                          <FiLogOut className="w-5 h-5" />
                      </button>
                  </div>
              ) : (
                  <Link href="/login" className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
                      <FiUser className="w-5 h-5" />
                      <span>Sign In</span>
                  </Link>
              )}

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
                title="Cart"
              >
                <FiShoppingBag className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full dark:bg-white dark:text-black animate-in zoom-in">
                    {itemCount}
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
