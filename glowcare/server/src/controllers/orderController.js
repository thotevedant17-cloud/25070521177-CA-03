import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/v1/orders
export const createOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress: bodyAddress, shippingAddressId, contactEmail, paymentMethod = 'cod', couponCode, notes } = req.body;
  const userId = req.user._id;

  // Resolve shipping address — either from user's saved addresses or from direct input
  let shippingAddress = bodyAddress;
  if (shippingAddressId && !shippingAddress) {
    const user = await import('../models/User.js').then(m => m.default.findById(userId));
    const savedAddr = user?.addresses?.id(shippingAddressId);
    if (!savedAddr) {
      return next(new AppError('Selected address not found.', 400));
    }
    shippingAddress = {
      fullName: savedAddr.fullName || user.name,
      phone: savedAddr.phone || '',
      addressLine1: savedAddr.addressLine1,
      addressLine2: savedAddr.addressLine2 || '',
      city: savedAddr.city,
      state: savedAddr.state,
      postalCode: savedAddr.postalCode || savedAddr.pincode || '000000',
      country: savedAddr.country || 'India',
    };
  }
  
  if (!shippingAddress || !shippingAddress.fullName) {
    return next(new AppError('Shipping address is required.', 400));
  }

  const resolvedEmail = contactEmail || req.user.email;

  // Get cart
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return next(new AppError('Your cart is empty.', 400));
  }

  // Validate stock and build order items
  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = await Product.findById(item.product._id || item.product);
    if (!product || !product.isActive) {
      return next(new AppError(`Product "${item.product.title || 'Unknown'}" is no longer available.`, 400));
    }
    if (product.stock < item.quantity) {
      return next(new AppError(`"${product.title}" only has ${product.stock} in stock.`, 400));
    }

    const effectivePrice = product.discountPrice || product.price;
    const itemSubtotal = effectivePrice * item.quantity;
    subtotal += itemSubtotal;

    orderItems.push({
      product: product._id,
      title: product.title,
      slug: product.slug,
      image: product.images?.[0]?.url || '',
      price: product.price,
      discountPrice: product.discountPrice,
      quantity: item.quantity,
      subtotal: itemSubtotal
    });
  }

  // Apply coupon
  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (coupon) {
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return next(new AppError('Coupon usage limit reached.', 400));
      }
      if (subtotal < coupon.minOrderAmount) {
        return next(new AppError(`Minimum order amount for this coupon is ₹${coupon.minOrderAmount}.`, 400));
      }

      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      } else {
        discount = coupon.discountValue;
      }

      coupon.usedCount += 1;
      await coupon.save();
    }
  }

  const shippingFee = subtotal >= 999 ? 0 : 99;
  const total = subtotal - discount + shippingFee;

  // Deduct stock atomically
  for (const item of orderItems) {
    const result = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      {
        $inc: { stock: -item.quantity, totalSold: item.quantity }
      },
      { new: true }
    );
    if (!result) {
      // Rollback previous deductions
      for (const prev of orderItems) {
        if (prev.product.toString() === item.product.toString()) break;
        await Product.findByIdAndUpdate(prev.product, {
          $inc: { stock: prev.quantity, totalSold: -prev.quantity }
        });
      }
      return next(new AppError(`"${item.title}" went out of stock. Please refresh and try again.`, 400));
    }
  }

  // Create order
  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress,
    contactEmail: resolvedEmail,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    shippingFee,
    total: Math.round(total * 100) / 100,
    couponCode: couponCode?.toUpperCase() || null,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    orderStatus: 'confirmed',
    statusHistory: [{ status: 'confirmed', note: 'Order placed successfully' }],
    notes: notes || ''
  });

  // Clear cart
  cart.items = [];
  await cart.save();

  res.status(201).json({
    success: true,
    message: 'Order placed successfully!',
    data: { order }
  });
});

// GET /api/v1/orders/my-orders
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const total = await Order.countDocuments({ user: req.user._id });
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

// GET /api/v1/orders/:orderId
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId).lean();

  if (!order) {
    return next(new AppError('Order not found.', 404));
  }

  // Ensure user can only see their own orders (unless admin)
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to view this order.', 403));
  }

  res.json({ success: true, data: { order } });
});

// POST /api/v1/orders/:orderId/cancel
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return next(new AppError('Order not found.', 404));
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized.', 403));
  }

  if (!['pending', 'confirmed'].includes(order.orderStatus)) {
    return next(new AppError('This order cannot be cancelled.', 400));
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, totalSold: -item.quantity }
    });
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by customer' });
  await order.save();

  res.json({ success: true, message: 'Order cancelled successfully', data: { order } });
});
