"use client";

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { useState } from 'react'; // For loading state if needed

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

import { motion } from 'framer-motion';

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
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-5 overflow-hidden"
    >
      <div className="aspect-square relative overflow-hidden rounded-2xl bg-zinc-50 dark:bg-zinc-800 mb-5 group-hover:bg-zinc-100 transition-colors">
        {product.image ? (
            <Image 
              src={product.image} 
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
        ) : ( 
            <div className="absolute inset-0 flex items-center justify-center text-zinc-300 dark:text-zinc-600">
                <span className="text-4xl font-bold opacity-20">{product.name.substring(0,2).toUpperCase()}</span>
            </div>
        )}
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
           <button
             onClick={handleAddToCart}
             disabled={product.stock <= 0}
             className="w-full bg-black/90 backdrop-blur text-white py-3 rounded-xl font-medium shadow-lg hover:bg-black dark:bg-white/90 dark:text-black"
           >
             {isAdding ? 'Added!' : 'Quick Add'}
           </button>
        </div>
      </div>
      
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-tight">{product.name}</h3>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">{product.category}</p>
        </div>
        <div className="text-right">
          <span className="block font-bold text-lg text-zinc-900 dark:text-zinc-100">${product.price}</span>
        </div>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2 min-h-[2.5rem]">
        {product.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-50 dark:border-zinc-800">
         <div className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
             product.stock > 10 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
             product.stock > 0 ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
             'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
         }`}>
             <div className={`w-1.5 h-1.5 rounded-full ${
                 product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'
             }`} />
             {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
         </div>
         
         <div className="text-xs text-zinc-400">
            {product.tieredPricing && product.tieredPricing.length > 0 && 'Bulk savings'}
         </div>
      </div>
    </motion.div>
  );
}
