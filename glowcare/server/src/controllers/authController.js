import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie
} from '../utils/tokens.js';

// POST /api/v1/auth/register
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return next(new AppError('An account with this email already exists.', 400));
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'customer'
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);
  setRefreshTokenCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken
    }
  });
});

// POST /api/v1/auth/login
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    return next(new AppError('Invalid email or password.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Account is suspended. Contact support.', 403));
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return next(new AppError('Invalid email or password.', 401));
  }

  user.lastLogin = new Date();
  await user.save();

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);
  setRefreshTokenCookie(res, refreshToken);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken
    }
  });
});

// POST /api/v1/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.refreshToken;
  if (rawToken) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await RefreshToken.deleteOne({ tokenHash });
  }
  clearRefreshTokenCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

// POST /api/v1/auth/refresh
export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const rawToken = req.cookies?.refreshToken;
  if (!rawToken) {
    return next(new AppError('No refresh token provided.', 401));
  }

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const storedToken = await RefreshToken.findOne({
    tokenHash,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });

  if (!storedToken) {
    clearRefreshTokenCookie(res);
    return next(new AppError('Invalid or expired refresh token.', 401));
  }

  const user = await User.findById(storedToken.user);
  if (!user || !user.isActive) {
    await RefreshToken.deleteOne({ _id: storedToken._id });
    clearRefreshTokenCookie(res);
    return next(new AppError('User not found or suspended.', 401));
  }

  // Rotate refresh token
  await RefreshToken.deleteOne({ _id: storedToken._id });
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = await generateRefreshToken(user);
  setRefreshTokenCookie(res, newRefreshToken);

  res.json({
    success: true,
    data: {
      accessToken: newAccessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

// POST /api/v1/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  // Generic response regardless of email existence
  const genericMsg = 'If an account exists with this email, a password reset link has been generated. Check the server console in development.';

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.json({ success: true, message: genericMsg });
  }

  const rawToken = await PasswordResetToken.createToken(user._id);

  // In production, send an email. In development, log the token.
  console.log(`\n[DEV] Password reset token for ${email}: ${rawToken}\n`);
  console.log(`[DEV] Reset URL: http://localhost:5173/reset-password?token=${rawToken}\n`);

  res.json({ success: true, message: genericMsg });
});

// POST /api/v1/auth/reset-password
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;

  const tokenDoc = await PasswordResetToken.verifyToken(token);
  if (!tokenDoc) {
    return next(new AppError('Invalid or expired reset token.', 400));
  }

  const user = await User.findById(tokenDoc.user);
  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  await user.save();

  tokenDoc.used = true;
  await tokenDoc.save();

  // Invalidate all refresh tokens
  await RefreshToken.deleteMany({ user: user._id });

  res.json({ success: true, message: 'Password reset successful. Please log in.' });
});

// GET /api/v1/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user }
  });
});

// PUT /api/v1/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (avatar !== undefined) updates.avatar = avatar;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true
  });

  res.json({ success: true, data: { user } });
});

// PUT /api/v1/auth/change-password
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+passwordHash');
  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return next(new AppError('Current password is incorrect.', 400));
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  // Invalidate all refresh tokens
  await RefreshToken.deleteMany({ user: user._id });

  res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
});

// POST /api/v1/auth/addresses
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = req.body;

  if (address.isDefault) {
    user.addresses.forEach(a => { a.isDefault = false; });
  }
  if (user.addresses.length === 0) {
    address.isDefault = true;
  }

  user.addresses.push(address);
  await user.save();

  res.status(201).json({ success: true, data: { user, addresses: user.addresses } });
});

// PUT /api/v1/auth/addresses/:addressId
export const updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) {
    return next(new AppError('Address not found.', 404));
  }

  Object.assign(address, req.body);
  if (req.body.isDefault) {
    user.addresses.forEach(a => {
      if (a._id.toString() !== address._id.toString()) {
        a.isDefault = false;
      }
    });
  }

  await user.save();
  res.json({ success: true, data: { addresses: user.addresses } });
});

// DELETE /api/v1/auth/addresses/:addressId
export const deleteAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) {
    return next(new AppError('Address not found.', 404));
  }

  address.deleteOne();
  await user.save();
  res.json({ success: true, data: { user, addresses: user.addresses } });
});
