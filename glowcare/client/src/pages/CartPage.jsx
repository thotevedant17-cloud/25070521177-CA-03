import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ImageWithFallback from '../components/ImageWithFallback.jsx';
import { EmptyState } from '../components/UI.jsx';
import { useState } from 'react';
import api from '../services/api.js';

export default function CartPage() {
  const { cart, updateCartItem, removeFromCart } = useCart();
  const toast = useToast();
  const [coupon, setCoupon] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      setApplyingCoupon(true);
      await api.post('/cart/coupon', { code: coupon });
      toast.success('Coupon applied!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="page-enter container py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your Cart is Empty"
          message="Looks like you haven't added anything to your cart yet. Start shopping to find your perfect products."
          action={<Link to="/shop" className="btn btn-primary">Continue Shopping <ArrowRight size={16} /></Link>}
        />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="bg-cream py-6">
        <div className="container">
          <h1 className="font-serif text-3xl font-bold text-brown">Shopping Cart</h1>
          <p className="text-taupe text-sm mt-1">{cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} in your cart</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map(item => {
              const product = item.product;
              const price = product?.discountPrice || product?.price || 0;
              const imgUrl = product?.images?.[0]?.url || '';
              return (
                <div key={item._id} className="bg-white rounded-xl p-4 flex gap-4 border border-cream animate-fade-in">
                  <Link to={`/product/${product?.slug}`} className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-cream">
                    <ImageWithFallback src={imgUrl} alt={product?.title} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link to={`/product/${product?.slug}`} className="text-sm font-semibold text-brown hover:text-rose transition-colors line-clamp-1">
                          {product?.title}
                        </Link>
                        {product?.brand?.name && (
                          <p className="text-xs text-taupe mt-0.5">{product.brand.name}</p>
                        )}
                      </div>
                      <button onClick={() => removeFromCart(item._id)} className="text-taupe hover:text-red-600 transition-colors shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-cream rounded-lg">
                        <button onClick={() => updateCartItem(item._id, Math.max(1, item.quantity - 1))} className="p-1.5 hover:bg-cream transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateCartItem(item._id, item.quantity + 1)} className="p-1.5 hover:bg-cream transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-bold text-brown">₹{price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl border border-cream p-6 sticky top-24">
              <h2 className="font-serif text-xl font-bold text-brown mb-5">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-5 pb-5 border-b border-cream">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe" />
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="form-input py-2 pl-9 text-sm"
                    />
                  </div>
                  <button onClick={handleApplyCoupon} disabled={applyingCoupon} className="btn btn-secondary btn-sm whitespace-nowrap">
                    Apply
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-taupe">Subtotal</span>
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

              <div className="flex justify-between pt-4 border-t border-cream mb-6">
                <span className="font-semibold text-brown">Total</span>
                <span className="text-xl font-bold text-brown">₹{cart.total}</span>
              </div>

              <Link to="/checkout" className="btn btn-primary w-full btn-lg">
                Proceed to Checkout <ArrowRight size={18} />
              </Link>

              <Link to="/shop" className="block text-center text-sm text-taupe hover:text-brown mt-4 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
