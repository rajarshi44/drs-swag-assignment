"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
import { FiMinus, FiPlus, FiShoppingCart, FiArrowLeft, FiCheck, FiTruck, FiShield, FiPackage } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';

interface Variant {
  _id: string;
  size: string;
  color: string;
  stock: number;
  priceModifier: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  hasVariants: boolean;
  variants?: Variant[];
  totalStock?: number;
  tieredPricing?: Array<{ quantity: number; price: number }>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      if (data.hasVariants && data.variants?.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    } catch (error) {
      console.error('Failed to fetch product', error);
      toast.error('Product not found');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const getEffectivePrice = () => {
    if (!product) return 0;
    let price = product.price;
    
    if (selectedVariant) {
      price += selectedVariant.priceModifier || 0;
    }
    
    if (product.tieredPricing && product.tieredPricing.length > 0) {
      const applicableTier = [...product.tieredPricing]
        .sort((a, b) => b.quantity - a.quantity)
        .find(tier => quantity >= tier.quantity);
      if (applicableTier) {
        price = applicableTier.price + (selectedVariant?.priceModifier || 0);
      }
    }
    
    return price;
  };

  const getAvailableStock = () => {
    if (!product) return 0;
    if (product.hasVariants && selectedVariant) {
      return selectedVariant.stock;
    }
    return product.totalStock || product.stock;
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    setIsAdding(true);
    
    const variantInfo = selectedVariant 
      ? ` (${selectedVariant.size}${selectedVariant.color ? ` / ${selectedVariant.color}` : ''})` 
      : '';
    
    addToCart({
      product: product._id + (selectedVariant ? `-${selectedVariant._id}` : ''),
      name: product.name + variantInfo,
      price: getEffectivePrice(),
      quantity: quantity,
      image: product.image
    });
    
    toast.success(`Added ${quantity} item(s) to cart!`);
    
    setTimeout(() => setIsAdding(false), 1000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    toast.success('Proceeding to checkout...');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse font-cursive italic text-zinc-400 text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-zinc-500 font-cursive italic text-xl">Product not found</p>
          <Link href="/" className="text-cyan-600 hover:text-cyan-700 transition-colors">
            ← Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const effectivePrice = getEffectivePrice();
  const availableStock = getAvailableStock();
  const isInStock = availableStock > 0;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Shop</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl font-cursive italic text-zinc-200 dark:text-zinc-700">
                    {product.name.substring(0, 1)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Category */}
            <span className="absolute top-4 left-4 text-[10px] uppercase tracking-wider font-medium bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-zinc-600 dark:text-zinc-400">
              {product.category}
            </span>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-serif text-zinc-900 dark:text-white mb-4">
              {product.name}
            </h1>
            
            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-semibold text-zinc-900 dark:text-white">
                ${effectivePrice.toFixed(2)}
              </span>
              {product.tieredPricing && product.tieredPricing.length > 0 && quantity >= (product.tieredPricing[0]?.quantity || 100) && (
                <span className="text-lg text-zinc-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${isInStock ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
              <span className={`text-sm ${isInStock ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-400'}`}>
                {isInStock ? `${availableStock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Description */}
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Variants Selection */}
            {product.hasVariants && product.variants && product.variants.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant._id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock <= 0}
                      className={`px-4 py-2.5 rounded-lg border text-sm transition-all ${
                        selectedVariant?._id === variant._id
                          ? 'border-zinc-900 dark:border-white bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                          : variant.stock <= 0
                          ? 'border-zinc-200 dark:border-zinc-700 text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
                      }`}
                    >
                      {variant.size}
                      {variant.color && <span className="text-zinc-500 ml-1">/ {variant.color}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
                
                <span className="text-sm text-zinc-500">
                  Total: <span className="font-semibold text-zinc-900 dark:text-white">${(effectivePrice * quantity).toFixed(2)}</span>
                </span>
              </div>
            </div>

            {/* Bulk Pricing Info */}
            {product.tieredPricing && product.tieredPricing.length > 0 && (
              <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-xl p-4 mb-8">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Bulk Discounts</p>
                <div className="flex flex-wrap gap-2">
                  {product.tieredPricing.map((tier, i) => (
                    <span key={i} className="text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 rounded-full">
                      {tier.quantity}+ → ${tier.price}/each
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-10">
              <button
                onClick={handleAddToCart}
                disabled={!isInStock || isAdding}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-medium transition-all ${
                  isAdding
                    ? 'bg-emerald-500 text-white'
                    : isInStock
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100'
                    : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                }`}
              >
                {isAdding ? (
                  <>
                    <FiCheck className="w-5 h-5" />
                    Added
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={!isInStock}
                className={`flex-1 py-4 rounded-xl font-medium border-2 transition-all ${
                  isInStock
                    ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900'
                    : 'border-zinc-200 text-zinc-300 cursor-not-allowed'
                }`}
              >
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-between pt-8 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500">
                <FiTruck className="w-4 h-4" />
                <span className="text-xs">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <FiShield className="w-4 h-4" />
                <span className="text-xs">Secure</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <FiPackage className="w-4 h-4" />
                <span className="text-xs">Easy Returns</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
