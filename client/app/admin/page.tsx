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
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';

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
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

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
        pendingOrders: ordersRes.data.filter((o: any) => o.status === 'pending').length
      });
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      
      const updatedOrders = orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o);
      setOrders(updatedOrders);
      
      // Update stats based on the new local state
      const totalRevenue = updatedOrders.reduce((acc: number, o: any) => acc + o.finalAmount, 0);
      setStats({
        revenue: totalRevenue,
        totalOrders: updatedOrders.length,
        pendingOrders: updatedOrders.filter((o: any) => o.status === 'pending').length
      });
      
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update order status');
    }
  };

  if (isLoading || !user || user.role !== 'admin') {
      return <div className="min-h-screen flex items-center justify-center text-zinc-500">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-[#050505] font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Admin Dashboard</h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xl">Monitor your store's performance, manage inventory, and get AI-powered insights.</p>
          </div>
          
          {/* Tab Navigation - Moved to right for desktop */}
          <div className="bg-white dark:bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex gap-1 shadow-sm backdrop-blur-sm">
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
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all outline-none ${
                    isActive
                      ? 'text-white'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-zinc-900 dark:bg-zinc-700 rounded-lg shadow-md"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-50 dark:text-white' : ''}`} />
                    {tab.label}
                    {count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div 
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 min-h-0"
        >
          {activeTab === 'overview' && (
            <div className="space-y-6 h-full">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm backdrop-blur-xl relative overflow-hidden group"
                >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-50 group-hover:opacity-100"></div>
                   <div className="relative">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="p-3.5 bg-green-500/10 rounded-2xl text-green-600 dark:text-green-400">
                           <FiDollarSign className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Revenue</p>
                     </div>
                     <p className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">${stats.revenue.toFixed(2)}</p>
                     <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">+12% from last month</div>
                   </div>
                </motion.div>

                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 }}
                   className="bg-white dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm backdrop-blur-xl relative overflow-hidden group"
                >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-50 group-hover:opacity-100"></div>
                   <div className="relative">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="p-3.5 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
                           <FiShoppingCart className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Orders</p>
                     </div>
                     <p className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">{stats.totalOrders}</p>
                     <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">{stats.totalOrders > 0 ? 'Active sales today' : 'No orders today'}</div>
                   </div>
                </motion.div>

                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 }}
                   className="bg-white dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm backdrop-blur-xl relative overflow-hidden group"
                >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-50 group-hover:opacity-100"></div>
                   <div className="relative">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="p-3.5 bg-orange-500/10 rounded-2xl text-orange-600 dark:text-orange-400">
                           <FiPackage className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Pending Orders</p>
                     </div>
                     <p className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">{stats.pendingOrders}</p>
                     <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 font-medium">Requires attention</div>
                   </div>
                </motion.div>
              </div>

              {/* Recent Orders */}
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.4 }}
                 className="bg-white dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm overflow-hidden flex flex-col flex-1"
              >
                 <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Recent Orders</h3>
                      <p className="text-sm text-zinc-500 mt-1">Manage and track recent customer purchases.</p>
                    </div>
                    <button className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">View All</button>
                 </div>
                 <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left text-sm">
                       <thead className="bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400 font-medium sticky top-0 backdrop-blur-sm">
                          <tr>
                             <th className="px-6 py-4">Order ID</th>
                             <th className="px-6 py-4">Customer</th>
                             <th className="px-6 py-4">Total</th>
                             <th className="px-6 py-4">Date</th>
                             <th className="px-6 py-4">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                          {orders.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-400">No orders found</td></tr>
                          ) : orders.slice(0, 10).map((order) => (
                             <tr 
                                key={order._id} 
                                onClick={() => {
                                    setSelectedOrder(order);
                                    setIsOrderModalOpen(true);
                                }}
                                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                             >
                                <td className="px-6 py-4 font-mono text-zinc-500 text-xs">#{order._id.substring(0,8)}...</td>
                                <td className="px-6 py-4">
                                  <div className="font-medium text-zinc-900 dark:text-zinc-100">{order.customerInfo?.name || 'Guest'}</div>
                                  <div className="text-xs text-zinc-500">{order.customerInfo?.email}</div>
                                </td>
                                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">${order.finalAmount.toFixed(2)}</td>
                                <td className="px-6 py-4 text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                  <div 
                                      onClick={(e) => e.stopPropagation()} 
                                      className="inline-block"
                                  >
                                    <select
                                      value={order.status === 'completed' ? 'fulfilled' : order.status}
                                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                      className={`text-xs px-3 py-1.5 rounded-full border-none focus:ring-2 focus:ring-offset-1 cursor-pointer appearance-none font-medium transition-all ${
                                        (order.status === 'fulfilled' || order.status === 'completed')
                                          ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 focus:ring-green-500/20'
                                          : order.status === 'cancelled'
                                          ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 focus:ring-red-500/20'
                                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 focus:ring-yellow-500/20'
                                      }`}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="fulfilled">Fulfilled</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                  </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
              
              <OrderDetailsModal 
                isOpen={isOrderModalOpen} 
                onClose={() => setIsOrderModalOpen(false)} 
                order={selectedOrder} 
                onStatusChange={(newStatus) => {
                    handleStatusChange(selectedOrder._id, newStatus);
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                }}
              />
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
        </motion.div>
      </main>
    </div>
  );
}
