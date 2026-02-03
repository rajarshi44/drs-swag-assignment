"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { FiPlus, FiTrash2, FiTag, FiPercent, FiDollarSign, FiCalendar } from 'react-icons/fi';
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
}

interface CouponsPanelProps {
  onCountChange?: (count: number) => void;
}

export default function CouponsPanel({ onCountChange }: CouponsPanelProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: 0,
    expirationDate: '',
    usageLimit: 0,
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
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

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/coupons', {
        ...couponForm,
        usageLimit: couponForm.usageLimit === 0 ? null : couponForm.usageLimit
      });
      toast.success('Coupon created successfully!');
      setCouponForm({ code: '', type: 'percent', value: 0, expirationDate: '', usageLimit: 0, isActive: true });
      setShowAddCoupon(false);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
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
          onClick={() => setShowAddCoupon(!showAddCoupon)}
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
                <input
                  type="text"
                  placeholder="Coupon Code (e.g., SAVE20)"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  required
                  className="col-span-full p-3 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700 uppercase focus:ring-2 focus:ring-purple-500 outline-none transition-all font-mono"
                />
                <select
                  value={couponForm.type}
                  onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value as 'percent' | 'fixed' })}
                  className="p-3 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
                <input
                  type="number"
                  placeholder={couponForm.type === 'percent' ? '% off (e.g., 20)' : '$ off (e.g., 10)'}
                  value={couponForm.value || ''}
                  onChange={(e) => setCouponForm({ ...couponForm, value: parseFloat(e.target.value) })}
                  required
                  min="0"
                  max={couponForm.type === 'percent' ? 100 : undefined}
                  className="p-3 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
                <input
                  type="date"
                  value={couponForm.expirationDate}
                  onChange={(e) => setCouponForm({ ...couponForm, expirationDate: e.target.value })}
                  required
                  className="p-3 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
                <input
                  type="number"
                  placeholder="Usage Limit (0 = unlimited)"
                  value={couponForm.usageLimit || ''}
                  onChange={(e) => setCouponForm({ ...couponForm, usageLimit: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="p-3 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddCoupon(false)}
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
