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
  const { addToCart, items } = useCart();
  
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
      // Auto-select first variant if product has variants
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
    
    // Add variant price modifier
    if (selectedVariant) {
      price += selectedVariant.priceModifier || 0;
    }
    
    // Check tiered pricing
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
    // Open cart drawer or navigate to checkout
    // For now, we'll show a message
    toast.success('Proceeding to checkout...');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-zinc-500">Loading product...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-zinc-500">Product not found</p>
          <Link href="/" className="text-purple-500 hover:underline">
            Go back to shop
          </Link>
        </div>
      </div>
    );
  }

  const effectivePrice = getEffectivePrice();
  const availableStock = getAvailableStock();
  const isInStock = availableStock > 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-purple-500 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                  <span className="text-8xl font-bold">{product.name.substring(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>
            
            {/* Category Badge */}
            <span className="absolute top-4 left-4 bg-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full">
              {product.category}
            </span>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white mb-2">
              {product.name}
            </h1>
            
            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                ${effectivePrice.toFixed(2)}
              </span>
              {product.tieredPricing && product.tieredPricing.length > 0 && quantity >= (product.tieredPricing[0]?.quantity || 100) && (
                <span className="text-lg text-zinc-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className={`inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full text-sm font-medium mb-6 ${
              isInStock 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isInStock ? 'bg-green-500' : 'bg-red-500'}`} />
              {isInStock ? `${availableStock} in stock` : 'Out of Stock'}
            </div>

            {/* Description */}
            <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Variants Selection */}
            {product.hasVariants && product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Select Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant._id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock <= 0}
                      className={`px-4 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${
                        selectedVariant?._id === variant._id
                          ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          : variant.stock <= 0
                          ? 'border-zinc-200 dark:border-zinc-700 text-zinc-300 dark:text-zinc-600 cursor-not-allowed opacity-50'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-700'
                      }`}
                    >
                      {variant.size}
                      {variant.color && <span className="text-zinc-400 ml-1">/ {variant.color}</span>}
                      {variant.stock <= 0 && <span className="ml-2 text-xs">(Sold out)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors rounded-l-lg"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(availableStock, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center border-x border-zinc-200 dark:border-zinc-700 py-2 bg-transparent focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors rounded-r-lg"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
                
                <span className="text-sm text-zinc-500">
                  Total: <span className="font-bold text-zinc-900 dark:text-white">${(effectivePrice * quantity).toFixed(2)}</span>
                </span>
              </div>
            </div>

            {/* Bulk Pricing Info */}
            {product.tieredPricing && product.tieredPricing.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">💰 Bulk Discounts Available!</p>
                <div className="flex flex-wrap gap-3">
                  {product.tieredPricing.map((tier, i) => (
                    <span key={i} className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-1 rounded">
                      Buy {tier.quantity}+ → ${tier.price}/each
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!isInStock || isAdding}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg transition-all ${
                  isAdding
                    ? 'bg-green-500 text-white'
                    : isInStock
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100'
                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                }`}
              >
                {isAdding ? (
                  <>
                    <FiCheck className="w-5 h-5" />
                    Added!
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
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all ${
                  isInStock
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                }`}
              >
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-2">
                  <FiTruck className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-2">
                  <FiShield className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-2">
                  <FiPackage className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">Easy Returns</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
