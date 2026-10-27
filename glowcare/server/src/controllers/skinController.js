import SkinProfile from '../models/SkinProfile.js';
import SkincareRoutine from '../models/SkincareRoutine.js';
import Product from '../models/Product.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/v1/skin-quiz — Process quiz and return recommendations
export const submitSkinQuiz = asyncHandler(async (req, res) => {
  const {
    skinType,
    concerns,
    preferredCategories = [],
    excludedIngredients = [],
    fragranceSensitivity = 'none',
    budgetRange = { min: 0, max: 10000 },
    routineComplexity = 'moderate'
  } = req.body;

  // Save profile if authenticated
  if (req.user) {
    await SkinProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        skinType,
        concerns,
        preferredCategories,
        excludedIngredients,
        fragranceSensitivity,
        budgetRange,
        routineComplexity
      },
      { upsert: true, new: true }
    );
  }

  // Find matching products
  const recommendations = await getRecommendations({
    skinType, concerns, excludedIngredients, budgetRange, preferredCategories
  });

  // Generate routine
  const routine = generateRoutine(recommendations, routineComplexity);

  res.json({
    success: true,
    message: 'Skin quiz processed successfully',
    data: {
      skinProfile: { skinType, concerns, budgetRange, routineComplexity },
      recommendations,
      routine,
      disclaimer: 'These are cosmetic suggestions based on your quiz answers, not medical advice. Always patch-test new products and consult a dermatologist for skin conditions.'
    }
  });
});

// GET /api/v1/skin-profile
export const getSkinProfile = asyncHandler(async (req, res) => {
  const profile = await SkinProfile.findOne({ user: req.user._id });
  res.json({
    success: true,
    data: { profile }
  });
});

// PUT /api/v1/skin-profile
export const updateSkinProfile = asyncHandler(async (req, res) => {
  const profile = await SkinProfile.findOneAndUpdate(
    { user: req.user._id },
    { ...req.body, user: req.user._id },
    { upsert: true, new: true, runValidators: true }
  );
  res.json({ success: true, data: { profile } });
});

// GET /api/v1/recommendations
export const getPersonalizedRecommendations = asyncHandler(async (req, res, next) => {
  const profile = await SkinProfile.findOne({ user: req.user._id });
  if (!profile) {
    return next(new AppError('Please complete the skin quiz first.', 400));
  }

  const recommendations = await getRecommendations({
    skinType: profile.skinType,
    concerns: profile.concerns,
    excludedIngredients: profile.excludedIngredients,
    budgetRange: profile.budgetRange,
    preferredCategories: profile.preferredCategories
  });

  res.json({
    success: true,
    data: {
      recommendations,
      disclaimer: 'These are cosmetic suggestions, not medical advice. Patch-test new products and consult a dermatologist if needed.'
    }
  });
});

// GET /api/v1/routines
export const getRoutines = asyncHandler(async (req, res) => {
  const routines = await SkincareRoutine.find({ user: req.user._id })
    .populate('morningRoutine.product', 'title slug price images')
    .populate('eveningRoutine.product', 'title slug price images');

  res.json({ success: true, data: { routines } });
});

// POST /api/v1/routines
export const saveRoutine = asyncHandler(async (req, res) => {
  const { name, morningRoutine, eveningRoutine } = req.body;

  const routine = await SkincareRoutine.create({
    user: req.user._id,
    name: name || 'My Routine',
    morningRoutine: morningRoutine || [],
    eveningRoutine: eveningRoutine || []
  });

  res.status(201).json({ success: true, data: { routine } });
});

// PUT /api/v1/routines/:routineId
export const updateRoutine = asyncHandler(async (req, res, next) => {
  const routine = await SkincareRoutine.findOne({
    _id: req.params.routineId,
    user: req.user._id
  });

  if (!routine) {
    return next(new AppError('Routine not found.', 404));
  }

  Object.assign(routine, req.body);
  await routine.save();

  res.json({ success: true, data: { routine } });
});

// Helper: Get product recommendations based on profile
async function getRecommendations({ skinType, concerns, excludedIngredients, budgetRange, preferredCategories }) {
  const filter = {
    isActive: true,
    stock: { $gt: 0 },
    price: { $gte: budgetRange?.min || 0, $lte: budgetRange?.max || 99999 }
  };

  // Match skin type
  filter.$or = [
    { skinTypes: { $in: [skinType, 'all'] } },
    { skinTypes: { $size: 0 } }
  ];

  let products = await Product.find(filter)
    .populate('category', 'name slug parentCategory')
    .populate('brand', 'name slug')
    .lean();

  // Score and rank products
  const scored = products.map(product => {
    let score = 0;
    const reasons = [];

    // Skin type match
    if (product.skinTypes.includes(skinType)) {
      score += 30;
      reasons.push(`Suitable for ${skinType} skin`);
    } else if (product.skinTypes.includes('all')) {
      score += 15;
      reasons.push('Suitable for all skin types');
    }

    // Concern match
    const matchedConcerns = concerns.filter(c => product.concerns.includes(c));
    score += matchedConcerns.length * 20;
    if (matchedConcerns.length > 0) {
      reasons.push(`Addresses: ${matchedConcerns.join(', ')}`);
    }

    // Rating bonus
    if (product.rating >= 4) {
      score += 10;
      reasons.push(`Highly rated (${product.rating}★)`);
    }

    // Bestseller bonus
    if (product.isBestseller) {
      score += 5;
      reasons.push('Bestseller');
    }

    // Exclude products with excluded ingredients
    if (excludedIngredients && excludedIngredients.length > 0) {
      const hasExcluded = product.ingredients.some(ing =>
        excludedIngredients.some(ex =>
          ing.toLowerCase().includes(ex.toLowerCase())
        )
      );
      if (hasExcluded) {
        score = -1;
        reasons.length = 0;
        reasons.push('Contains excluded ingredients');
      }
    }

    return { ...product, score, matchReasons: reasons };
  });

  // Filter and sort
  return scored
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

// Helper: Generate routine from recommendations
function generateRoutine(recommendations, complexity) {
  const steps = {
    simple: {
      morning: ['Cleanser', 'Moisturizer', 'Sunscreen'],
      evening: ['Cleanser', 'Moisturizer']
    },
    moderate: {
      morning: ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen'],
      evening: ['Cleanser', 'Toner', 'Serum', 'Moisturizer']
    },
    comprehensive: {
      morning: ['Cleanser', 'Toner', 'Essence', 'Serum', 'Eye Cream', 'Moisturizer', 'Sunscreen'],
      evening: ['Cleanser', 'Exfoliator', 'Toner', 'Serum', 'Eye Cream', 'Night Cream', 'Face Oil']
    }
  };

  const routineSteps = steps[complexity] || steps.moderate;

  const assignProduct = (stepName) => {
    const match = recommendations.find(p => {
      const titleLower = p.title?.toLowerCase() || '';
      const catName = p.category?.name?.toLowerCase() || '';
      return titleLower.includes(stepName.toLowerCase()) || catName.includes(stepName.toLowerCase());
    });
    return match || null;
  };

  return {
    morning: routineSteps.morning.map((step, i) => ({
      order: i + 1,
      stepName: step,
      product: assignProduct(step),
      notes: ''
    })),
    evening: routineSteps.evening.map((step, i) => ({
      order: i + 1,
      stepName: step,
      product: assignProduct(step),
      notes: ''
    }))
  };
}
