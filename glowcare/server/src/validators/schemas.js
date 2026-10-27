import { z } from 'zod';
import AppError from '../utils/AppError.js';

// Generic validation middleware factory
export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const messages = err.issues.map(i => i.message).join('. ');
      return next(new AppError(messages, 400));
    }
    next(err);
  }
};

// Auth Schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please provide a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  avatar: z.string().optional()
});

// Product Schemas
export const productSchema = z.object({
  title: z.string().min(2, 'Title is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  brand: z.string().min(1, 'Brand is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be positive'),
  discountPrice: z.number().positive().nullable().optional(),
  ingredients: z.array(z.string()).optional(),
  skinTypes: z.array(z.string()).optional(),
  concerns: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  howToUse: z.string().optional(),
  warnings: z.string().optional(),
  size: z.string().optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  isFeatured: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isActive: z.boolean().optional()
});

// Skin Quiz Schema
export const skinQuizSchema = z.object({
  skinType: z.enum(['oily', 'dry', 'combination', 'normal', 'sensitive']),
  concerns: z.array(z.string()).min(1, 'Select at least one concern'),
  preferredCategories: z.array(z.string()).optional(),
  excludedIngredients: z.array(z.string()).optional(),
  fragranceSensitivity: z.enum(['none', 'mild', 'high']).optional(),
  budgetRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().positive().optional()
  }).optional(),
  routineComplexity: z.enum(['simple', 'moderate', 'comprehensive']).optional()
});

// Order Schema
export const createOrderSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    phone: z.string().min(10, 'Phone number is required'),
    addressLine1: z.string().min(5, 'Address is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().min(5, 'Postal code is required'),
    country: z.string().optional()
  }),
  contactEmail: z.string().email('Valid email required'),
  paymentMethod: z.enum(['cod', 'demo-card', 'upi']).optional(),
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional()
});

// Review Schema
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().max(200).optional(),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(2000)
});

// Newsletter Schema
export const newsletterSchema = z.object({
  email: z.string().email('Please provide a valid email')
});

// Cart Schema
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1).max(10).optional()
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(10, 'Quantity must be between 1 and 10')
});

// Address Schema
export const addressSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Phone is required'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(5, 'Postal code is required'),
  country: z.string().optional(),
  isDefault: z.boolean().optional()
});
