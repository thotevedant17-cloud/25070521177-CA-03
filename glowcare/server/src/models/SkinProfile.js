import mongoose from 'mongoose';

const skinProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skinType: {
    type: String,
    enum: ['oily', 'dry', 'combination', 'normal', 'sensitive'],
    required: true
  },
  concerns: {
    type: [String],
    enum: ['acne', 'dryness', 'oiliness', 'dullness', 'uneven-tone', 'dehydration', 'aging', 'dark-spots', 'pores', 'sensitivity', 'fine-lines', 'redness'],
    default: []
  },
  preferredCategories: {
    type: [String],
    default: []
  },
  excludedIngredients: {
    type: [String],
    default: []
  },
  fragranceSensitivity: {
    type: String,
    enum: ['none', 'mild', 'high'],
    default: 'none'
  },
  budgetRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 10000 }
  },
  routineComplexity: {
    type: String,
    enum: ['simple', 'moderate', 'comprehensive'],
    default: 'moderate'
  }
}, { timestamps: true });

const SkinProfile = mongoose.model('SkinProfile', skinProfileSchema);
export default SkinProfile;
