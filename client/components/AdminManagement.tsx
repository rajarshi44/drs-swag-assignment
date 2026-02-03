"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { FiPlus, FiTrash2, FiPackage, FiTag, FiPercent, FiDollarSign } from 'react-icons/fi';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

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

export default function AdminManagement() {
  const [activeTab, setActiveTab] = useState<'products' | 'coupons'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCoupon, setShowAddCoupon] = useState(false);

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'Apparel',
    price: 0,
    stock: 0,
    image: ''
  });

  // Coupon Form State
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: 0,
    expirationDate: '',
    usageLimit: 0,
    isActive: true
  });

  useEffect(() => {
    fetchProducts();
    fetchCoupons();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data);
    } catch (error) {
      console.error('Failed to fetch coupons', error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', productForm);
      toast.success('Product added successfully!');
      setProductForm({ name: '', description: '', category: 'Apparel', price: 0, stock: 0, image: '' });
      setShowAddProduct(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add product');
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

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
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

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-zinc-100 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-4 px-6 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'products'
              ? 'bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border-b-2 border-purple-500'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <FiPackage /> Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex-1 py-4 px-6 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'coupons'
              ? 'bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border-b-2 border-purple-500'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <FiTag /> Coupons ({coupons.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Manage Products</h3>
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <FiPlus /> Add Product
              </button>
            </div>

            {/* Add Product Form */}
            {showAddProduct && (
              <form onSubmit={handleAddProduct} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                    className="col-span-2 p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    required
                    className="col-span-2 p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700"
                  />
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700"
                  >
                    <option>Apparel</option>
                    <option>Electronics</option>
                    <option>Accessories</option>
                    <option>Office</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Price"
                    value={productForm.price || ''}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                    className="p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={productForm.stock || ''}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
                    required
                    min="0"
                    className="p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700"
                  />
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    required
                    className="p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                  Save Product
                </button>
              </form>
            )}

            {/* Products List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {products.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold">
                      {product.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">{product.name}</p>
                      <p className="text-xs text-zinc-500">{product.category} • ${product.price} • {product.stock} in stock</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteProduct(product._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Manage Coupons</h3>
              <button
                onClick={() => setShowAddCoupon(!showAddCoupon)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <FiPlus /> Add Coupon
              </button>
            </div>

            {/* Add Coupon Form */}
            {showAddCoupon && (
              <form onSubmit={handleAddCoupon} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Coupon Code (e.g., SAVE20)"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    required
                    className="col-span-2 p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700 uppercase"
                  />
                  <select
                    value={couponForm.type}
                    onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value as 'percent' | 'fixed' })}
                    className="p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700"
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
                    className="p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700"
                  />
                  <input
                    type="date"
                    value={couponForm.expirationDate}
                    onChange={(e) => setCouponForm({ ...couponForm, expirationDate: e.target.value })}
                    required
                    className="p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700"
                  />
                  <input
                    type="number"
                    placeholder="Usage Limit (0 = unlimited)"
                    value={couponForm.usageLimit || ''}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                  Create Coupon
                </button>
              </form>
            )}

            {/* Coupons List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {coupons.map((coupon) => {
                const isExpired = new Date(coupon.expirationDate) < new Date();
                const isFree = coupon.type === 'fixed' && coupon.value >= 1000; // Assume $1000+ is "free"
                
                return (
                  <div key={coupon._id} className={`flex items-center justify-between p-3 rounded-lg ${isExpired ? 'bg-red-50 dark:bg-red-900/20' : 'bg-zinc-50 dark:bg-zinc-800/50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${coupon.type === 'percent' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {coupon.type === 'percent' ? <FiPercent /> : <FiDollarSign />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold text-zinc-900 dark:text-white">{coupon.code}</p>
                          {isExpired && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">EXPIRED</span>}
                          {isFree && <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded">FREE ITEM</span>}
                        </div>
                        <p className="text-xs text-zinc-500">
                          {coupon.type === 'percent' ? `${coupon.value}% off` : `$${coupon.value} off`}
                          {' • '}
                          {coupon.usageLimit ? `${coupon.usedCount}/${coupon.usageLimit} used` : 'Unlimited'}
                          {' • '}
                          Expires {new Date(coupon.expirationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteCoupon(coupon._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <FiTrash2 />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
