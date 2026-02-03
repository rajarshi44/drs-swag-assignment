"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiPackage, FiClock, FiCheck, FiX, FiShoppingBag, FiCalendar, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Safety check - if user object doesn't have _id yet (though it should if auth yielded true)
    if (user && user._id) {
        fetchOrders();
    } else if (!user) {
        // Double check auth state might be lagging
    }
  }, [isAuthenticated, user, router]);

  const fetchOrders = async () => {
    try {
      // The backend getOrders controller checks req.query.userId
      const res = await api.get(`/orders?userId=${user?._id}`);
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string, isDelivered: boolean) => {
    // Fallback to isDelivered logic if status is pending/default but isDelivered is true (legacy compatible)
    if (status === 'fulfilled' || status === 'completed' || isDelivered) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
    if (status === 'cancelled') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
  };

  const getStatusIcon = (status: string, isDelivered: boolean) => {
    if (status === 'fulfilled' || status === 'completed' || isDelivered) return <FiCheck className="w-3.5 h-3.5" />;
    if (status === 'cancelled') return <FiX className="w-3.5 h-3.5" />;
    return <FiClock className="w-3.5 h-3.5" />;
  };

  if (isLoading) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                <FiPackage className="w-6 h-6 text-zinc-900 dark:text-white" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Orders</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">View and track your order history</p>
            </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-300 dark:text-zinc-600">
                <FiShoppingBag className="w-8 h-8"/>
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">No orders placed yet</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md">Looks like you haven't purchased any swag yet. Check out our latest collection!</p>
            <button 
                onClick={() => router.push('/shop')}
                className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
            >
                Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={order._id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-default"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-4 sm:gap-8">
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Order Placed</p>
                            <div className="flex items-center gap-2 text-zinc-900 dark:text-white text-sm font-medium">
                                <FiCalendar className="w-4 h-4 text-zinc-400" />
                                {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Total</p>
                            <p className="text-zinc-900 dark:text-white text-sm font-bold">${order.finalAmount.toFixed(2)}</p>
                        </div>
                        <div className="hidden sm:block">
                             <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Order ID</p>
                             <p className="text-zinc-500 text-sm font-mono tracking-tight">#{order._id.substring(0,8)}</p>
                        </div>
                    </div>
                    
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 border ${getStatusColor(order.status, order.isDelivered)}`}>
                        {getStatusIcon(order.status || (order.isDelivered ? 'fulfilled' : 'pending'), order.isDelivered)}
                        {order.status || (order.isDelivered ? 'Delivered' : 'Pending')}
                    </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex -space-x-3 overflow-hidden">
                        {order.items.slice(0, 4).map((item: any, i: number) => (
                            <div key={i} className="relative w-12 h-12 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 shrink-0">
                                {item.product?.image ? (
                                    <img src={item.product.image} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-xs font-bold text-zinc-400">?</div>
                                )}
                            </div>
                        ))}
                         {order.items.length > 4 && (
                            <div className="relative w-12 h-12 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 shrink-0">
                                +{order.items.length - 4}
                            </div>
                         )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                            {order.items.map((i: any) => `${i.quantity}x ${i.product?.name || 'Item'}`).join(', ')}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            {order.items.length} item{order.items.length !== 1 && 's'}
                        </p>
                    </div>

                    {/* <button className="flex items-center gap-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:underline group-hover:translate-x-1 transition-transform">
                        View Details <FiChevronRight />
                    </button> */}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
