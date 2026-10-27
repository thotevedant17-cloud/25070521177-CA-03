import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, MapPin, Package, Heart, Settings, LogOut, Edit2, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api from '../services/api.js';

export default function DashboardPage() {
  const { user, logout, updateUser } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders') {
      api.get('/orders').then(res => setOrders(res.data.data.orders)).catch(() => {});
    }
  }, [activeTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put('/auth/profile', profileForm);
      updateUser(res.data.data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      const res = await api.delete(`/auth/addresses/${addrId}`);
      updateUser(res.data.data.user);
      toast.success('Address removed');
    } catch {
      toast.error('Failed to remove address');
    }
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'orders', icon: Package, label: 'Orders' },
    { id: 'addresses', icon: MapPin, label: 'Addresses' },
    { id: 'security', icon: Settings, label: 'Security' },
  ];

  return (
    <div className="page-enter">
      <div className="bg-cream py-6">
        <div className="container">
          <h1 className="font-serif text-3xl font-bold text-brown">My Dashboard</h1>
          <p className="text-taupe text-sm mt-1">Welcome back, {user?.name}</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-cream p-4 sticky top-24">
              <div className="text-center pb-4 mb-4 border-b border-cream">
                <div className="w-16 h-16 rounded-full bg-rose-light flex items-center justify-center mx-auto mb-3">
                  <span className="font-serif text-2xl font-bold text-rose">{user?.name?.[0]?.toUpperCase()}</span>
                </div>
                <p className="font-semibold text-brown text-sm">{user?.name}</p>
                <p className="text-xs text-taupe">{user?.email}</p>
              </div>
              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id ? 'bg-rose-light text-brown' : 'text-taupe hover:bg-cream hover:text-brown'
                    }`}
                  >
                    <tab.icon size={16} /> {tab.label}
                  </button>
                ))}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl border border-cream p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl font-bold text-brown">Profile Information</h2>
                  <button onClick={() => setEditing(!editing)} className="btn btn-secondary btn-sm">
                    <Edit2 size={14} /> {editing ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                {editing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                    <div>
                      <label className="form-label">Name</label>
                      <input className="form-input" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} required />
                    </div>
                    <div>
                      <label className="form-label">Email</label>
                      <input type="email" className="form-input" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} required />
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary btn-sm">Save Changes</button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3"><User size={16} className="text-taupe" /><div><p className="text-xs text-taupe">Name</p><p className="text-sm font-medium text-brown">{user?.name}</p></div></div>
                    <div className="flex items-center gap-3"><Mail size={16} className="text-taupe" /><div><p className="text-xs text-taupe">Email</p><p className="text-sm font-medium text-brown">{user?.email}</p></div></div>
                    <div className="flex items-center gap-3"><Package size={16} className="text-taupe" /><div><p className="text-xs text-taupe">Role</p><p className="text-sm font-medium text-brown capitalize">{user?.role}</p></div></div>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="animate-fade-in">
                <h2 className="font-serif text-xl font-bold text-brown mb-5">Recent Orders</h2>
                {orders.length === 0 ? (
                  <div className="bg-white rounded-xl border border-cream p-8 text-center">
                    <Package size={40} className="mx-auto text-taupe/50 mb-3" />
                    <p className="text-taupe text-sm">No orders yet</p>
                    <Link to="/shop" className="btn btn-primary btn-sm mt-4">Shop Now</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map(order => (
                      <Link key={order._id} to={`/orders/${order._id}`} className="block bg-white rounded-xl border border-cream p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-brown">#{order._id.slice(-8).toUpperCase()}</p>
                            <p className="text-xs text-taupe">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-brown">₹{order.total}</p>
                            <span className="text-xs capitalize text-taupe">{order.status}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                    <Link to="/orders" className="block text-center text-sm text-rose font-medium hover:underline mt-3">View All Orders →</Link>
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-serif text-xl font-bold text-brown">Saved Addresses</h2>
                  <Link to="/checkout" className="btn btn-primary btn-sm"><Plus size={14} /> Add New</Link>
                </div>
                {(!user?.addresses || user.addresses.length === 0) ? (
                  <div className="bg-white rounded-xl border border-cream p-8 text-center">
                    <MapPin size={40} className="mx-auto text-taupe/50 mb-3" />
                    <p className="text-taupe text-sm">No addresses saved yet</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {user.addresses.map(addr => (
                      <div key={addr._id} className="bg-white rounded-xl border border-cream p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-brown">{addr.fullName}</p>
                            <p className="text-xs text-taupe mt-1">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                            <p className="text-xs text-taupe">{addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-xs text-taupe mt-1">📞 {addr.phone}</p>
                            {addr.isDefault && <span className="inline-block mt-2 text-xs font-medium text-rose bg-rose-light/50 px-2 py-0.5 rounded-full">Default</span>}
                          </div>
                          <button onClick={() => handleDeleteAddress(addr._id)} className="text-taupe hover:text-red-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-xl border border-cream p-6 animate-fade-in">
                <h2 className="font-serif text-xl font-bold text-brown mb-5">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-input" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} required />
                  </div>
                  <div>
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-input" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} required minLength={8} />
                  </div>
                  <div>
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-input" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} required />
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary btn-sm">Update Password</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
