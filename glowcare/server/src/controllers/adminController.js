import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import slugify from 'slugify';

// GET /api/v1/admin/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const [totalProducts, totalCustomers, totalOrders, lowStock] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'customer' }),
    Order.countDocuments(),
    Product.countDocuments({ isActive: true, stock: { $lte: 5 } })
  ]);

  // Revenue from paid/delivered orders
  const revenueResult = await Order.aggregate([
    { $match: { orderStatus: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);
  const revenue = revenueResult[0]?.total || 0;

  // Recent orders
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Monthly sales for chart (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
        orderStatus: { $nin: ['cancelled', 'refunded'] }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Low stock products
  const lowStockProducts = await Product.find({ isActive: true, stock: { $lte: 5 } })
    .select('title stock images price')
    .sort({ stock: 1 })
    .limit(10)
    .lean();

  res.json({
    success: true,
    data: {
      stats: { totalProducts, totalCustomers, totalOrders, revenue, lowStock },
      recentOrders,
      monthlySales,
      lowStockProducts
    }
  });
});

// ---- Product Management ----

// GET /api/v1/admin/products
export const getAdminProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, category, brand, status } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } }
    ];
  }
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate('category', 'name')
    .populate('brand', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    data: {
      products,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    }
  });
});

// POST /api/v1/admin/products
export const createProduct = asyncHandler(async (req, res) => {
  const data = req.body;
  data.slug = slugify(data.title, { lower: true, strict: true });

  // Handle unique slug
  const existingSlug = await Product.findOne({ slug: data.slug });
  if (existingSlug) {
    data.slug = `${data.slug}-${Date.now().toString(36)}`;
  }

  // Handle image URLs
  if (data.imageUrls && Array.isArray(data.imageUrls)) {
    data.images = data.imageUrls.map(url => ({ url, alt: data.title }));
    delete data.imageUrls;
  }

  const product = await Product.create(data);
  await product.populate('category', 'name');
  await product.populate('brand', 'name');

  res.status(201).json({ success: true, data: { product } });
});

// PUT /api/v1/admin/products/:id
export const updateProduct = asyncHandler(async (req, res, next) => {
  const data = req.body;

  if (data.title) {
    data.slug = slugify(data.title, { lower: true, strict: true });
    const existingSlug = await Product.findOne({ slug: data.slug, _id: { $ne: req.params.id } });
    if (existingSlug) {
      data.slug = `${data.slug}-${Date.now().toString(36)}`;
    }
  }

  if (data.imageUrls && Array.isArray(data.imageUrls)) {
    data.images = data.imageUrls.map(url => ({ url, alt: data.title || '' }));
    delete data.imageUrls;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true
  }).populate('category', 'name').populate('brand', 'name');

  if (!product) return next(new AppError('Product not found.', 404));
  res.json({ success: true, data: { product } });
});

// DELETE /api/v1/admin/products/:id
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return next(new AppError('Product not found.', 404));
  res.json({ success: true, message: 'Product archived successfully' });
});

// ---- Order Management ----

// GET /api/v1/admin/orders
export const getAdminOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { contactEmail: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments(filter);

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    data: {
      orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    }
  });
});

// PATCH /api/v1/admin/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, note } = req.body;

  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
    refunded: []
  };

  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found.', 404));

  if (!validTransitions[order.orderStatus]?.includes(status)) {
    return next(new AppError(`Cannot transition from "${order.orderStatus}" to "${status}".`, 400));
  }

  // If cancelling, restore stock
  if (status === 'cancelled') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, totalSold: -item.quantity }
      });
    }
    order.cancelledAt = new Date();
  }

  if (status === 'delivered') {
    order.deliveredAt = new Date();
    order.paymentStatus = 'paid';
  }

  order.orderStatus = status;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}` });
  await order.save();

  res.json({ success: true, data: { order } });
});

// ---- User Management ----

// GET /api/v1/admin/users
export const getAdminUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(filter);

  const users = await User.find(filter)
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  // Add order count for each user
  const usersWithOrders = await Promise.all(
    users.map(async (user) => {
      const orderCount = await Order.countDocuments({ user: user._id });
      return { ...user, orderCount };
    })
  );

  res.json({
    success: true,
    data: {
      users: usersWithOrders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    }
  });
});

// ---- Category Management ----

// POST /api/v1/admin/categories
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parentCategory, sortOrder } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  const category = await Category.create({
    name, slug, description, image, parentCategory, sortOrder
  });

  res.status(201).json({ success: true, data: { category } });
});

// PUT /api/v1/admin/categories/:id
export const updateCategory = asyncHandler(async (req, res, next) => {
  const data = req.body;
  if (data.name) data.slug = slugify(data.name, { lower: true, strict: true });

  const category = await Category.findByIdAndUpdate(req.params.id, data, {
    new: true, runValidators: true
  });
  if (!category) return next(new AppError('Category not found.', 404));
  res.json({ success: true, data: { category } });
});

// DELETE /api/v1/admin/categories/:id
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false });
  if (!category) return next(new AppError('Category not found.', 404));
  res.json({ success: true, message: 'Category archived' });
});

// ---- Brand Management ----

// POST /api/v1/admin/brands
export const createBrand = asyncHandler(async (req, res) => {
  const { name, description, logo, website } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  const brand = await Brand.create({ name, slug, description, logo, website });
  res.status(201).json({ success: true, data: { brand } });
});

// PUT /api/v1/admin/brands/:id
export const updateBrand = asyncHandler(async (req, res, next) => {
  const data = req.body;
  if (data.name) data.slug = slugify(data.name, { lower: true, strict: true });

  const brand = await Brand.findByIdAndUpdate(req.params.id, data, {
    new: true, runValidators: true
  });
  if (!brand) return next(new AppError('Brand not found.', 404));
  res.json({ success: true, data: { brand } });
});

// ---- Inventory ----

// GET /api/v1/admin/inventory
export const getInventory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, lowStock } = req.query;
  const filter = { isActive: true };
  if (lowStock === 'true') filter.stock = { $lte: 5 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .select('title slug stock price images category brand')
    .populate('category', 'name')
    .populate('brand', 'name')
    .sort({ stock: 1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    data: {
      products,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    }
  });
});

// ---- Reviews ----

// GET /api/v1/admin/reviews
export const getAdminReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, approved } = req.query;
  const filter = {};
  if (approved === 'true') filter.isApproved = true;
  if (approved === 'false') filter.isApproved = false;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Review.countDocuments(filter);

  const reviews = await Review.find(filter)
    .populate('user', 'name email')
    .populate('product', 'title slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    data: {
      reviews,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    }
  });
});

// PATCH /api/v1/admin/reviews/:id
export const moderateReview = asyncHandler(async (req, res, next) => {
  const { isApproved } = req.body;
  const review = await Review.findByIdAndUpdate(req.params.id, { isApproved }, { new: true });
  if (!review) return next(new AppError('Review not found.', 404));
  res.json({ success: true, data: { review } });
});

// ---- Coupons ----

// GET /api/v1/admin/coupons
export const getAdminCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: { coupons } });
});

// POST /api/v1/admin/coupons
export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: { coupon } });
});

// ---- Newsletter ----

// GET /api/v1/admin/newsletter
export const getNewsletterSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await NewsletterSubscriber.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: { subscribers, count: subscribers.length } });
});
