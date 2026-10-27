import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Truck, ChevronRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api from '../services/api.js';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (user?.addresses) {
      setAddresses(user.addresses);
      const defaultAddr = user.addresses.find(a => a.isDefault);
      if (defaultAddr) setSelectedAddress(defaultAddr._id);
    }
  }, [user]);

  const handleAddAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      const res = await api.post('/auth/addresses', newAddress);
      const updatedUser = res.data.data.user;
      setAddresses(updatedUser.addresses);
      setSelectedAddress(updatedUser.addresses[updatedUser.addresses.length - 1]._id);
      setNewAddress({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', isDefault: false });
      toast.success('Address added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    try {
      setLoading(true);
      const res = await api.post('/orders', {
        shippingAddressId: selectedAddress,
        paymentMethod,
      });
      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${res.data.data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="page-enter container py-16 text-center">
        <h2 className="font-serif text-2xl font-bold text-brown mb-3">Your cart is empty</h2>
        <p className="text-taupe mb-6">Add some items before checkout.</p>
        <button onClick={() => navigate('/shop')} className="btn btn-primary">Browse Products</button>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="bg-cream py-6">
        <div className="container">
          <h1 className="font-serif text-3xl font-bold text-brown">Checkout</h1>
          {/* Steps */}
          <div className="flex items-center gap-3 mt-4">
            {['Address', 'Payment', 'Review'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > i + 1 ? 'bg-green-600 text-white' : step === i + 1 ? 'bg-brown text-white' : 'bg-cream border border-taupe/30 text-taupe'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-sm font-medium ${step >= i + 1 ? 'text-brown' : 'text-taupe'}`}>{s}</span>
                {i < 2 && <ChevronRight size={14} className="text-taupe" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="font-serif text-xl font-bold text-brown mb-5 flex items-center gap-2"><MapPin size={20} /> Delivery Address</h2>

                {addresses.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {addresses.map(addr => (
                      <label key={addr._id} className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress === addr._id ? 'border-rose bg-rose-light/30' : 'border-cream bg-white hover:border-blush'}`}>
                        <input type="radio" name="address" value={addr._id} checked={selectedAddress === addr._id} onChange={() => setSelectedAddress(addr._id)} className="hidden" />
                        <p className="font-semibold text-brown text-sm">{addr.fullName}</p>
                        <p className="text-sm text-taupe mt-1">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                        <p className="text-sm text-taupe">{addr.city}, {addr.state} - {addr.postalCode}</p>
                        <p className="text-xs text-taupe mt-1">📞 {addr.phone}</p>
                        {addr.isDefault && <span className="inline-block mt-2 text-xs font-medium text-rose">Default Address</span>}
                      </label>
                    ))}
                  </div>
                )}

                {/* Add new address */}
                <div className="bg-white rounded-xl border border-cream p-5">
                  <h3 className="font-semibold text-brown text-sm mb-4">Add New Address</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Full Name *</label>
                      <input className="form-input" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} />
                    </div>
                    <div>
                      <label className="form-label">Phone *</label>
                      <input className="form-input" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="form-label">Address Line 1 *</label>
                      <input className="form-input" value={newAddress.addressLine1} onChange={e => setNewAddress({...newAddress, addressLine1: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="form-label">Address Line 2</label>
                      <input className="form-input" value={newAddress.addressLine2} onChange={e => setNewAddress({...newAddress, addressLine2: e.target.value})} />
                    </div>
                    <div>
                      <label className="form-label">City *</label>
                      <input className="form-input" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                    </div>
                    <div>
                      <label className="form-label">State *</label>
                      <input className="form-input" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                    </div>
                    <div>
                      <label className="form-label">Postal Code *</label>
                      <input className="form-input" value={newAddress.postalCode} onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})} />
                    </div>
                  </div>
                  <button onClick={handleAddAddress} className="btn btn-secondary btn-sm mt-4">Save Address</button>
                </div>

                <div className="flex justify-end mt-6">
                  <button onClick={() => { if (!selectedAddress) { toast.error('Please select an address'); return; } setStep(2); }} className="btn btn-primary">
                    Continue to Payment <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="animate-fade-in">
                <h2 className="font-serif text-xl font-bold text-brown mb-5 flex items-center gap-2"><CreditCard size={20} /> Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
                    { id: 'card', label: 'Credit/Debit Card', desc: 'Pay securely online (demo)' },
                    { id: 'upi', label: 'UPI', desc: 'Pay via UPI (demo)' },
                  ].map(method => (
                    <label key={method.id} className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? 'border-rose bg-rose-light/30' : 'border-cream bg-white hover:border-blush'}`}>
                      <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="hidden" />
                      <p className="font-semibold text-brown text-sm">{method.label}</p>
                      <p className="text-xs text-taupe mt-0.5">{method.desc}</p>
                    </label>
                  ))}
                </div>
                <div className="flex justify-between mt-6">
                  <button onClick={() => setStep(1)} className="btn btn-secondary"><ArrowLeft size={16} /> Back</button>
                  <button onClick={() => setStep(3)} className="btn btn-primary">Review Order <ChevronRight size={16} /></button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="font-serif text-xl font-bold text-brown mb-5 flex items-center gap-2"><ShieldCheck size={20} /> Review & Place Order</h2>

                {/* Address summary */}
                {selectedAddress && addresses.length > 0 && (() => {
                  const addr = addresses.find(a => a._id === selectedAddress);
                  if (!addr) return null;
                  return (
                    <div className="bg-cream/50 rounded-xl p-4 mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-brown flex items-center gap-1"><Truck size={14} /> Delivering to</h3>
                        <button onClick={() => setStep(1)} className="text-xs text-rose hover:underline">Change</button>
                      </div>
                      <p className="text-sm text-brown">{addr.fullName}</p>
                      <p className="text-xs text-taupe">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.postalCode}</p>
                    </div>
                  );
                })()}

                {/* Items */}
                <div className="space-y-3">
                  {cart.items.map(item => (
                    <div key={item._id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-cream">
                      <div className="w-14 h-14 rounded bg-cream overflow-hidden shrink-0">
                        <img src={item.product?.images?.[0]?.url || ''} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brown truncate">{item.product?.title}</p>
                        <p className="text-xs text-taupe">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-brown">₹{(item.product?.discountPrice || item.product?.price || 0) * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep(2)} className="btn btn-secondary"><ArrowLeft size={16} /> Back</button>
                  <button onClick={handlePlaceOrder} disabled={loading} className="btn btn-primary btn-lg">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Placing Order...
                      </span>
                    ) : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="bg-white rounded-xl border border-cream p-6 sticky top-24">
              <h3 className="font-serif text-lg font-bold text-brown mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-taupe">Subtotal ({cart.itemCount} items)</span>
                  <span className="font-medium text-brown">₹{cart.subtotal}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Discount</span>
                    <span className="font-medium text-green-700">-₹{cart.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-taupe">Shipping</span>
                  <span className="font-medium text-brown">{cart.shippingFee === 0 ? 'Free' : `₹${cart.shippingFee}`}</span>
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t border-cream">
                <span className="font-semibold text-brown">Total</span>
                <span className="text-xl font-bold text-brown">₹{cart.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
