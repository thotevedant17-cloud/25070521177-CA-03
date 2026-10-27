import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Eye } from 'lucide-react';
import api from '../services/api.js';
import { EmptyState, LoadingSpinner } from '../components/UI.jsx';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.data.orders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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

  if (orders.length === 0) {
    return (
      <div className="page-enter container py-16">
        <EmptyState
          icon={Package}
          title="No Orders Yet"
          message="When you place an order, it will appear here."
          action={<Link to="/shop" className="btn btn-primary">Start Shopping</Link>}
        />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="bg-cream py-6">
        <div className="container">
          <h1 className="font-serif text-3xl font-bold text-brown">My Orders</h1>
          <p className="text-taupe text-sm mt-1">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="space-y-4">
          {orders.map(order => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block bg-white rounded-xl border border-cream p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-brown">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-taupe">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <Eye size={16} className="text-taupe group-hover:text-rose transition-colors" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {order.items?.slice(0, 3).map((item, i) => (
                      <div key={i} className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden bg-cream">
                        <img src={item.product?.images?.[0]?.url || ''} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <div className="w-10 h-10 rounded-lg border-2 border-white bg-cream flex items-center justify-center text-xs font-medium text-taupe">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-taupe">{order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}</span>
                </div>
                <p className="text-lg font-bold text-brown">₹{order.total}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
