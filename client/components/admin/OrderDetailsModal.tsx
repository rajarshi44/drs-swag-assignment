import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPackage, FiUser, FiMapPin, FiCalendar, FiCreditCard } from 'react-icons/fi';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function OrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto overflow-x-hidden flex items-center justify-center p-4"
          >
           {/* Modal Container to fix scrolling issues if content is long */}
           <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0 w-full" onClick={(e) => e.stopPropagation()}> 
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 text-left align-middle shadow-xl transition-all border border-zinc-200 dark:border-zinc-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className='flex flex-col gap-1'>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                    <FiPackage className="text-zinc-500" />
                    Order Details
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">ID: {order._id}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                
                {/* Status & Date Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm text-zinc-500">
                            <FiCalendar className="w-5 h-5"/>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Date Placed</p>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {new Date(order.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm text-zinc-500">
                            <FiCreditCard className="w-5 h-5"/>
                        </div>
                        <div>
                             <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Total Amount</p>
                             <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                ${order.finalAmount.toFixed(2)}
                             </p>
                        </div>
                    </div>

                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide
                        ${order.status === 'fulfilled' || order.status === 'completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                    >
                        {order.status || (order.isDelivered ? 'Delivered' : 'Pending')}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Customer Info */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                            <FiUser className="w-4 h-4" /> Customer Information
                        </h4>
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">{order.customerInfo.name}</p>
                            <p className="text-sm text-zinc-500">{order.customerInfo.email}</p>
                        </div>
                    </div>
                    
                    {/* Shipping Info */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                             <FiMapPin className="w-4 h-4" /> Shipping Address
                        </h4>
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <p className="text-sm text-zinc-600 dark:text-zinc-300">
                                {order.customerInfo.address}<br/>
                                {order.customerInfo.city} {order.customerInfo.zip}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                    <FiShoppingCartIcon className="w-4 h-4" /> Order Items ({order.items.length})
                </h4>
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden mb-6">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-4 py-3 font-medium">Product</th>
                                <th className="px-4 py-3 font-medium text-center">Unit Price</th>
                                <th className="px-4 py-3 font-medium text-center">Qty</th>
                                <th className="px-4 py-3 font-medium text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {order.items.map((item: any, i: number) => (
                                <tr key={i}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {item.product?.image && (
                                                <img src={item.product.image} alt="" className="w-10 h-10 rounded-md object-cover bg-zinc-100" />
                                            )}
                                            <div>
                                                <p className="font-medium text-zinc-900 dark:text-white truncate max-w-[200px]">
                                                    {item.product?.name || 'Unknown Product'}
                                                </p>
                                                <p className="text-xs text-zinc-500">
                                                    ID: {item.product?._id?.substring(0,6) || '...'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">
                                        ${item.priceAtPurchase.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-center text-zinc-900 dark:text-white font-medium">
                                        x{item.quantity}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-white">
                                        ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pricing Summary */}
                <div className="flex justify-end">
                    <div className="w-full sm:w-1/2 space-y-3">
                        <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                            <span>Subtotal</span>
                            <span>${(order.originalAmount || 0).toFixed(2)}</span>
                        </div>
                        {order.discountAmount > 0 && (
                             <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                <span>Discount</span>
                                <span>- ${order.discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <span className="font-semibold text-zinc-900 dark:text-white">Total Paid</span>
                            <span className="text-xl font-bold text-zinc-900 dark:text-white">${order.finalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

              </div>
            </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FiShoppingCartIcon({className}: {className?: string}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
    )
}
