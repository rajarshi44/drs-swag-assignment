"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { FiPlus, FiTrash2, FiPackage, FiEdit2 } from 'react-icons/fi';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

interface ProductsPanelProps {
  onCountChange?: (count: number) => void;
}

export default function ProductsPanel({ onCountChange }: ProductsPanelProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'Apparel',
    price: 0,
    stock: 0,
    image: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
      onCountChange?.(data.length);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-400">
        Loading products...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <FiPackage className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">Products</h3>
            <p className="text-sm text-zinc-500">{products.length} items</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddProduct(!showAddProduct)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <FiPlus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Add Product Form */}
      <AnimatePresence>
        {showAddProduct && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-zinc-100 dark:border-zinc-800 overflow-hidden"
          >
            <form onSubmit={handleAddProduct} className="p-5 bg-zinc-50 dark:bg-zinc-800/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                  className="col-span-full p-3 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  required
                  className="col-span-full p-3 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="p-3 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
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
                  className="p-3 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={productForm.stock || ''}
                  onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
                  required
                  min="0"
                  className="p-3 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
                <input
                  type="url"
                  placeholder="Image URL"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  required
                  className="p-3 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddProduct(false)}
                  className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                  Save Product
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <motion.div
              key={product._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  {product.name.substring(0, 2).toUpperCase()}
                </div>
                <button 
                  onClick={() => handleDeleteProduct(product._id)} 
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
              <h4 className="font-medium text-zinc-900 dark:text-white mb-1">{product.name}</h4>
              <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-purple-600 dark:text-purple-400">${product.price}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  product.stock > 10 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : product.stock > 0
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {product.stock} in stock
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
            <FiPackage className="w-12 h-12 mb-3" />
            <p>No products yet</p>
            <button 
              onClick={() => setShowAddProduct(true)}
              className="mt-3 text-purple-500 hover:underline text-sm"
            >
              Add your first product
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
