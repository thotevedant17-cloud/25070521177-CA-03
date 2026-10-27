import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import ImageWithFallback from '../components/ImageWithFallback.jsx';
import { EmptyState } from '../components/UI.jsx';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="page-enter container py-16">
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          message="Save items you love to your wishlist and come back to them later."
          action={<Link to="/shop" className="btn btn-primary">Browse Products <ArrowRight size={16} /></Link>}
        />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="bg-cream py-6">
        <div className="container">
          <h1 className="font-serif text-3xl font-bold text-brown">My Wishlist</h1>
          <p className="text-taupe text-sm mt-1">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {wishlist.map(item => {
            const product = item.product;
            if (!product) return null;
            const price = product.discountPrice || product.price;
            const hasDiscount = product.discountPrice && product.discountPrice < product.price;
            const imgUrl = product.images?.[0]?.url || '';

            return (
              <div key={item._id} className="card animate-fade-in">
                <Link to={`/product/${product.slug}`} className="product-img-wrap block">
                  <ImageWithFallback src={imgUrl} alt={product.title} className="w-full h-full object-cover" />
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="text-sm font-semibold text-brown hover:text-rose transition-colors line-clamp-2 mb-2">
                      {product.title}
                    </h3>
                  </Link>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-lg font-bold text-brown">₹{price}</span>
                    {hasDiscount && <span className="text-sm text-taupe line-through">₹{product.price}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(product._id)}
                      disabled={product.stock === 0}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      <ShoppingBag size={14} />
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="btn btn-secondary btn-sm"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
