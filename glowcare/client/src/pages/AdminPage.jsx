import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingCart, Tag, BarChart3, Plus, Edit2, Trash2, Eye, Search } from 'lucide-react';
import api from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { LoadingSpinner } from '../components/UI.jsx';

function AdminSidebar() {
  const location = useLocation();
  const links = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/categories', icon: Tag, label: 'Categories' },
  ];

  return (
    <div className="w-56 shrink-0 hidden lg:block">
      <div className="bg-white rounded-xl border border-cream p-3 sticky top-24">
        <div className="px-3 py-2 mb-2">
          <p className="font-serif text-lg font-bold text-brown">Admin Panel</p>
        </div>
        <nav className="space-y-0.5">
          {links.map(link => {
            const active = link.exact ? location.pathname === link.path : location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-rose-light text-brown' : 'text-taupe hover:bg-cream hover:text-brown'
                }`}
              >
                <link.icon size={16} /> {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.data);
      } catch {
        setStats({ totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0, recentOrders: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-2xl font-bold text-brown mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats?.stats?.totalCustomers || 0, icon: Users, color: 'bg-blue-100 text-blue-700' },
          { label: 'Total Products', value: stats?.stats?.totalProducts || 0, icon: Package, color: 'bg-green-100 text-green-700' },
          { label: 'Total Orders', value: stats?.stats?.totalOrders || 0, icon: ShoppingCart, color: 'bg-purple-100 text-purple-700' },
          { label: 'Revenue', value: `₹${stats?.stats?.revenue || 0}`, icon: BarChart3, color: 'bg-amber-100 text-amber-700' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-cream p-5">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-brown">{stat.value}</p>
            <p className="text-xs text-taupe mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <h3 className="font-semibold text-brown mb-4">Recent Orders</h3>
      <div className="bg-white rounded-xl border border-cream overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cream bg-cream/50">
              <th className="text-left px-4 py-3 font-semibold text-brown">Order ID</th>
              <th className="text-left px-4 py-3 font-semibold text-brown">Customer</th>
              <th className="text-left px-4 py-3 font-semibold text-brown">Total</th>
              <th className="text-left px-4 py-3 font-semibold text-brown">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-brown">Date</th>
            </tr>
          </thead>
          <tbody>
            {(stats?.recentOrders || []).slice(0, 10).map(order => (
              <tr key={order._id} className="border-b border-cream/50 hover:bg-cream/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">#{order._id?.slice(-8).toUpperCase()}</td>
                <td className="px-4 py-3">{order.user?.name || 'N/A'}</td>
                <td className="px-4 py-3 font-semibold">₹{order.total}</td>
                <td className="px-4 py-3"><span className="capitalize text-xs font-medium">{order.status}</span></td>
                <td className="px-4 py-3 text-taupe">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
          <p className="text-center py-6 text-taupe text-sm">No orders yet</p>
        )}
      </div>
    </div>
  );
}

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/products', { params: { limit: 50 } });
      setProducts(res.data.data.products);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-brown">Products</h2>
        <span className="text-sm text-taupe">{products.length} products</span>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="form-input pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-cream overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cream bg-cream/50">
              <th className="text-left px-4 py-3 font-semibold text-brown">Product</th>
              <th className="text-left px-4 py-3 font-semibold text-brown">Price</th>
              <th className="text-left px-4 py-3 font-semibold text-brown">Stock</th>
              <th className="text-left px-4 py-3 font-semibold text-brown">Rating</th>
              <th className="text-left px-4 py-3 font-semibold text-brown">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(product => (
              <tr key={product._id} className="border-b border-cream/50 hover:bg-cream/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-cream overflow-hidden shrink-0">
                      <img src={product.images?.[0]?.url || ''} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-medium truncate max-w-48">{product.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3">₹{product.discountPrice || product.price}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${product.stock === 0 ? 'text-red-600' : product.stock <= 5 ? 'text-amber-600' : 'text-green-600'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3">{product.rating || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link to={`/product/${product.slug}`} className="text-taupe hover:text-brown"><Eye size={14} /></Link>
                    <button onClick={() => handleDelete(product._id)} className="text-taupe hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-6 text-taupe text-sm">No products found</p>}
      </div>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.data.orders);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-2xl font-bold text-brown mb-6">Orders</h2>
      <div className="bg-white rounded-xl border border-cream overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cream bg-cream/50">
              <th className="text-left px-4 py-3 font-semibold text-brown">Order ID</th>
              <th className="text-left px-4 py-3 font-semibold text-brown">Customer</th>
              <th className="text-left px-4 py-3 font-semibold text-brown">Items</th>
              <th className="text-left px-4 py-3 font-semibold text-brown">Total</th>
              <th className="text-left px-4 py-3 font-semibold text-brown">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-brown">Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} className="border-b border-cream/50 hover:bg-cream/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">#{order._id?.slice(-8).toUpperCase()}</td>
                <td className="px-4 py-3">{order.user?.name || 'N/A'}</td>
                <td className="px-4 py-3">{order.items?.length || 0}</td>
                <td className="px-4 py-3 font-semibold">₹{order.total}</td>
                <td className="px-4 py-3 capitalize text-xs">{order.status}</td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order._id, e.target.value)}
                    className="form-input py-1 px-2 text-xs w-32"
                  >
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center py-6 text-taupe text-sm">No orders</p>}
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data.data.users);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-2xl font-bold text-brown mb-6">Users</h2>
      <div className="bg-white rounded-xl border border-cream overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cream bg-cream/50">
              <th className="text-left px-4 py-3 font-semibold text-brown">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-brown">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-brown">Role</th>
              <th className="text-left px-4 py-3 font-semibold text-brown">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-b border-cream/50 hover:bg-cream/30 transition-colors">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-taupe">{u.email}</td>
                <td className="px-4 py-3"><span className={`capitalize text-xs font-medium ${u.role === 'admin' ? 'text-rose' : ''}`}>{u.role}</span></td>
                <td className="px-4 py-3 text-taupe">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center py-6 text-taupe text-sm">No users</p>}
      </div>
    </div>
  );
}

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data.categories);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-2xl font-bold text-brown mb-6">Categories</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat._id} className="bg-white rounded-xl border border-cream p-4">
            <div className="flex items-center gap-3">
              {cat.image && (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream shrink-0">
                  <img src={cat.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <p className="font-semibold text-brown text-sm">{cat.name}</p>
                <p className="text-xs text-taupe capitalize">{cat.parentCategory}</p>
              </div>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="text-taupe text-sm">No categories</p>}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="page-enter">
      <div className="bg-cream py-4">
        <div className="container">
          <p className="text-xs text-taupe">Admin Panel</p>
        </div>
      </div>
      <div className="container py-6">
        <div className="flex gap-8">
          <AdminSidebar />
          <div className="flex-1 min-w-0">
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}
