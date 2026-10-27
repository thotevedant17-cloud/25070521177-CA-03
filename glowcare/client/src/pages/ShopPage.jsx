import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import api from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { SkeletonList, EmptyState } from '../components/UI.jsx';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentSort = searchParams.get('sort') || 'newest';
  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSkinType = searchParams.get('skinType') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands')
        ]);
        setCategories(catRes.data.data.categories);
        setBrands(brandRes.data.data.brands);
      } catch {}
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 12,
          sort: currentSort,
        };

        if (currentSearch) params.search = currentSearch;
        if (currentBrand) params.brand = currentBrand;
        if (currentSkinType) params.skinType = currentSkinType;
        if (currentMinPrice) params.minPrice = currentMinPrice;
        if (currentMaxPrice) params.maxPrice = currentMaxPrice;

        // Handle category filter — could be an ID or 'skincare'/'makeup' parent
        if (currentCategory) {
          if (currentCategory === 'skincare' || currentCategory === 'makeup') {
            const catIds = categories
              .filter(c => c.parentCategory === currentCategory)
              .map(c => c._id);
            // Fetch for each category and merge
            if (catIds.length > 0) {
              // Use the first matching category for now; in production, backend should support parent filter
              // For now, send search that matches products within those categories
              params.search = params.search || '';
            }
          } else {
            params.category = currentCategory;
          }
        }

        const res = await api.get('/products', { params });
        setProducts(res.data.data.products);
        setPagination(res.data.data.pagination);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams, categories]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = currentCategory || currentBrand || currentSearch || currentSkinType || currentMinPrice || currentMaxPrice;

  const pageTitle = currentSearch
    ? `Search: "${currentSearch}"`
    : currentCategory === 'skincare'
    ? 'Skincare Products'
    : currentCategory === 'makeup'
    ? 'Makeup Products'
    : 'Shop All Products';

  return (
    <div className="page-enter">
      <div className="bg-cream py-8">
        <div className="container">
          <h1 className="font-serif text-3xl font-bold text-brown">{pageTitle}</h1>
          <p className="text-taupe text-sm mt-1">
            {pagination.total !== undefined ? `${pagination.total} products found` : 'Loading...'}
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Sort & Filter Bar */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="btn btn-secondary btn-sm"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-taupe">Sort by:</span>
            <select
              value={currentSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="form-input py-2 w-44 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {filtersOpen && (
            <div className="w-64 shrink-0 space-y-6 animate-fade-in">
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="text-sm text-rose font-medium flex items-center gap-1 hover:underline">
                  <X size={14} /> Clear All Filters
                </button>
              )}

              {/* Category */}
              <div>
                <h4 className="text-sm font-semibold text-brown mb-3">Category</h4>
                <div className="space-y-2">
                  <button onClick={() => updateFilter('category', '')} className={`block text-sm ${!currentCategory ? 'font-semibold text-rose' : 'text-taupe hover:text-brown'} transition-colors`}>All Categories</button>
                  {categories.map(cat => (
                    <button key={cat._id} onClick={() => updateFilter('category', cat._id)} className={`block text-sm ${currentCategory === cat._id ? 'font-semibold text-rose' : 'text-taupe hover:text-brown'} transition-colors`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <h4 className="text-sm font-semibold text-brown mb-3">Brand</h4>
                <div className="space-y-2">
                  <button onClick={() => updateFilter('brand', '')} className={`block text-sm ${!currentBrand ? 'font-semibold text-rose' : 'text-taupe hover:text-brown'} transition-colors`}>All Brands</button>
                  {brands.map(b => (
                    <button key={b._id} onClick={() => updateFilter('brand', b._id)} className={`block text-sm ${currentBrand === b._id ? 'font-semibold text-rose' : 'text-taupe hover:text-brown'} transition-colors`}>
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Type */}
              <div>
                <h4 className="text-sm font-semibold text-brown mb-3">Skin Type</h4>
                <div className="space-y-2">
                  {['', 'oily', 'dry', 'combination', 'normal', 'sensitive'].map(type => (
                    <button key={type} onClick={() => updateFilter('skinType', type)} className={`block text-sm capitalize ${currentSkinType === type ? 'font-semibold text-rose' : 'text-taupe hover:text-brown'} transition-colors`}>
                      {type || 'All Types'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="text-sm font-semibold text-brown mb-3">Price Range</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={currentMinPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="form-input py-2 text-sm w-full"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={currentMaxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="form-input py-2 text-sm w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <SkeletonList count={8} />
            ) : products.length === 0 ? (
              <EmptyState
                title="No products found"
                message="Try adjusting your filters or search terms."
                action={<button onClick={clearAllFilters} className="btn btn-primary btn-sm">Clear Filters</button>}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => updateFilter('page', page.toString())}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-brown text-white'
                            : 'bg-cream text-brown hover:bg-blush'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
