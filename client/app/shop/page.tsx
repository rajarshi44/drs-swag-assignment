"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import api from '@/lib/api';
import { motion } from 'framer-motion';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
      setFilteredProducts(data);
      
      // Extract unique categories
      const uniqueCats = ['All', ...Array.from(new Set(data.map((p: any) => p.category as string)))];
      setCategories(uniqueCats as string[]);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === category));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
        
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 font-medium"
          >
            Premium Corporate Merchandise
          </motion.p>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-normal tracking-tight text-zinc-900 dark:text-white"
          >
            Swag that{' '}
            <span className="font-cursive italic text-cyan-600 dark:text-cyan-400">
              Connects
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed"
          >
            Empower your community with premium merchandise. 
            Quality gear that developers will actually want to wear.
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {categories.map((cat, index) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg'
                  : 'bg-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </motion.div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-zinc-400 text-lg font-cursive italic">No products found in this category.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 dark:border-zinc-800 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-500">
              © 2026 <span className="font-cursive italic text-zinc-700 dark:text-zinc-300">SwagStore</span>. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-zinc-500">
              <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors elegant-link">Terms</a>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors elegant-link">Privacy</a>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors elegant-link">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
