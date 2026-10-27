import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart, wishlistCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop All', path: '/shop' },
    { name: 'Skincare', path: '/shop?category=skincare' },
    { name: 'Makeup', path: '/shop?category=makeup' },
    { name: 'Skin Quiz', path: '/skin-quiz' },
  ];

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-brown text-white text-center py-2 px-4 text-xs font-medium tracking-wide">
        ✨ Free shipping on orders above ₹999 | Use code <strong>GLOW10</strong> for 10% off
      </div>

      {/* Main Navbar */}
      <nav className="bg-ivory sticky top-0 z-50 border-b border-cream shadow-sm">
        <div className="container flex items-center justify-between h-16 lg:h-18">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 hover:bg-cream rounded-lg transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-brown tracking-tight">GlowCare</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-brown/80 hover:text-brown transition-colors relative group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-cream rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="p-2 hover:bg-cream rounded-lg transition-colors relative">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="p-2 hover:bg-cream rounded-lg transition-colors relative">
              <ShoppingBag size={20} />
              {cart.itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-brown text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cart.itemCount}
                </span>
              )}
            </Link>

            {/* User */}
            <div className="relative">
              <button
                onClick={() => isAuthenticated ? setProfileOpen(!profileOpen) : navigate('/login')}
                className="p-2 hover:bg-cream rounded-lg transition-colors"
                aria-label="Account"
              >
                <User size={20} />
              </button>

              {profileOpen && isAuthenticated && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-cream py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-cream">
                    <p className="text-sm font-semibold text-brown truncate">{user.name}</p>
                    <p className="text-xs text-taupe truncate">{user.email}</p>
                  </div>
                  <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-cream transition-colors">Dashboard</Link>
                  <Link to="/orders" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-cream transition-colors">My Orders</Link>
                  <Link to="/wishlist" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-cream transition-colors">Wishlist</Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-cream transition-colors font-semibold text-rose">Admin Panel</Link>
                  )}
                  <button
                    onClick={() => { logout(); setProfileOpen(false); navigate('/'); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-cream transition-colors flex items-center gap-2 text-red-700"
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-cream bg-white py-3 px-4 animate-fade-in">
            <form onSubmit={handleSearch} className="container flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands..."
                className="form-input flex-1"
                autoFocus
              />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-cream bg-white animate-fade-in">
            <div className="py-4 px-6 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-sm font-medium text-brown hover:text-rose transition-colors border-b border-cream/50"
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/about" onClick={() => setMobileOpen(false)} className="block py-3 text-sm font-medium text-brown hover:text-rose transition-colors border-b border-cream/50">About Us</Link>
              <Link to="/contact" onClick={() => setMobileOpen(false)} className="block py-3 text-sm font-medium text-brown hover:text-rose transition-colors">Contact</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Click outside overlay for dropdowns */}
      {(profileOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </>
  );
}
