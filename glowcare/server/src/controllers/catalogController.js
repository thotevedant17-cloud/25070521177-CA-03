import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// GET /api/v1/categories
export const getCategories = asyncHandler(async (req, res) => {
  const { parent } = req.query;
  const filter = { isActive: true };
  if (parent) filter.parentCategory = parent;

  const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
  res.json({ success: true, data: { categories } });
});

// GET /api/v1/categories/:slug
export const getCategoryBySlug = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) return next(new AppError('Category not found.', 404));
  res.json({ success: true, data: { category } });
});

// GET /api/v1/brands
export const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isActive: true }).sort({ name: 1 }).lean();
  res.json({ success: true, data: { brands } });
});

// GET /api/v1/brands/:slug
export const getBrandBySlug = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findOne({ slug: req.params.slug, isActive: true });
  if (!brand) return next(new AppError('Brand not found.', 404));
  res.json({ success: true, data: { brand } });
});

// POST /api/v1/newsletter/subscribe
export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true;
      await existing.save();
    }
    return res.json({ success: true, message: 'You are subscribed to our newsletter!' });
  }

  await NewsletterSubscriber.create({ email: email.toLowerCase() });
  res.status(201).json({ success: true, message: 'Successfully subscribed to the newsletter!' });
});
