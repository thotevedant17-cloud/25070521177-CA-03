import Product from '../models/Product.js';
import Review from '../models/Review.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/v1/products
export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    sort = '-createdAt',
    category,
    brand,
    skinType,
    concern,
    minPrice,
    maxPrice,
    rating,
    search,
    featured,
    bestseller,
    newArrival,
    trending
  } = req.query;

  const filter = { isActive: true };

  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (skinType) filter.skinTypes = { $in: [skinType] };
  if (concern) filter.concerns = { $in: [concern] };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (rating) filter.rating = { $gte: Number(rating) };
  if (featured === 'true') filter.isFeatured = true;
  if (bestseller === 'true') filter.isBestseller = true;
  if (newArrival === 'true') filter.isNewArrival = true;
  if (trending === 'true') filter.isTrending = true;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Sort mapping
  let sortObj = {};
  switch (sort) {
    case 'price-asc': sortObj = { price: 1 }; break;
    case 'price-desc': sortObj = { price: -1 }; break;
    case 'rating': sortObj = { rating: -1 }; break;
    case 'popularity': sortObj = { totalSold: -1 }; break;
    case 'newest': sortObj = { createdAt: -1 }; break;
    default: sortObj = { createdAt: -1 };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate('category', 'name slug parentCategory')
    .populate('brand', 'name slug')
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

// GET /api/v1/products/featured
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isFeatured: true })
    .populate('category', 'name slug parentCategory')
    .populate('brand', 'name slug')
    .limit(8)
    .lean();

  res.json({ success: true, data: { products } });
});

// GET /api/v1/products/bestsellers
export const getBestsellers = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isBestseller: true })
    .populate('category', 'name slug parentCategory')
    .populate('brand', 'name slug')
    .sort({ totalSold: -1 })
    .limit(8)
    .lean();

  res.json({ success: true, data: { products } });
});

// GET /api/v1/products/new-arrivals
export const getNewArrivals = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isNewArrival: true })
    .populate('category', 'name slug parentCategory')
    .populate('brand', 'name slug')
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  res.json({ success: true, data: { products } });
});

// GET /api/v1/products/trending
export const getTrending = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isTrending: true })
    .populate('category', 'name slug parentCategory')
    .populate('brand', 'name slug')
    .limit(8)
    .lean();

  res.json({ success: true, data: { products } });
});

// GET /api/v1/products/search
export const searchProducts = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;
  if (!q || q.length < 2) {
    return res.json({ success: true, data: { products: [] } });
  }

  const products = await Product.find({
    isActive: true,
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ]
  })
    .populate('brand', 'name slug')
    .select('title slug price discountPrice images brand rating')
    .limit(Number(limit))
    .lean();

  res.json({ success: true, data: { products } });
});

// GET /api/v1/products/:slug
export const getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug parentCategory')
    .populate('brand', 'name slug logo')
    .lean();

  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  // Get related products
  const related = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    $or: [
      { category: product.category._id },
      { brand: product.brand._id }
    ]
  })
    .populate('brand', 'name slug')
    .limit(4)
    .lean();

  res.json({
    success: true,
    data: { product, relatedProducts: related }
  });
});

// GET /api/v1/products/:productId/reviews
export const getProductReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const total = await Review.countDocuments({
    product: req.params.productId,
    isApproved: true
  });

  const reviews = await Review.find({
    product: req.params.productId,
    isApproved: true
  })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

// POST /api/v1/products/:productId/reviews
export const createReview = asyncHandler(async (req, res, next) => {
  const { rating, title, comment } = req.body;
  const productId = req.params.productId;
  const userId = req.user._id;

  // Check for existing review
  const existingReview = await Review.findOne({ user: userId, product: productId });
  if (existingReview) {
    return next(new AppError('You have already reviewed this product.', 400));
  }

  // Check product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  const review = await Review.create({
    user: userId,
    product: productId,
    rating,
    title: title || '',
    comment
  });

  // Update product rating
  const stats = await Review.aggregate([
    { $match: { product: product._id, isApproved: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    product.rating = Math.round(stats[0].avgRating * 10) / 10;
    product.reviewCount = stats[0].count;
    await product.save();
  }

  await review.populate('user', 'name');

  res.status(201).json({ success: true, data: { review } });
});
