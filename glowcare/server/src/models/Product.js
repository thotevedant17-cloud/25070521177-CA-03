import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 5000
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0,
    default: null
  },
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    publicId: { type: String, default: '' }
  }],
  ingredients: {
    type: [String],
    default: []
  },
  skinTypes: {
    type: [String],
    enum: ['oily', 'dry', 'combination', 'normal', 'sensitive', 'all'],
    default: ['all']
  },
  concerns: {
    type: [String],
    enum: ['acne', 'dryness', 'oiliness', 'dullness', 'uneven-tone', 'dehydration', 'aging', 'dark-spots', 'pores', 'sensitivity', 'fine-lines', 'redness'],
    default: []
  },
  benefits: {
    type: [String],
    default: []
  },
  howToUse: {
    type: String,
    default: ''
  },
  warnings: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: ''
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalSold: {
    type: Number,
    default: 0,
    min: 0
  }
}, { timestamps: true });

productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ isActive: 1, isBestseller: 1 });
productSchema.index({ title: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
