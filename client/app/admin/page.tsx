"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import AdminChat from '@/components/AdminChat';
import AdminManagement from '@/components/AdminManagement';
import api from '@/lib/api';
import { FiDollarSign, FiPackage, FiShoppingCart } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, pendingOrders: 0 });
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
        router.push('/login');
    } else if (user?.role !== 'admin') {
        router.push('/');
    } else {
        fetchData();
    }
  }, [isAuthenticated, user, router]);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/orders'); // Ensure this endpoint verifies admin token too, but front-end check is good UX
      setOrders(data);
      
      const totalRevenue = data.reduce((acc: number, o: any) => acc + o.finalAmount, 0);
      setStats({
        revenue: totalRevenue,
        totalOrders: data.length,
        pendingOrders: data.filter((o: any) => !o.isDelivered).length
      });
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !user || user.role !== 'admin') {
      return <div className="min-h-screen flex items-center justify-center">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <Navbar /> {/* Ensure we wrap in CartProvider in layout generally, but here for nav */}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Monitor performance and ask AI for insights.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                   <FiDollarSign className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Revenue</p>
                   <p className="text-2xl font-bold text-zinc-900 dark:text-white">${stats.revenue.toFixed(2)}</p>
                </div>
             </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                   <FiShoppingCart className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Orders</p>
                   <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.totalOrders}</p>
                </div>
             </div>
          </div>
           {/* Placeholder for third stat */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                   <FiPackage className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-sm text-zinc-500 dark:text-zinc-400">Recent Activity</p>
                   <p className="text-sm font-medium text-zinc-900 dark:text-white">View Orders Below</p>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Recent Orders List */}
           <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-[400px]">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                 <h3 className="font-semibold text-zinc-900 dark:text-white">Recent Orders</h3>
              </div>
              <div className="overflow-y-auto p-0 flex-1">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 font-medium sticky top-0">
                       <tr>
                          <th className="px-6 py-3">Order ID</th>
                          <th className="px-6 py-3">Customer</th>
                          <th className="px-6 py-3">Total</th>
                          <th className="px-6 py-3">Date</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                       {orders.length === 0 ? (
                         <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-400">No orders yet</td></tr>
                       ) : orders.map((order) => (
                          <tr key={order._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                             <td className="px-6 py-4 font-mono text-zinc-500 text-xs">{order._id.substring(0,8)}...</td>
                             <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100">{order.customerInfo?.name || 'Guest'}</td>
                             <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">${order.finalAmount.toFixed(2)}</td>
                             <td className="px-6 py-4 text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* AI Chat */}
           <div>
              <AdminChat />
           </div>
        </div>

        {/* Product & Coupon Management */}
        <div className="mt-8">
           <AdminManagement />
        </div>

      </main>
    </div>
  );
}
