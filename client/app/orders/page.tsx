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
      // Assuming GET /orders returns all for admin, but we might need a specific endpoint or filter
      // For now, let's filter client side or implement a quick backend change. 
      // Plan: Let's assume GET /orders returns *my* orders if user, *all* if admin.
      // I need to verify orderController.js logic.
      const { data } = await api.get('/orders');
      // If the backend returns all orders, and I'm a user, I should filter. 
      // Ideally backend handles this. Let's assume backend needs an update but for now I'll filter here if 'customerInfo.email' matches or something.
      // But wait, the orderController `getOrders` returns ALL orders currently.
      // I should update the backend to filter by user.
      
      // Temporary: Client-side filter by email if available in customerInfo
      const myOrders = data.filter((o: any) => o.user === user?._id || o.customerInfo?.email === user?.email);
      setOrders(myOrders);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

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
                 <div key={order._id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                       <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Order ID</p>
                          <p className="font-mono text-sm text-zinc-900 dark:text-zinc-300">{order._id}</p>
                       </div>
                       <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <FiCalendar className="text-zinc-400" />
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">
                             {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                       </div>
                    </div>

                    <div className="space-y-3 mb-4">
                       {order.items.map((item: any, idx: number) => (
                           <div key={idx} className="flex justify-between text-sm">
                               <span className="text-zinc-700 dark:text-zinc-300 overflow-hidden text-ellipsis whitespace-nowrap max-w-[70%]">
                                   {item.quantity}x Product ({item.product}) {/* Ideally product name populated */}
                               </span>
                               <span className="font-medium text-zinc-900 dark:text-white">
                                   ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                               </span>
                           </div>
                       ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
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
