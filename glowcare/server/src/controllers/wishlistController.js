import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/v1/wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const items = await Wishlist.find({ user: req.user._id })
    .populate({
      path: 'product',
      select: 'title slug price discountPrice images stock isActive rating brand category',
      populate: [
        { path: 'brand', select: 'name slug' },
        { path: 'category', select: 'name slug' }
      ]
    })
    .sort({ createdAt: -1 });

  const validItems = items.filter(item => item.product && item.product.isActive);

  res.json({
    success: true,
    data: { wishlist: validItems, count: validItems.length }
  });
});

// POST /api/v1/wishlist/:productId
export const addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return next(new AppError('Product not found.', 404));
  }

  const existing = await Wishlist.findOne({
    user: req.user._id,
    product: productId
  });

  if (existing) {
    return res.json({ success: true, message: 'Already in wishlist' });
  }

  await Wishlist.create({ user: req.user._id, product: productId });

  const count = await Wishlist.countDocuments({ user: req.user._id });
  res.status(201).json({ success: true, message: 'Added to wishlist', data: { count } });
});

// DELETE /api/v1/wishlist/:productId
export const removeFromWishlist = asyncHandler(async (req, res) => {
  await Wishlist.findOneAndDelete({
    user: req.user._id,
    product: req.params.productId
  });

  const count = await Wishlist.countDocuments({ user: req.user._id });
  res.json({ success: true, message: 'Removed from wishlist', data: { count } });
});
