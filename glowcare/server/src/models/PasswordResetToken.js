import mongoose from 'mongoose';
import crypto from 'crypto';

const passwordResetTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tokenHash: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
passwordResetTokenSchema.index({ user: 1 });

passwordResetTokenSchema.statics.createToken = async function(userId) {
  // Invalidate previous tokens for this user
  await this.deleteMany({ user: userId });
  
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  
  await this.create({
    user: userId,
    tokenHash,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  });
  
  return rawToken;
};

passwordResetTokenSchema.statics.verifyToken = async function(rawToken) {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const tokenDoc = await this.findOne({
    tokenHash,
    used: false,
    expiresAt: { $gt: new Date() }
  });
  return tokenDoc;
};

const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
export default PasswordResetToken;
