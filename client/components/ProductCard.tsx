"use client";

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiCheck } from 'react-icons/fi';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  tieredPricing?: Array<{ quantity: number; price: number }>;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image
    });
    setTimeout(() => setIsAdding(false), 800);
  };

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden card-hover"
    >
      {/* Image Container */}
      <Link href={`/products/${product._id}`} className="block">
        <div className="aspect-[4/5] relative overflow-hidden bg-zinc-50 dark:bg-zinc-800">
          {product.image ? (
            <Image 
              src={product.image} 
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : ( 
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-cursive italic text-zinc-200 dark:text-zinc-700">
                {product.name.substring(0,1)}
              </span>
            </div>
          )}
          
          {/* Category Tag */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-full text-zinc-600 dark:text-zinc-400">
              {product.category}
            </span>
          </div>

          {/* Quick Add Button */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(); }}
              disabled={product.stock <= 0}
              className={`w-full py-2.5 rounded-lg font-medium text-sm shadow-lg transition-all duration-300 ${
                isAdding 
                  ? 'bg-emerald-500 text-white' 
                  : product.stock <= 0
                  ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                  : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900'
              }`}
            >
              {isAdding ? 'Added!' : product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </Link>
      
      {/* Content */}
      <div className="p-4">
        {/* Title and Price Row */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <Link href={`/products/${product._id}`} className="group/link flex-1">
            <h3 className="font-medium text-zinc-900 dark:text-white leading-snug group-hover/link:text-cyan-600 dark:group-hover/link:text-cyan-400 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <span className="font-semibold text-zinc-900 dark:text-white whitespace-nowrap">
            ${product.price}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-50 dark:border-zinc-800">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${
              product.stock > 10 ? 'bg-emerald-500' : 
              product.stock > 0 ? 'bg-amber-500' : 'bg-zinc-300'
            }`} />
            <span className={`text-xs ${
              product.stock > 0 ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
              {product.stock > 0 ? `${product.stock} left` : 'Sold out'}
            </span>
          </div>
          
          {product.tieredPricing && product.tieredPricing.length > 0 && (
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
              Bulk pricing
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
