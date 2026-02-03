"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import AdminChat from '@/components/AdminChat';
import api from '@/lib/api';
import { FiDollarSign, FiPackage, FiShoppingCart, FiTag, FiCpu, FiHome } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProductsPanel from '@/components/admin/ProductsPanel';
import CouponsPanel from '@/components/admin/CouponsPanel';

type TabType = 'overview' | 'products' | 'coupons' | 'ai';

const tabs = [
  { id: 'overview' as TabType, label: 'Overview', icon: FiHome },
  { id: 'products' as TabType, label: 'Products', icon: FiPackage },
  { id: 'coupons' as TabType, label: 'Coupons', icon: FiTag },
  { id: 'ai' as TabType, label: 'AI Copilot', icon: FiCpu },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, pendingOrders: 0 });
  const [productCount, setProductCount] = useState(0);
  const [couponCount, setCouponCount] = useState(0);
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
      const [ordersRes, productsRes, couponsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products'),
        api.get('/coupons')
      ]);
      
      setOrders(ordersRes.data);
      setProductCount(productsRes.data.length);
      setCouponCount(couponsRes.data.length);
      
      const totalRevenue = ordersRes.data.reduce((acc: number, o: any) => acc + o.finalAmount, 0);
      setStats({
        revenue: totalRevenue,
        totalOrders: ordersRes.data.length,
        pendingOrders: ordersRes.data.filter((o: any) => !o.isDelivered).length
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Monitor performance and manage your store.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            let count: number | undefined;
            if (tab.id === 'products') count = productCount;
            if (tab.id === 'coupons') count = couponCount;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-teal-500 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {count !== undefined && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20' : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}>
                      {count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0">
          {activeTab === 'overview' && (
            <div className="space-y-6 h-full">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
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
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
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
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                         <FiPackage className="w-6 h-6" />
                      </div>
                      <div>
                         <p className="text-sm text-zinc-500 dark:text-zinc-400">Pending Orders</p>
                         <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.pendingOrders}</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col flex-1">
                 <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Recent Orders</h3>
                 </div>
                 <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left text-sm">
                       <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 font-medium sticky top-0">
                          <tr>
                             <th className="px-5 py-3">Order ID</th>
                             <th className="px-5 py-3">Customer</th>
                             <th className="px-5 py-3">Total</th>
                             <th className="px-5 py-3">Date</th>
                             <th className="px-5 py-3">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {orders.length === 0 ? (
                            <tr><td colSpan={5} className="px-5 py-8 text-center text-zinc-400">No orders yet</td></tr>
                          ) : orders.slice(0, 10).map((order) => (
                             <tr key={order._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                <td className="px-5 py-4 font-mono text-zinc-500 text-xs">{order._id.substring(0,8)}...</td>
                                <td className="px-5 py-4 text-zinc-900 dark:text-zinc-100">{order.customerInfo?.name || 'Guest'}</td>
                                <td className="px-5 py-4 font-medium text-zinc-900 dark:text-white">${order.finalAmount.toFixed(2)}</td>
                                <td className="px-5 py-4 text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-5 py-4">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    order.isDelivered 
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  }`}>
                                    {order.isDelivered ? 'Delivered' : 'Pending'}
                                  </span>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <ProductsPanel onCountChange={setProductCount} />
          )}

          {activeTab === 'coupons' && (
            <CouponsPanel onCountChange={setCouponCount} />
          )}

          {activeTab === 'ai' && (
            <AdminChat fullHeight />
          )}
        </div>
      </main>
    </div>
  );
}
