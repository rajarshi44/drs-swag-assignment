"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiPackage, FiCalendar, FiClock } from 'react-icons/fi';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, router]);

  const fetchOrders = async () => {
    try {
      if (!user?._id) return;
      const { data } = await api.get(`/orders?userId=${user._id}`);
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <Navbar />
      <div className="flex items-center justify-center h-[60vh] text-zinc-400">Loading your orders...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">My Orders</h1>

        {orders.length === 0 ? (
           <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
               <FiPackage className="w-16 h-16 mx-auto text-zinc-300 mb-4" />
               <p className="text-zinc-500">You haven't placed any orders yet.</p>
           </div>
        ) : (
           <div className="space-y-6">
              {orders.map((order) => (
                 <div key={order._id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                       <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Order ID</p>
                          <p className="font-mono text-sm text-zinc-900 dark:text-zinc-300">{order._id.substring(0, 8)}...{order._id.substring(order._id.length - 4)}</p>
                       </div>
                       <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <FiCalendar className="text-zinc-400" />
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">
                             {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                       </div>
                    </div>

                    <div className="space-y-4 mb-4">
                       {order.items.map((item: any, idx: number) => {
                           const product = item.product || {};
                           return (
                           <div key={idx} className="flex gap-4 items-center">
                               {product.image ? (
                                   <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative flex-shrink-0">
                                       <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                   </div>
                               ) : (
                                   <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 flex-shrink-0">
                                       ?
                                   </div>
                               )}
                               <div className="flex-1 min-w-0">
                                   <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                       {item.quantity}x {product.name || 'Unknown Product'}
                                   </p>
                                   <p className="text-xs text-zinc-500">
                                       ${(item.priceAtPurchase).toFixed(2)} each
                                   </p>
                               </div>
                               <span className="font-medium text-zinc-900 dark:text-white">
                                   ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                               </span>
                           </div>
                       )})}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
                       <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                              {order.isDelivered ? 'Delivered' : 'Processing'}
                          </span>
                       </div>
                       <div className="text-right">
                          <span className="text-xs text-zinc-500 mr-2">Total</span>
                          <span className="text-xl font-bold text-zinc-900 dark:text-white">${order.finalAmount.toFixed(2)}</span>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        )}
      </main>
    </div>
  );
}
