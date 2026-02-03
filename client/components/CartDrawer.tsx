"use client";

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiTrash2, FiCreditCard, FiShoppingBag as FiShoppingBagFixed } from 'react-icons/fi';
import { useState } from 'react';
import api from '@/lib/api';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeFromCart, updateQuantity, cartTotal, finalTotal, coupon, applyCoupon, removeCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [step, setStep] = useState<'cart' | 'details' | 'payment'>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Checkout Form State
  const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      address: '',
      city: '',
      zip: ''
  });

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponError('');
    try {
      const { data } = await api.post('/coupons/validate', {
        code: couponCode,
        cartTotal: cartTotal
      });
      
      if (data.valid) {
        applyCoupon({
          code: data.coupon.code,
          discountAmount: data.discountAmount,
          couponDetails: data.coupon
        });
        setCouponCode('');
        toast.success('Coupon Applied!');
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
      toast.error('Invalid Coupon');
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    // Simulate Payment Delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      if (items.length === 0) return;

      const orderData = {
         items: items.map(i => ({ product: i.product, quantity: i.quantity })),
         customerInfo: {
             name: formData.name || "Guest",
             email: formData.email || "guest@example.com",
             address: formData.address,
             city: formData.city,
             zip: formData.zip
         },
         couponCode: coupon?.code,
         userId: user?._id
      };
      
      await api.post('/orders', orderData);
      
      clearCart();
      onClose();
      setStep('cart');
      toast.success('Order Placed Successfully!');
      router.refresh(); 
    } catch (err: any) {
      toast.error('Checkout Failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white p-6 shadow-2xl dark:bg-zinc-950 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                      {step === 'cart' ? 'Your Cart' : step === 'details' ? 'Shipping Details' : 'Payment'}
                  </h2>
                  {step !== 'cart' && (
                      <button onClick={() => setStep('cart')} className="text-sm text-zinc-500 hover:underline">
                          ← Back
                      </button>
                  )}
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {step === 'cart' && (
                <>
                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-zinc-400">
                    <FiShoppingBagFixed className="w-10 h-10 mb-2 opacity-50" />
                    <p>Your cart is empty</p>
                    </div>
                ) : (
                    items.map((item) => (
                    <div key={item.product} className="flex gap-4">
                        <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                            <span className="text-xs text-zinc-400">{item.name.substring(0,2).toUpperCase()}</span>
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                        <div className="flex justify-between">
                            <h3 className="font-medium text-zinc-900 dark:text-white">{item.name}</h3>
                            <p className="font-semibold text-zinc-900 dark:text-white">${item.price * item.quantity}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
                            <button 
                                onClick={() => updateQuantity(item.product, Math.max(0, item.quantity - 1))}
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded"
                            >
                                <FiMinus className="w-3 h-3" />
                            </button>
                            <span className="text-sm w-4 text-center">{item.quantity}</span>
                            <button 
                                onClick={() => updateQuantity(item.product, item.quantity + 1)}
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded"
                            >
                                <FiPlus className="w-3 h-3" />
                            </button>
                            </div>
                            <button 
                            onClick={() => removeFromCart(item.product)}
                            className="text-zinc-400 hover:text-red-500 transition-colors"
                            >
                            <FiTrash2 className="w-4 h-4" />
                            </button>
                        </div>
                        </div>
                    </div>
                    ))
                )}
                </div>

                <div className="mt-8 space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                <div className="space-y-2">
                    {coupon ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900/50">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-green-700 dark:text-green-400">Coupon: {coupon.code}</span>
                            <span className="text-xs text-green-600 dark:text-green-500">-${coupon.discountAmount} off</span>
                        </div>
                        <button onClick={removeCoupon} className="text-green-700 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200">
                            <FiX />
                        </button>
                    </div>
                    ) : (
                        <div className="flex gap-2">
                            <input 
                            type="text" 
                            placeholder="Promo Code" 
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-white"
                            />
                            <button 
                            onClick={handleApplyCoupon}
                            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                            >
                                Apply
                            </button>
                        </div>
                    )}
                    {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    {coupon && (
                        <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                            <span>Discount</span>
                            <span>-${coupon.discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-zinc-900 dark:text-white pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <span>Total</span>
                        <div className="flex flex-col items-end">
                        {coupon && <span className="text-xs text-zinc-400 line-through decoration-red-500">${cartTotal.toFixed(2)}</span>}
                        <span>${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setStep('details')}
                    disabled={items.length === 0}
                    className="w-full rounded-full bg-black py-3 font-semibold text-white shadow-lg transition-all hover:bg-zinc-800 dark:bg-white dark:text-black"
                >
                    Checkout (${finalTotal.toFixed(2)})
                </button>
                </div>
                </>
            )}

            {step === 'details' && (
                <div className="flex flex-col h-full">
                    <div className="flex-1 space-y-4">
                        <div>
                             <label className="block text-sm font-medium mb-1">Name</label>
                             <input type="text" className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                             <label className="block text-sm font-medium mb-1">Email</label>
                             <input type="email" className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div>
                             <label className="block text-sm font-medium mb-1">Address</label>
                             <input type="text" className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                                value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                        </div>
                        <div className="flex gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">City</label>
                                <input type="text" className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                                    value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Zip</label>
                                <input type="text" className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                                    value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                         <button
                            onClick={() => setStep('payment')}
                            disabled={!formData.name || !formData.email || !formData.address}
                            className="w-full rounded-full bg-black py-3 font-semibold text-white shadow-lg transition-all hover:bg-zinc-800 dark:bg-white dark:text-black disabled:opacity-50"
                         >
                            Continue to Payment
                         </button>
                    </div>
                </div>
            )}

            {step === 'payment' && (
                <div className="flex flex-col h-full justify-between">
                     <div className="space-y-6">
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                           <h3 className="font-semibold mb-2">Order Summary</h3>
                           <div className="flex justify-between text-sm">
                               <span>Items ({items.length})</span>
                               <span>${cartTotal.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between text-sm mt-1">
                               <span>Shipping</span>
                               <span className="text-green-600">Free</span>
                           </div>
                           {coupon && (
                               <div className="flex justify-between text-sm mt-1 text-green-600">
                                   <span>Discount</span>
                                   <span>-${coupon.discountAmount}</span>
                               </div>
                           )}
                           <div className="flex justify-between font-bold mt-3 pt-3 border-t dark:border-zinc-800">
                               <span>Total</span>
                               <span>${finalTotal.toFixed(2)}</span>
                           </div>
                        </div>

                        <div className="p-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-center py-8">
                             <FiCreditCard className="w-8 h-8 text-zinc-400 mb-2" />
                             <p className="font-medium">Demo Payment Mode</p>
                             <p className="text-xs text-zinc-500 mb-4">No actual card required.</p>
                             <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                                  {isProcessing && <div className="h-full bg-blue-500 animate-pulse w-full"></div>}
                             </div>
                        </div>
                     </div>

                     <button
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="w-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-50"
                     >
                        {isProcessing ? 'Processing Payment...' : `Pay $${finalTotal.toFixed(2)}`}
                     </button>
                </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
