import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import ImageWithFallback from './ImageWithFallback.jsx';

export default function ProductCard({ product }) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const inWishlist = isInWishlist(product._id);

  const effectivePrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;
  const imgUrl = product.images?.[0]?.url || '';
  const brandName = typeof product.brand === 'object' ? product.brand?.name : '';

  return (
    <div className="card group">
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="product-img-wrap block">
        <ImageWithFallback src={imgUrl} alt={product.title} className="w-full h-full object-cover" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && <span className="badge badge-sale">-{discountPercent}%</span>}
          {product.isNewArrival && <span className="badge badge-new">New</span>}
          {product.isTrending && <span className="badge badge-trending">Trending</span>}
          {product.isBestseller && <span className="badge badge-bestseller">Bestseller</span>}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            inWishlist ? removeFromWishlist(product._id) : addToWishlist(product._id);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={inWishlist ? '#D9A5AE' : 'none'} className={inWishlist ? 'text-rose' : 'text-brown'} />
        </button>

        {/* Quick Add */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product._id);
            }}
            disabled={product.stock === 0}
            className="w-full btn btn-primary btn-sm gap-1.5"
          >
            <ShoppingBag size={14} />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        {brandName && (
          <p className="text-xs text-taupe font-medium uppercase tracking-wider mb-1">{brandName}</p>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold text-brown leading-snug mb-2 hover:text-rose transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={12} fill={i <= Math.round(product.rating) ? '#d4a017' : 'none'} className={i <= Math.round(product.rating) ? 'text-amber-500' : 'text-gray-300'} />
              ))}
            </div>
            <span className="text-xs text-taupe">({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-brown">₹{effectivePrice}</span>
          {hasDiscount && (
            <span className="text-sm text-taupe line-through">₹{product.price}</span>
          )}
        </div>

        {product.stock === 0 && (
          <p className="text-xs text-red-600 font-medium mt-1">Out of Stock</p>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-xs text-amber-600 font-medium mt-1">Only {product.stock} left!</p>
        )}
      </div>
    </div>
  );
}
