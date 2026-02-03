"use client";

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { FiPlus, FiTrash2, FiPackage, FiX, FiAlertCircle, FiUpload, FiImage, FiDollarSign, FiEdit2 } from 'react-icons/fi';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Variant {
  size: string;
  color: string;
  stock: number;
  sku: string;
  priceModifier: number;
}

interface TieredPrice {
  quantity: number;
  price: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  hasVariants: boolean;
  variants: Variant[];
  totalStock?: number;
  tieredPricing?: TieredPrice[];
}

interface ProductsPanelProps {
  onCountChange?: (count: number) => void;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'One Size'];
const CATEGORIES = ['Apparel', 'Electronics', 'Accessories', 'Office', 'Drinkware', 'Bags', 'Other'];

export default function ProductsPanel({ onCountChange }: ProductsPanelProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'Apparel',
    price: 0,
    stock: 0,
    image: '',
    hasVariants: false,
    variants: [] as Variant[],
    hasBulkPricing: false,
    tieredPricing: [] as TieredPrice[]
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!productForm.name.trim() || productForm.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!productForm.description.trim() || productForm.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    if (productForm.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (!productForm.image.trim()) {
      newErrors.image = 'Please upload an image or enter a URL';
    } else if (!/^https?:\/\/.+\..+/.test(productForm.image) && !/^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(productForm.image)) {
      newErrors.image = 'Invalid image format';
    }
    if (productForm.hasVariants && productForm.variants.length === 0) {
      newErrors.variants = 'Add at least one size variant';
    }
    if (!productForm.hasVariants && productForm.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    try {
      const payload = {
        ...productForm,
        stock: productForm.hasVariants ? 0 : productForm.stock,
        variants: productForm.hasVariants ? productForm.variants : [],
        tieredPricing: productForm.hasBulkPricing ? productForm.tieredPricing : []
      };
      
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        toast.success('Product added successfully!');
      }

      resetForm();
      setShowAddProduct(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock || 0,
      image: product.image,
      hasVariants: product.hasVariants,
      variants: product.variants || [],
      hasBulkPricing: !!(product.tieredPricing && product.tieredPricing.length > 0),
      tieredPricing: product.tieredPricing || []
    });
    setEditingId(product._id);
    setImagePreview(product.image);
    setShowAddProduct(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      category: 'Apparel',
      price: 0,
      stock: 0,
      image: '',
      hasVariants: false,
      variants: [],
      hasBulkPricing: false,
      tieredPricing: []
    });

    setErrors({});
    setImagePreview(null);
    setEditingId(null);
  };

  // Tiered Pricing helpers
  const addTier = () => {
    const lastTier = productForm.tieredPricing[productForm.tieredPricing.length - 1];
    const nextQty = lastTier ? lastTier.quantity + 10 : 10;
    const nextPrice = productForm.price * 0.9; // Default 10% discount
    
    setProductForm({
      ...productForm,
      tieredPricing: [
        ...productForm.tieredPricing,
        { quantity: nextQty, price: parseFloat(nextPrice.toFixed(2)) }
      ]
    });
  };

  const removeTier = (index: number) => {
    setProductForm({
      ...productForm,
      tieredPricing: productForm.tieredPricing.filter((_, i) => i !== index)
    });
  };

  const updateTier = (index: number, field: keyof TieredPrice, value: number) => {
    const updated = [...productForm.tieredPricing];
    updated[index] = { ...updated[index], [field]: value };
    setProductForm({ ...productForm, tieredPricing: updated });
  };

  // File to Base64 conversion
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setProductForm({ ...productForm, image: base64 });
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = () => {
    setProductForm({ ...productForm, image: '' });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const addVariant = () => {
    const existingSizes = productForm.variants.map(v => v.size);
    const nextSize = SIZES.find(s => !existingSizes.includes(s)) || 'M';
    
    setProductForm({
      ...productForm,
      variants: [
        ...productForm.variants,
        { size: nextSize, color: '', stock: 0, sku: '', priceModifier: 0 }
      ]
    });
  };

  const removeVariant = (index: number) => {
    setProductForm({
      ...productForm,
      variants: productForm.variants.filter((_, i) => i !== index)
    });
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const updated = [...productForm.variants];
    updated[index] = { ...updated[index], [field]: value };
    setProductForm({ ...productForm, variants: updated });
  };

  const getTotalVariantStock = () => {
    return productForm.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
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
          onClick={() => { setShowAddProduct(!showAddProduct); if (!showAddProduct) resetForm(); }}
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
            <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-zinc-900 dark:text-white">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h3>
             </div>
             <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Premium Developer Hoodie"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className={`w-full p-3 rounded-lg border ${errors.name ? 'border-red-500' : 'dark:border-zinc-700'} dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.name}</p>}
                </div>
                
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    placeholder="Detailed product description (min 10 characters)"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    rows={2}
                    className={`w-full p-3 rounded-lg border ${errors.description ? 'border-red-500' : 'dark:border-zinc-700'} dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none`}
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-3 rounded-lg border dark:border-zinc-700 dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Base Price ($) *
                  </label>
                  <input
                    type="number"
                    placeholder="29.99"
                    value={productForm.price || ''}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    min="0.01"
                    step="0.01"
                    className={`w-full p-3 rounded-lg border ${errors.price ? 'border-red-500' : 'dark:border-zinc-700'} dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all`}
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.price}</p>}
                </div>

                {/* Image Upload Section */}
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Product Image *
                  </label>
                  
                  {/* Image Preview or Upload Zone */}
                  {imagePreview || productForm.image ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                      <img 
                        src={imagePreview || productForm.image} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isDragging 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                          : errors.image 
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                            : 'border-zinc-300 dark:border-zinc-600 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/10'
                      }`}
                    >
                      <FiUpload className={`w-10 h-10 mb-3 ${isDragging ? 'text-purple-500' : 'text-zinc-400'}`} />
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                        {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  
                  {/* Or use URL */}
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                      <span className="text-xs text-zinc-400">or paste URL</span>
                      <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                    </div>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={productForm.image.startsWith('data:') ? '' : productForm.image}
                      onChange={(e) => {
                        setProductForm({ ...productForm, image: e.target.value });
                        setImagePreview(null);
                      }}
                      className="w-full p-2.5 rounded-lg border dark:border-zinc-700 dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
                    />
                  </div>
                  
                  {errors.image && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><FiAlertCircle /> {errors.image}</p>}
                </div>
              </div>

              {/* Variant Toggle */}
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-lg border dark:border-zinc-700">
                <input
                  type="checkbox"
                  id="hasVariants"
                  checked={productForm.hasVariants}
                  onChange={(e) => setProductForm({ ...productForm, hasVariants: e.target.checked, variants: e.target.checked ? [{ size: 'M', color: '', stock: 0, sku: '', priceModifier: 0 }] : [] })}
                  className="w-4 h-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="hasVariants" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  This product has size/color variants (e.g., T-Shirts, Hoodies)
                </label>
              </div>

              {/* Simple Stock (if no variants) */}
              {!productForm.hasVariants && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    value={productForm.stock || ''}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                    min="0"
                    className={`w-full md:w-1/2 p-3 rounded-lg border ${errors.stock ? 'border-red-500' : 'dark:border-zinc-700'} dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all`}
                  />
                  {errors.stock && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.stock}</p>}
                </div>
              )}

              {/* Variants Section */}
              {productForm.hasVariants && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Size Variants
                    </label>
                    <span className="text-sm text-zinc-500">
                      Total Stock: <span className="font-bold text-purple-600">{getTotalVariantStock()}</span>
                    </span>
                  </div>
                  
                  {errors.variants && <p className="text-red-500 text-xs flex items-center gap-1"><FiAlertCircle /> {errors.variants}</p>}
                  
                  <div className="space-y-2">
                    {productForm.variants.map((variant, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-white dark:bg-zinc-900 rounded-lg border dark:border-zinc-700">
                        <select
                          value={variant.size}
                          onChange={(e) => updateVariant(index, 'size', e.target.value)}
                          className="p-2 rounded-lg border dark:border-zinc-600 dark:bg-zinc-800 text-sm w-24"
                        >
                          {SIZES.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        
                        <input
                          type="text"
                          placeholder="Color (optional)"
                          value={variant.color}
                          onChange={(e) => updateVariant(index, 'color', e.target.value)}
                          className="flex-1 p-2 rounded-lg border dark:border-zinc-600 dark:bg-zinc-800 text-sm"
                        />
                        
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-zinc-500">Stock:</span>
                          <input
                            type="number"
                            value={variant.stock || ''}
                            onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-20 p-2 rounded-lg border dark:border-zinc-600 dark:bg-zinc-800 text-sm"
                          />
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    onClick={addVariant}
                    className="w-full py-2 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-500 hover:border-purple-500 hover:text-purple-500 transition-colors"
                  >
                    + Add Another Size
                  </button>
                </div>
              )}

              {/* Bulk Pricing Toggle */}
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-lg border dark:border-zinc-700">
                <input
                  type="checkbox"
                  id="hasBulkPricing"
                  checked={productForm.hasBulkPricing}
                  onChange={(e) => setProductForm({ 
                    ...productForm, 
                    hasBulkPricing: e.target.checked, 
                    tieredPricing: e.target.checked ? [{ quantity: 10, price: productForm.price * 0.9 }] : [] 
                  })}
                  className="w-4 h-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="hasBulkPricing" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Enable bulk/quantity discounts
                </label>
              </div>

              {/* Bulk Pricing Tiers */}
              {productForm.hasBulkPricing && (
                <div className="space-y-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiDollarSign className="w-4 h-4 text-amber-600" />
                      <label className="text-sm font-medium text-amber-800 dark:text-amber-400">
                        Bulk Pricing Tiers
                      </label>
                    </div>
                    <span className="text-xs text-amber-600 dark:text-amber-500">
                      Customers get discounts when buying more
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {productForm.tieredPricing.map((tier, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-lg border dark:border-zinc-700">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500 whitespace-nowrap">Buy</span>
                          <input
                            type="number"
                            value={tier.quantity || ''}
                            onChange={(e) => updateTier(index, 'quantity', parseInt(e.target.value) || 0)}
                            min="2"
                            className="w-20 p-2 rounded-lg border dark:border-zinc-600 dark:bg-zinc-800 text-sm text-center"
                          />
                          <span className="text-xs text-zinc-500 whitespace-nowrap">or more →</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500">$</span>
                          <input
                            type="number"
                            value={tier.price || ''}
                            onChange={(e) => updateTier(index, 'price', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-24 p-2 rounded-lg border dark:border-zinc-600 dark:bg-zinc-800 text-sm"
                          />
                          <span className="text-xs text-zinc-500">each</span>
                        </div>
                        
                        {tier.price < productForm.price && (
                          <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
                            {Math.round((1 - tier.price / productForm.price) * 100)}% off
                          </span>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => removeTier(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg ml-auto"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    onClick={addTier}
                    className="w-full py-2 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-lg text-sm text-amber-600 dark:text-amber-500 hover:border-amber-500 hover:text-amber-700 transition-colors"
                  >
                    + Add Another Tier
                  </button>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setShowAddProduct(false); resetForm(); }}
                  className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                  Save Product
                </button>
              </div>
            </form>
            </div>
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
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    {product.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  {product.hasVariants && (
                    <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded">
                      {product.variants?.length || 0} sizes
                    </span>
                  )}
                  <button 
                    onClick={() => handleEditProduct(product)} 
                    className="p-2 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product._id)} 
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h4 className="font-medium text-zinc-900 dark:text-white mb-1">{product.name}</h4>
              <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{product.description}</p>
              
              {/* Variants preview */}
              {product.hasVariants && product.variants && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.variants.slice(0, 4).map((v, i) => (
                    <span key={i} className="text-xs bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded">
                      {v.size}{v.color ? ` / ${v.color}` : ''}
                    </span>
                  ))}
                  {product.variants.length > 4 && (
                    <span className="text-xs text-zinc-500">+{product.variants.length - 4} more</span>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-purple-600 dark:text-purple-400">${product.price}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  (product.totalStock || product.stock) > 10 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : (product.totalStock || product.stock) > 0
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {product.totalStock || product.stock} in stock
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
