import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star, Minus, Plus, ChevronRight, Shield, Truck, RotateCcw } from 'lucide-react';
import api from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ImageWithFallback from '../components/ImageWithFallback.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { LoadingSpinner, EmptyState } from '../components/UI.jsx';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data.data.product);
        setRelatedProducts(res.data.data.relatedProducts || []);
        setSelectedImage(0);
        setQuantity(1);

        // Fetch reviews
        const revRes = await api.get(`/products/${res.data.data.product._id}/reviews`);
        setReviews(revRes.data.data.reviews);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = () => {
    if (product) addToCart(product._id, quantity);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please log in to write a review'); return; }
    if (reviewForm.comment.length < 10) { toast.error('Review must be at least 10 characters'); return; }
    try {
      setSubmittingReview(true);
      await api.post(`/products/${product._id}/reviews`, reviewForm);
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      const revRes = await api.get(`/products/${product._id}/reviews`);
      setReviews(revRes.data.data.reviews);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!product) return <EmptyState title="Product Not Found" message="This product doesn't exist or has been removed." />;

  const effectivePrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const brandName = typeof product.brand === 'object' ? product.brand?.name : '';
  const categoryName = typeof product.category === 'object' ? product.category?.name : '';
  const inWishlist = isInWishlist(product._id);

  return (
    <div className="page-enter">
      {/* Breadcrumb */}
      <div className="bg-cream py-3">
        <div className="container flex items-center gap-2 text-xs text-taupe">
          <Link to="/" className="hover:text-brown">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-brown">Shop</Link>
          <ChevronRight size={12} />
          <span className="text-brown font-medium truncate">{product.title}</span>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-cream aspect-square mb-4">
              <ImageWithFallback
                src={product.images?.[selectedImage]?.url || ''}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === selectedImage ? 'border-rose' : 'border-transparent'
                    }`}
                  >
                    <ImageWithFallback src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {brandName && (
              <p className="text-sm text-taupe font-medium uppercase tracking-wider mb-1">{brandName}</p>
            )}
            <h1 className="font-serif text-3xl font-bold text-brown mb-3">{product.title}</h1>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={16} fill={i <= Math.round(product.rating) ? '#d4a017' : 'none'} className={i <= Math.round(product.rating) ? 'text-amber-500' : 'text-gray-300'} />
                  ))}
                </div>
                <span className="text-sm text-taupe">{product.rating} ({product.reviewCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-brown">₹{effectivePrice}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-taupe line-through">₹{product.price}</span>
                  <span className="badge badge-sale">-{Math.round((1 - product.discountPrice / product.price) * 100)}%</span>
                </>
              )}
            </div>

            {product.size && <p className="text-sm text-taupe mb-4">Size: {product.size}</p>}

            {/* Stock */}
            {product.stock === 0 ? (
              <p className="text-red-600 font-medium mb-4">Out of Stock</p>
            ) : product.stock <= 5 ? (
              <p className="text-amber-600 font-medium mb-4">Only {product.stock} left in stock!</p>
            ) : (
              <p className="text-green-700 text-sm font-medium mb-4">✓ In Stock</p>
            )}

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border border-cream rounded-lg">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2.5 hover:bg-cream transition-colors"><Minus size={16} /></button>
                  <span className="px-4 text-sm font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="p-2.5 hover:bg-cream transition-colors"><Plus size={16} /></button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn btn-primary btn-lg flex-1">
                <ShoppingBag size={18} /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={() => inWishlist ? removeFromWishlist(product._id) : addToWishlist(product._id)}
                className={`btn btn-lg ${inWishlist ? 'bg-rose-light text-rose border-rose' : 'btn-secondary'}`}
              >
                <Heart size={18} fill={inWishlist ? '#D9A5AE' : 'none'} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 py-6 border-t border-b border-cream">
              {[
                { icon: Truck, text: 'Free Shipping 999+' },
                { icon: Shield, text: 'Authentic Products' },
                { icon: RotateCcw, text: 'Easy Returns' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="text-center">
                  <Icon size={20} className="mx-auto text-rose mb-1" />
                  <p className="text-xs text-taupe">{text}</p>
                </div>
              ))}
            </div>

            {/* Skin types & concerns */}
            {product.skinTypes?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-brown mb-2">Suitable for:</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.skinTypes.map(t => (
                    <span key={t} className="px-3 py-1 bg-cream rounded-full text-xs capitalize text-brown">{t} skin</span>
                  ))}
                </div>
              </div>
            )}
            {product.concerns?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-brown mb-2">Addresses:</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.concerns.map(c => (
                    <span key={c} className="px-3 py-1 bg-blush/50 rounded-full text-xs capitalize text-brown">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex gap-8 border-b border-cream mb-8">
            {['description', 'ingredients', 'how-to-use', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab ? 'border-rose text-brown' : 'border-transparent text-taupe hover:text-brown'
                }`}
              >
                {tab.replace('-', ' ')} {tab === 'reviews' && `(${reviews.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="max-w-3xl">
              <p className="text-brown/80 leading-relaxed">{product.description}</p>
              {product.benefits?.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-brown mb-3">Key Benefits</h4>
                  <ul className="space-y-2">
                    {product.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-brown/80">
                        <span className="text-rose mt-1">✦</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="max-w-3xl">
              {product.ingredients?.length > 0 ? (
                <p className="text-sm text-brown/80 leading-relaxed">{product.ingredients.join(', ')}</p>
              ) : (
                <p className="text-taupe text-sm">Ingredient list not available for this product.</p>
              )}
              {product.warnings && (
                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800"><strong>⚠ Warnings:</strong> {product.warnings}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'how-to-use' && (
            <div className="max-w-3xl">
              <p className="text-brown/80 leading-relaxed">{product.howToUse || 'Usage instructions not available.'}</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-3xl">
              {/* Review Form */}
              {isAuthenticated && (
                <form onSubmit={handleSubmitReview} className="bg-cream/50 rounded-xl p-6 mb-8">
                  <h4 className="font-semibold text-brown mb-4">Write a Review</h4>
                  <div className="mb-4">
                    <label className="form-label">Rating</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <button key={i} type="button" onClick={() => setReviewForm(f => ({...f, rating: i}))}>
                          <Star size={24} fill={i <= reviewForm.rating ? '#d4a017' : 'none'} className={i <= reviewForm.rating ? 'text-amber-500' : 'text-gray-300'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Your Review</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(f => ({...f, comment: e.target.value}))}
                      className="form-input min-h-24 resize-none"
                      placeholder="Share your experience..."
                      required
                      minLength={10}
                    />
                  </div>
                  <button type="submit" disabled={submittingReview} className="btn btn-primary btn-sm">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}

              {reviews.length === 0 ? (
                <p className="text-taupe text-sm">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map(r => (
                    <div key={r._id} className="border-b border-cream pb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} size={12} fill={i <= r.rating ? '#d4a017' : 'none'} className={i <= r.rating ? 'text-amber-500' : 'text-gray-300'} />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-brown">{r.user?.name}</span>
                        {r.isDemo && <span className="text-xs text-taupe">(demo)</span>}
                      </div>
                      <p className="text-sm text-brown/80 leading-relaxed">{r.comment}</p>
                      <p className="text-xs text-taupe mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="section-title text-left">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
              {relatedProducts.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
