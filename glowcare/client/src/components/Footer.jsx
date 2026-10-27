import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Instagram, Facebook, Twitter } from 'lucide-react';
import { useState } from 'react';
import api from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const toast = useToast();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setSubscribing(true);
      await api.post('/newsletter/subscribe', { email });
      toast.success('Subscribed to newsletter!');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-brown text-white/90">
      {/* Newsletter */}
      <div className="bg-brown-light">
        <div className="container py-12 text-center">
          <h3 className="font-serif text-2xl mb-2">Join the Glow Community</h3>
          <p className="text-white/60 text-sm mb-6">Get skincare tips, exclusive offers, and new arrivals straight to your inbox.</p>
          <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-rose text-sm"
              required
            />
            <button type="submit" disabled={subscribing} className="btn btn-rose btn-sm whitespace-nowrap">
              {subscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h4 className="font-serif text-xl font-bold mb-3">GlowCare</h4>
            <p className="text-sm text-white/60 mb-4 leading-relaxed">Your Skin, Your Glow. Discover premium skincare and makeup products crafted for radiant beauty.</p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-rose transition-colors"><Instagram size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-rose transition-colors"><Facebook size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-rose transition-colors"><Twitter size={16} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-semibold text-sm uppercase tracking-wider mb-4">Shop</h5>
            <div className="space-y-2.5">
              <Link to="/shop" className="block text-sm text-white/60 hover:text-white transition-colors">All Products</Link>
              <Link to="/shop?category=skincare" className="block text-sm text-white/60 hover:text-white transition-colors">Skincare</Link>
              <Link to="/shop?category=makeup" className="block text-sm text-white/60 hover:text-white transition-colors">Makeup</Link>
              <Link to="/skin-quiz" className="block text-sm text-white/60 hover:text-white transition-colors">Skin Quiz</Link>
            </div>
          </div>

          {/* Help */}
          <div>
            <h5 className="font-semibold text-sm uppercase tracking-wider mb-4">Help</h5>
            <div className="space-y-2.5">
              <Link to="/about" className="block text-sm text-white/60 hover:text-white transition-colors">About Us</Link>
              <Link to="/contact" className="block text-sm text-white/60 hover:text-white transition-colors">Contact Us</Link>
              <Link to="/faq" className="block text-sm text-white/60 hover:text-white transition-colors">FAQ</Link>
              <Link to="/privacy-policy" className="block text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="block text-sm text-white/60 hover:text-white transition-colors">Terms & Conditions</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-semibold text-sm uppercase tracking-wider mb-4">Contact</h5>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin size={16} className="shrink-0 mt-0.5" />
                <span>123 Beauty Lane, Mumbai, MH 400001</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white/60">
                <Phone size={16} className="shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white/60">
                <Mail size={16} className="shrink-0" />
                <span>hello@glowcare.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} GlowCare. All rights reserved.</p>
          <p className="text-xs text-white/40">Made with ♡ for radiant skin</p>
        </div>
      </div>
    </footer>
  );
}
