import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Droplets, Sun, Shield, Star, ChevronRight } from 'lucide-react';
import api from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import ImageWithFallback from '../components/ImageWithFallback.jsx';
import { SkeletonList } from '../components/UI.jsx';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, bestRes, newRes, trendRes, catRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products/bestsellers'),
          api.get('/products/new-arrivals'),
          api.get('/products/trending'),
          api.get('/categories')
        ]);
        setFeatured(featRes.data.data.products);
        setBestsellers(bestRes.data.data.products);
        setNewArrivals(newRes.data.data.products);
        setTrending(trendRes.data.data.products);
        setCategories(catRes.data.data.categories);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const skincareCategories = categories.filter(c => c.parentCategory === 'skincare').slice(0, 6);
  const makeupCategories = categories.filter(c => c.parentCategory === 'makeup').slice(0, 6);

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1920&q=80"
            alt="Beauty products editorial"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brown/70 via-brown/40 to-transparent" />
        </div>
        <div className="container relative z-10 py-20">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 text-rose-light text-sm font-medium mb-4 tracking-wider uppercase animate-fade-in">
              <Sparkles size={16} /> Premium Beauty Collection
            </span>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white font-bold leading-tight mb-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
              Discover Your<br />Natural <span className="text-blush">Glow</span>
            </h1>
            <p className="text-white/80 text-lg mb-8 leading-relaxed animate-fade-in max-w-lg" style={{animationDelay: '0.2s'}}>
              Curated skincare and makeup essentials that celebrate your unique beauty. Science-backed formulas for radiant, healthy skin.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <Link to="/shop?category=skincare" className="btn btn-rose btn-lg">
                Shop Skincare <ArrowRight size={18} />
              </Link>
              <Link to="/shop?category=makeup" className="btn btn-lg bg-white/15 text-white border-2 border-white/30 backdrop-blur-sm hover:bg-white/25">
                Shop Makeup <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-cream py-6 border-y border-blush/30">
        <div className="container flex flex-wrap justify-center gap-8 md:gap-16">
          {[
            { icon: Shield, text: 'Dermatologist Tested' },
            { icon: Droplets, text: 'Clean Ingredients' },
            { icon: Sun, text: 'Cruelty Free' },
            { icon: Sparkles, text: 'Paraben Free' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-brown/80">
              <Icon size={20} className="text-rose" />
              <span className="text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Skincare Categories */}
      {skincareCategories.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Skincare Essentials</h2>
            <p className="section-subtitle">Build your perfect skincare routine</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {skincareCategories.map(cat => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${cat._id}`}
                  className="group text-center"
                >
                  <div className="relative rounded-2xl overflow-hidden aspect-square mb-3 bg-cream">
                    <ImageWithFallback
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-brown/10 group-hover:bg-brown/20 transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-brown group-hover:text-rose transition-colors">{cat.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bestsellers */}
      <section className="section bg-cream/50">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title text-left mb-1">Bestsellers</h2>
              <p className="text-taupe text-sm">Our most-loved products</p>
            </div>
            <Link to="/shop?sort=popularity" className="text-sm font-semibold text-brown hover:text-rose transition-colors flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          {loading ? <SkeletonList count={4} /> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {bestsellers.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Makeup Categories */}
      {makeupCategories.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Makeup Collection</h2>
            <p className="section-subtitle">Elevate your beauty routine</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {makeupCategories.map(cat => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${cat._id}`}
                  className="group text-center"
                >
                  <div className="relative rounded-2xl overflow-hidden aspect-square mb-3 bg-cream">
                    <ImageWithFallback
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-brown/10 group-hover:bg-brown/20 transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-brown group-hover:text-rose transition-colors">{cat.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="section bg-cream/50">
          <div className="container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="section-title text-left mb-1">New Arrivals</h2>
                <p className="text-taupe text-sm">Fresh additions to our collection</p>
              </div>
              <Link to="/shop?sort=newest" className="text-sm font-semibold text-brown hover:text-rose transition-colors flex items-center gap-1">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {newArrivals.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Skin Quiz CTA */}
      <section className="section">
        <div className="container">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blush via-rose-light to-cream p-10 md:p-16">
            <div className="max-w-lg relative z-10">
              <span className="inline-flex items-center gap-2 text-brown/70 text-sm font-medium mb-3">
                <Sparkles size={16} /> Personalized For You
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-brown font-bold mb-4">
                Find Your Perfect Skincare Routine
              </h2>
              <p className="text-brown/70 mb-6 leading-relaxed">
                Take our quick skin quiz and get personalized product recommendations tailored to your skin type, concerns, and goals.
              </p>
              <Link to="/skin-quiz" className="btn btn-primary btn-lg">
                Take the Skin Quiz <ArrowRight size={18} />
              </Link>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:block">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=600"
                alt="Skincare routine"
                className="w-full h-full object-cover opacity-40"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="section bg-cream/50">
          <div className="container">
            <h2 className="section-title">Trending Now</h2>
            <p className="section-subtitle">What everyone's loving this season</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {trending.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Real reviews from real glow-getters (demo content)</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Priya S.', text: 'The Vitamin C Serum transformed my skin! Dark spots faded within weeks. Absolutely love GlowCare products.', rating: 5 },
              { name: 'Ananya M.', text: 'Best beauty store I\'ve found online. The skin quiz helped me build the perfect routine for my sensitive skin.', rating: 5 },
              { name: 'Riya K.', text: 'The packaging is gorgeous and products are even better. The foundation gives the most natural finish!', rating: 4 },
            ].map((review, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-cream">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} fill={s <= review.rating ? '#d4a017' : 'none'} className={s <= review.rating ? 'text-amber-500' : 'text-gray-300'} />
                  ))}
                </div>
                <p className="text-sm text-brown/80 leading-relaxed mb-4 italic">"{review.text}"</p>
                <p className="text-sm font-semibold text-brown">{review.name}</p>
                <p className="text-xs text-taupe">Verified Customer (demo)</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-12">
        <div className="container">
          <div className="relative rounded-3xl overflow-hidden bg-brown text-white text-center py-14 px-6">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Your Skin Deserves the Best</h2>
            <p className="text-white/70 max-w-md mx-auto mb-6">Explore our curated collection of premium skincare and makeup products.</p>
            <Link to="/shop" className="btn btn-rose btn-lg">Shop Now <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
