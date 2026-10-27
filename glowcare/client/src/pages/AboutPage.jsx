import { Sparkles, Heart, Leaf, Shield, Award, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageWithFallback from '../components/ImageWithFallback.jsx';

export default function AboutPage() {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blush via-rose-light to-cream" />
        <div className="container relative z-10 text-center">
          <span className="inline-flex items-center gap-2 text-rose text-sm font-medium mb-4 tracking-wider uppercase">
            <Sparkles size={16} /> Our Story
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-brown mb-4">About GlowCare</h1>
          <p className="text-brown/70 max-w-2xl mx-auto text-lg leading-relaxed">
            We believe everyone deserves access to premium, effective skincare and makeup. GlowCare was born from a passion for clean beauty and a commitment to making self-care accessible.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold text-brown mb-4">Our Mission</h2>
              <p className="text-brown/70 leading-relaxed mb-4">
                At GlowCare, we're on a mission to revolutionize the beauty industry by curating only the finest skincare and makeup products that are safe, effective, and ethically made.
              </p>
              <p className="text-brown/70 leading-relaxed mb-6">
                Every product in our collection undergoes rigorous testing and is selected for its quality ingredients, proven results, and commitment to sustainability.
              </p>
              <Link to="/shop" className="btn btn-primary">Explore Our Collection</Link>
            </div>
            <div className="rounded-2xl overflow-hidden bg-cream aspect-[4/3]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80"
                alt="Skincare products arrangement"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-cream/50">
        <div className="container">
          <h2 className="section-title">Our Values</h2>
          <p className="section-subtitle">What drives everything we do</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Leaf, title: 'Clean Beauty', desc: 'We prioritize products with natural, non-toxic ingredients that are gentle on your skin and the environment.' },
              { icon: Shield, title: 'Dermatologist Tested', desc: 'Every product is vetted by skincare professionals to ensure safety and efficacy for all skin types.' },
              { icon: Heart, title: 'Cruelty Free', desc: 'We only partner with brands that are committed to cruelty-free practices. No animal testing, ever.' },
              { icon: Award, title: 'Quality First', desc: 'We never compromise on quality. Each product is carefully selected for its premium formulation.' },
              { icon: Users, title: 'Community Driven', desc: 'Your feedback shapes our collection. We listen, learn, and evolve with our GlowCare community.' },
              { icon: Sparkles, title: 'Inclusive Beauty', desc: 'Beauty has no boundaries. Our products celebrate diversity and cater to every skin type and tone.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-cream text-center">
                <div className="w-12 h-12 rounded-full bg-rose-light flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-rose" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-brown mb-2">{title}</h3>
                <p className="text-sm text-brown/70 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '10K+', label: 'Happy Customers' },
              { number: '500+', label: 'Products' },
              { number: '50+', label: 'Brands' },
              { number: '4.8★', label: 'Average Rating' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="font-serif text-3xl md:text-4xl font-bold text-brown">{stat.number}</p>
                <p className="text-sm text-taupe mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <div className="bg-brown rounded-3xl text-center py-14 px-6">
            <h2 className="font-serif text-3xl font-bold text-white mb-3">Ready to Start Your Glow Journey?</h2>
            <p className="text-white/60 max-w-md mx-auto mb-6">Take our skin quiz to get personalized product recommendations.</p>
            <Link to="/skin-quiz" className="btn btn-rose btn-lg">Take the Skin Quiz <Sparkles size={18} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
