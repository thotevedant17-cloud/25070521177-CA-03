import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/v1/cart
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate({
      path: 'items.product',
      select: 'title slug price discountPrice images stock isActive'
    });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Calculate totals server-side
  let subtotal = 0;
  let discount = 0;
  const validItems = [];

  for (const item of cart.items) {
    if (!item.product || !item.product.isActive) continue;
    const effectivePrice = item.product.discountPrice || item.product.price;
    const originalPrice = item.product.price;
    const qty = Math.min(item.quantity, item.product.stock);
    
    if (qty > 0) {
      subtotal += effectivePrice * qty;
      discount += (originalPrice - effectivePrice) * qty;
      validItems.push({
        ...item.toObject(),
        effectivePrice,
        itemSubtotal: effectivePrice * qty,
        maxStock: item.product.stock
      });
    }
  }

  const shippingFee = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shippingFee;

  res.json({
    success: true,
    data: {
      cart: {
        _id: cart._id,
        items: validItems,
        itemCount: validItems.length,
        subtotal: Math.round(subtotal * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        shippingFee,
        total: Math.round(total * 100) / 100
      }
    }
  });
});

// POST /api/v1/cart/items
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return next(new AppError('Product not found or unavailable.', 404));
  }

  if (product.stock < quantity) {
    return next(new AppError(`Only ${product.stock} items available in stock.`, 400));
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(
    item => item.product.toString() === productId
  );

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > product.stock) {
      return next(new AppError(`Cannot add more. Only ${product.stock} in stock.`, 400));
    }
    if (newQty > 10) {
      return next(new AppError('Maximum 10 items per product allowed.', 400));
    }
    existingItem.quantity = newQty;
    existingItem.priceAtAdd = product.discountPrice || product.price;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      priceAtAdd: product.discountPrice || product.price
    });
  }

  await cart.save();
  
  // Return populated cart
  await cart.populate({
    path: 'items.product',
    select: 'title slug price discountPrice images stock isActive'
  });

  res.json({
    success: true,
    message: 'Item added to cart',
    data: { itemCount: cart.items.length }
  });
});

// PATCH /api/v1/cart/items/:itemId
export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new AppError('Cart not found.', 404));
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    return next(new AppError('Item not found in cart.', 404));
  }

  const product = await Product.findById(item.product);
  if (!product || product.stock < quantity) {
    return next(new AppError('Insufficient stock.', 400));
  }

  item.quantity = quantity;
  item.priceAtAdd = product.discountPrice || product.price;
  await cart.save();

  res.json({ success: true, message: 'Cart updated' });
});

// DELETE /api/v1/cart/items/:itemId
export const removeFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new AppError('Cart not found.', 404));
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    return next(new AppError('Item not found in cart.', 404));
  }

  item.deleteOne();
  await cart.save();

  res.json({ success: true, message: 'Item removed from cart', data: { itemCount: cart.items.length } });
});

// DELETE /api/v1/cart
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [] }
  );
  res.json({ success: true, message: 'Cart cleared' });
});
