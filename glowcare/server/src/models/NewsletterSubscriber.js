import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', newsletterSchema);
export default NewsletterSubscriber;
