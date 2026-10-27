import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, ChevronRight, Truck, MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import api from '../services/api.js';
import { LoadingSpinner, EmptyState } from '../components/UI.jsx';
import ImageWithFallback from '../components/ImageWithFallback.jsx';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data.data.order);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!order) return <EmptyState title="Order Not Found" message="This order doesn't exist." />;

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="page-enter">
      <div className="bg-cream py-6">
        <div className="container">
          <div className="flex items-center gap-2 text-xs text-taupe mb-3">
            <Link to="/orders" className="hover:text-brown flex items-center gap-1"><ArrowLeft size={12} /> My Orders</Link>
            <ChevronRight size={12} />
            <span className="text-brown font-medium">#{order._id.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="font-serif text-2xl font-bold text-brown">Order Details</h1>
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Order Progress */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-xl border border-cream p-6 mb-8">
            <h3 className="text-sm font-semibold text-brown mb-5">Order Progress</h3>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-cream" />
              <div className="absolute top-4 left-0 h-0.5 bg-green-500 transition-all" style={{ width: `${Math.max(0, currentStepIndex) / (statusSteps.length - 1) * 100}%` }} />
              {statusSteps.map((s, i) => (
                <div key={s} className="relative flex flex-col items-center z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= currentStepIndex ? 'bg-green-500 text-white' : 'bg-cream text-taupe'}`}>
                    {i <= currentStepIndex ? '✓' : i + 1}
                  </div>
                  <span className="text-xs text-taupe mt-2 capitalize">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-cream p-6">
              <h3 className="font-serif text-lg font-bold text-brown mb-5 flex items-center gap-2"><Package size={18} /> Items ({order.items?.length})</h3>
              <div className="space-y-4">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex gap-4 pb-4 border-b border-cream last:border-0 last:pb-0">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-cream shrink-0">
                      <ImageWithFallback src={item.product?.images?.[0]?.url || ''} alt={item.product?.title || ''} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <Link to={`/product/${item.product?.slug}`} className="text-sm font-semibold text-brown hover:text-rose transition-colors">
                        {item.product?.title || 'Product'}
                      </Link>
                      <p className="text-xs text-taupe mt-1">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-brown mt-1">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl border border-cream p-5">
              <h3 className="text-sm font-semibold text-brown mb-3 flex items-center gap-2"><MapPin size={14} /> Delivery Address</h3>
              <p className="text-sm text-brown">{order.shippingAddress?.fullName}</p>
              <p className="text-xs text-taupe mt-1">
                {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
              {order.shippingAddress?.phone && <p className="text-xs text-taupe mt-1">📞 {order.shippingAddress.phone}</p>}
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl border border-cream p-5">
              <h3 className="text-sm font-semibold text-brown mb-3 flex items-center gap-2"><CreditCard size={14} /> Payment</h3>
              <p className="text-sm text-brown capitalize">{order.paymentMethod?.replace('_', ' ')}</p>
              <p className="text-xs text-taupe mt-1 capitalize">Status: {order.paymentStatus}</p>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl border border-cream p-5">
              <h3 className="text-sm font-semibold text-brown mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-taupe">Subtotal</span><span className="text-brown">₹{order.subtotal}</span></div>
                {order.discount > 0 && <div className="flex justify-between"><span className="text-green-700">Discount</span><span className="text-green-700">-₹{order.discount}</span></div>}
                <div className="flex justify-between"><span className="text-taupe">Shipping</span><span className="text-brown">{order.shippingFee === 0 ? 'Free' : `₹${order.shippingFee}`}</span></div>
                <div className="flex justify-between pt-3 border-t border-cream">
                  <span className="font-semibold text-brown">Total</span>
                  <span className="text-lg font-bold text-brown">₹{order.total}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-taupe text-center">Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
