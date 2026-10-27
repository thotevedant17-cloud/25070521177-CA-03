import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: 100
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
    default: '',
    maxlength: 500
  },
  image: {
    type: String,
    default: ''
  },
  parentCategory: {
    type: String,
    enum: ['skincare', 'makeup', ''],
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

categorySchema.index({ parentCategory: 1 });

const Category = mongoose.model('Category', categorySchema);
export default Category;
