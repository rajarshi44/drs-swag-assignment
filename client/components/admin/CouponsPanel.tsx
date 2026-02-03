"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { FiPlus, FiTrash2, FiTag, FiPercent, FiDollarSign, FiCalendar, FiAlertCircle, FiPackage, FiGrid } from 'react-icons/fi';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Coupon {
  _id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  expirationDate: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  appliesToAllProducts?: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

interface Product {
  _id: string;
  name: string;
  category: string;
}

interface CouponsPanelProps {
  onCountChange?: (count: number) => void;
}

const CATEGORIES = ['Apparel', 'Electronics', 'Accessories', 'Office', 'Drinkware', 'Bags', 'Other'];

export default function CouponsPanel({ onCountChange }: CouponsPanelProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: 0,
    expirationDate: '',
    usageLimit: 0,
    isActive: true,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    appliesToAllProducts: true,
    applicableProducts: [] as string[],
    applicableCategories: [] as string[]
  });

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data);
      onCountChange?.(data.length);
    } catch (error) {
      console.error('Failed to fetch coupons', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!couponForm.code.trim() || couponForm.code.length < 3) {
      newErrors.code = 'Code must be at least 3 characters';
    }
    if (couponForm.code.length > 20) {
      newErrors.code = 'Code cannot exceed 20 characters';
    }
    if (couponForm.value <= 0) {
      newErrors.value = 'Discount value must be greater than 0';
    }
    // Key validation: percent must be 0-100
    if (couponForm.type === 'percent' && couponForm.value > 100) {
      newErrors.value = 'Percentage discount cannot exceed 100%';
    }
    if (!couponForm.expirationDate) {
      newErrors.expirationDate = 'Expiration date is required';
    } else if (new Date(couponForm.expirationDate) <= new Date()) {
      newErrors.expirationDate = 'Expiration date must be in the future';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    try {
      await api.post('/coupons', {
        ...couponForm,
        usageLimit: couponForm.usageLimit === 0 ? null : couponForm.usageLimit,
        minOrderAmount: couponForm.minOrderAmount || 0,
        maxDiscountAmount: couponForm.maxDiscountAmount || null
      });
      toast.success('Coupon created successfully!');
      resetForm();
      setShowAddCoupon(false);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const resetForm = () => {
    setCouponForm({
      code: '',
      type: 'percent',
      value: 0,
      expirationDate: '',
      usageLimit: 0,
      isActive: true,
      minOrderAmount: 0,
      maxDiscountAmount: 0,
      appliesToAllProducts: true,
      applicableProducts: [],
      applicableCategories: []
    });
    setErrors({});
  };

  const toggleProduct = (productId: string) => {
    setCouponForm(prev => ({
      ...prev,
      applicableProducts: prev.applicableProducts.includes(productId)
        ? prev.applicableProducts.filter(p => p !== productId)
        : [...prev.applicableProducts, productId]
    }));
  };

  const toggleCategory = (category: string) => {
    setCouponForm(prev => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(category)
        ? prev.applicableCategories.filter(c => c !== category)
        : [...prev.applicableCategories, category]
    }));
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  // Reset value when switching types if it exceeds limits
  const handleTypeChange = (newType: 'percent' | 'fixed') => {
    let newValue = couponForm.value;
    if (newType === 'percent' && newValue > 100) {
      newValue = 100;
    }
    setCouponForm({ ...couponForm, type: newType, value: newValue });
    setErrors({ ...errors, value: '' });
  };

  // Get tomorrow's date for min date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-400">
        Loading coupons...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <FiTag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">Coupons</h3>
            <p className="text-sm text-zinc-500">{coupons.length} active coupons</p>
          </div>
        </div>
        <button
          onClick={() => { setShowAddCoupon(!showAddCoupon); if (!showAddCoupon) resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <FiPlus className="w-4 h-4" />
          Add Coupon
        </button>
      </div>

      {/* Add Coupon Form */}
      <AnimatePresence>
        {showAddCoupon && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-zinc-100 dark:border-zinc-800 overflow-hidden"
          >
            <form onSubmit={handleAddCoupon} className="p-5 bg-zinc-50 dark:bg-zinc-800/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coupon Code */}
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., SAVE20, WELCOME10"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    maxLength={20}
                    className={`w-full p-3 rounded-lg border ${errors.code ? 'border-red-500' : 'dark:border-zinc-700'} dark:bg-zinc-900 uppercase focus:ring-2 focus:ring-purple-500 outline-none transition-all font-mono text-lg tracking-wider`}
                  />
                  {errors.code && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.code}</p>}
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Discount Type *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('percent')}
                      className={`flex-1 py-3 px-4 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                        couponForm.type === 'percent'
                          ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      <FiPercent className="w-4 h-4" />
                      Percentage
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('fixed')}
                      className={`flex-1 py-3 px-4 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                        couponForm.type === 'fixed'
                          ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      <FiDollarSign className="w-4 h-4" />
                      Fixed Amount
                    </button>
                  </div>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    {couponForm.type === 'percent' ? 'Discount Percentage (0-100) *' : 'Discount Amount ($) *'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder={couponForm.type === 'percent' ? '20' : '10.00'}
                      value={couponForm.value || ''}
                      onChange={(e) => {
                        let val = parseFloat(e.target.value) || 0;
                        // Enforce max 100 for percent type
                        if (couponForm.type === 'percent' && val > 100) {
                          val = 100;
                        }
                        setCouponForm({ ...couponForm, value: val });
                      }}
                      min="0"
                      max={couponForm.type === 'percent' ? 100 : undefined}
                      step={couponForm.type === 'percent' ? 1 : 0.01}
                      className={`w-full p-3 rounded-lg border ${errors.value ? 'border-red-500' : 'dark:border-zinc-700'} dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all pr-12`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">
                      {couponForm.type === 'percent' ? '%' : '$'}
                    </span>
                  </div>
                  {errors.value && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.value}</p>}
                  {couponForm.type === 'percent' && (
                    <p className="text-zinc-500 text-xs mt-1">Maximum allowed: 100%</p>
                  )}
                </div>

                {/* Expiration Date */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Expiration Date *
                  </label>
                  <input
                    type="date"
                    value={couponForm.expirationDate}
                    onChange={(e) => setCouponForm({ ...couponForm, expirationDate: e.target.value })}
                    min={getTomorrowDate()}
                    className={`w-full p-3 rounded-lg border ${errors.expirationDate ? 'border-red-500' : 'dark:border-zinc-700'} dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all`}
                  />
                  {errors.expirationDate && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.expirationDate}</p>}
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    placeholder="0 = Unlimited"
                    value={couponForm.usageLimit || ''}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full p-3 rounded-lg border dark:border-zinc-700 dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  />
                  <p className="text-zinc-500 text-xs mt-1">Leave at 0 for unlimited uses</p>
                </div>
              </div>

              {/* Product Restrictions */}
              <div className="space-y-3 p-4 bg-white dark:bg-zinc-900 rounded-lg border dark:border-zinc-700">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="appliesToAll"
                    checked={couponForm.appliesToAllProducts}
                    onChange={(e) => setCouponForm({ 
                      ...couponForm, 
                      appliesToAllProducts: e.target.checked,
                      applicableProducts: [],
                      applicableCategories: []
                    })}
                    className="w-4 h-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="appliesToAll" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Applies to all products
                  </label>
                </div>

                {!couponForm.appliesToAllProducts && (
                  <div className="space-y-4 pt-3 border-t dark:border-zinc-700">
                    {/* Category Selection */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FiGrid className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Select Categories
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(category => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => toggleCategory(category)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              couponForm.applicableCategories.includes(category)
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-300'
                                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-transparent hover:border-zinc-300'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Product Selection */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FiPackage className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Select Specific Products
                        </span>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                        {products.length === 0 ? (
                          <p className="text-xs text-zinc-500 py-2 text-center">No products available</p>
                        ) : (
                          products.map(product => (
                            <label key={product._id} className="flex items-center gap-2 p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={couponForm.applicableProducts.includes(product._id)}
                                onChange={() => toggleProduct(product._id)}
                                className="w-4 h-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm text-zinc-700 dark:text-zinc-300">{product.name}</span>
                              <span className="text-xs text-zinc-400">({product.category})</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Selection Summary */}
                    <div className="text-xs text-zinc-500">
                      {couponForm.applicableCategories.length > 0 || couponForm.applicableProducts.length > 0 ? (
                        <span>
                          Applies to: {couponForm.applicableCategories.length} categories, {couponForm.applicableProducts.length} specific products
                        </span>
                      ) : (
                        <span className="text-amber-600">⚠️ Select at least one category or product</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setShowAddCoupon(false); resetForm(); }}
                  className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                  Create Coupon
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupons List */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((coupon) => {
            const isExpired = new Date(coupon.expirationDate) < new Date();
            const daysLeft = Math.ceil((new Date(coupon.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            
            return (
              <motion.div
                key={coupon._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-xl p-4 border transition-all group ${
                  isExpired 
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' 
                    : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${
                    coupon.type === 'percent' 
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {coupon.type === 'percent' ? <FiPercent className="w-5 h-5" /> : <FiDollarSign className="w-5 h-5" />}
                  </div>
                  <button 
                    onClick={() => handleDeleteCoupon(coupon._id)} 
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono font-bold text-lg text-zinc-900 dark:text-white">{coupon.code}</span>
                  {isExpired && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">EXPIRED</span>
                  )}
                </div>
                
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-3">
                  {coupon.type === 'percent' ? `${coupon.value}% OFF` : `$${coupon.value} OFF`}
                </p>
                
                <div className="space-y-1.5 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-3.5 h-3.5" />
                    {isExpired 
                      ? `Expired ${new Date(coupon.expirationDate).toLocaleDateString()}`
                      : `${daysLeft} days left`
                    }
                  </div>
                  <div className="flex items-center gap-2">
                    <FiTag className="w-3.5 h-3.5" />
                    {coupon.usageLimit ? `${coupon.usedCount}/${coupon.usageLimit} used` : 'Unlimited uses'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {coupons.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
            <FiTag className="w-12 h-12 mb-3" />
            <p>No coupons yet</p>
            <button 
              onClick={() => setShowAddCoupon(true)}
              className="mt-3 text-purple-500 hover:underline text-sm"
            >
              Create your first coupon
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
