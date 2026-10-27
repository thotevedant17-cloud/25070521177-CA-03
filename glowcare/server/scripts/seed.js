import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Category from '../src/models/Category.js';
import Brand from '../src/models/Brand.js';
import Product from '../src/models/Product.js';
import Coupon from '../src/models/Coupon.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/glowcare';

const categories = [
  { name: 'Cleansers', slug: 'cleansers', parentCategory: 'skincare', description: 'Gentle face cleansers for all skin types', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', sortOrder: 1 },
  { name: 'Serums', slug: 'serums', parentCategory: 'skincare', description: 'Targeted treatment serums', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', sortOrder: 2 },
  { name: 'Moisturizers', slug: 'moisturizers', parentCategory: 'skincare', description: 'Hydrating moisturizers', image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400', sortOrder: 3 },
  { name: 'Sunscreens', slug: 'sunscreens', parentCategory: 'skincare', description: 'Sun protection essentials', image: 'https://images.unsplash.com/photo-1532947974-2e3966eca5e5?w=400', sortOrder: 4 },
  { name: 'Face Masks', slug: 'face-masks', parentCategory: 'skincare', description: 'Rejuvenating face masks', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400', sortOrder: 5 },
  { name: 'Toners', slug: 'toners', parentCategory: 'skincare', description: 'Balancing skin toners', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400', sortOrder: 6 },
  { name: 'Eye Creams', slug: 'eye-creams', parentCategory: 'skincare', description: 'Under-eye care', image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=400', sortOrder: 7 },
  { name: 'Lipsticks', slug: 'lipsticks', parentCategory: 'makeup', description: 'Long-lasting lip colors', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400', sortOrder: 8 },
  { name: 'Foundations', slug: 'foundations', parentCategory: 'makeup', description: 'Flawless coverage foundations', image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400', sortOrder: 9 },
  { name: 'Blushes', slug: 'blushes', parentCategory: 'makeup', description: 'Natural-looking blush', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', sortOrder: 10 },
  { name: 'Mascaras', slug: 'mascaras', parentCategory: 'makeup', description: 'Volumizing mascaras', image: 'https://images.unsplash.com/photo-1631214500115-598fc2cb8ada?w=400', sortOrder: 11 },
  { name: 'Eyeliners', slug: 'eyeliners', parentCategory: 'makeup', description: 'Precision eyeliners', image: 'https://images.unsplash.com/photo-1512207128881-3c0aa8ba6880?w=400', sortOrder: 12 },
  { name: 'Eyeshadows', slug: 'eyeshadows', parentCategory: 'makeup', description: 'Vibrant eyeshadow palettes', image: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a07?w=400', sortOrder: 13 },
  { name: 'Concealers', slug: 'concealers', parentCategory: 'makeup', description: 'Full-coverage concealers', image: 'https://images.unsplash.com/photo-1599733589046-10c941eb3b65?w=400', sortOrder: 14 },
];

const brands = [
  { name: 'GlowCare Essentials', slug: 'glowcare-essentials', description: 'Our signature skincare line crafted for radiant skin' },
  { name: 'Petal Soft', slug: 'petal-soft', description: 'Nature-inspired gentle skincare' },
  { name: 'Derma Radiance', slug: 'derma-radiance', description: 'Dermatologist-recommended formulations' },
  { name: 'Luxe Beauty', slug: 'luxe-beauty', description: 'Premium luxury makeup collection' },
  { name: 'Pure Glow', slug: 'pure-glow', description: 'Clean beauty for conscious consumers' },
  { name: 'Velvet Touch', slug: 'velvet-touch', description: 'Silky smooth makeup formulas' },
  { name: 'Bloom Cosmetics', slug: 'bloom-cosmetics', description: 'Fresh and youthful beauty products' },
];

const seedProducts = (catMap, brandMap) => [
  // === SKINCARE PRODUCTS (12) ===
  {
    title: 'Gentle Hydrating Cleanser',
    slug: 'gentle-hydrating-cleanser',
    description: 'A soothing, pH-balanced cleanser that removes impurities without stripping natural moisture. Infused with hyaluronic acid and chamomile extract for a fresh, clean feeling.',
    brand: brandMap['GlowCare Essentials'],
    category: catMap['Cleansers'],
    price: 599,
    discountPrice: 499,
    images: [{ url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600', alt: 'Gentle Hydrating Cleanser' }],
    ingredients: ['Water', 'Glycerin', 'Hyaluronic Acid', 'Chamomile Extract', 'Aloe Vera', 'Cetearyl Alcohol'],
    skinTypes: ['all'],
    concerns: ['dryness', 'sensitivity'],
    benefits: ['Deeply cleanses', 'Maintains pH balance', 'Non-stripping formula'],
    howToUse: 'Apply to damp face, massage gently in circular motions for 30 seconds, rinse with lukewarm water. Use morning and evening.',
    warnings: 'For external use only. Discontinue if irritation occurs. Patch test before first use.',
    size: '150ml',
    stock: 45,
    isFeatured: true,
    isBestseller: true,
    rating: 4.5,
    reviewCount: 28,
    totalSold: 156
  },
  {
    title: 'Vitamin C Brightening Serum',
    slug: 'vitamin-c-brightening-serum',
    description: 'A potent 15% Vitamin C serum combined with ferulic acid and vitamin E to brighten dull skin, reduce dark spots, and protect against environmental damage.',
    brand: brandMap['Derma Radiance'],
    category: catMap['Serums'],
    price: 1299,
    discountPrice: 999,
    images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600', alt: 'Vitamin C Serum' }],
    ingredients: ['L-Ascorbic Acid (15%)', 'Ferulic Acid', 'Vitamin E', 'Hyaluronic Acid', 'Water', 'Propanediol'],
    skinTypes: ['normal', 'combination', 'oily'],
    concerns: ['dullness', 'uneven-tone', 'dark-spots'],
    benefits: ['Brightens complexion', 'Fades dark spots', 'Antioxidant protection', 'Boosts collagen'],
    howToUse: 'Apply 3-4 drops to clean, dry face in the morning. Follow with moisturizer and sunscreen.',
    warnings: 'Use sunscreen when using this product. May cause tingling on first use. Avoid mixing with retinol.',
    size: '30ml',
    stock: 32,
    isFeatured: true,
    isBestseller: true,
    isTrending: true,
    rating: 4.8,
    reviewCount: 64,
    totalSold: 312
  },
  {
    title: 'Deep Moisture Rich Cream',
    slug: 'deep-moisture-rich-cream',
    description: 'An ultra-nourishing moisturizer with shea butter, ceramides, and squalane that locks in hydration for up to 72 hours. Perfect for dry and dehydrated skin.',
    brand: brandMap['Petal Soft'],
    category: catMap['Moisturizers'],
    price: 899,
    discountPrice: null,
    images: [{ url: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600', alt: 'Deep Moisture Cream' }],
    ingredients: ['Shea Butter', 'Ceramide NP', 'Squalane', 'Glycerin', 'Niacinamide', 'Allantoin'],
    skinTypes: ['dry', 'normal', 'sensitive'],
    concerns: ['dryness', 'dehydration', 'sensitivity'],
    benefits: ['72-hour hydration', 'Strengthens skin barrier', 'Reduces flakiness'],
    howToUse: 'Apply generously to face and neck after serum. Use morning and night.',
    warnings: 'For external use only. Keep out of reach of children.',
    size: '50ml',
    stock: 55,
    isFeatured: true,
    rating: 4.6,
    reviewCount: 41,
    totalSold: 203
  },
  {
    title: 'Invisible Shield SPF 50+',
    slug: 'invisible-shield-spf50',
    description: 'A lightweight, invisible sunscreen that offers broad-spectrum SPF 50+ PA++++ protection. No white cast, non-greasy formula suitable for daily wear under makeup.',
    brand: brandMap['Derma Radiance'],
    category: catMap['Sunscreens'],
    price: 749,
    discountPrice: 649,
    images: [{ url: 'https://images.unsplash.com/photo-1532947974-2e3966eca5e5?w=600', alt: 'SPF 50 Sunscreen' }],
    ingredients: ['Ethylhexyl Methoxycinnamate', 'Zinc Oxide', 'Titanium Dioxide', 'Niacinamide', 'Aloe Extract'],
    skinTypes: ['all'],
    concerns: ['dark-spots', 'aging', 'sensitivity'],
    benefits: ['SPF 50+ PA++++', 'No white cast', 'Lightweight feel', 'Under-makeup friendly'],
    howToUse: 'Apply liberally 15 minutes before sun exposure. Reapply every 2-3 hours.',
    warnings: 'For external use only. Reapply after swimming or sweating.',
    size: '50ml',
    stock: 68,
    isBestseller: true,
    isTrending: true,
    rating: 4.7,
    reviewCount: 89,
    totalSold: 445
  },
  {
    title: 'Rose Clay Purifying Mask',
    slug: 'rose-clay-purifying-mask',
    description: 'A gentle clay mask infused with rose extract and kaolin clay that draws out impurities, minimizes pores, and leaves skin feeling soft and refreshed.',
    brand: brandMap['Pure Glow'],
    category: catMap['Face Masks'],
    price: 699,
    discountPrice: null,
    images: [{ url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600', alt: 'Rose Clay Mask' }],
    ingredients: ['Kaolin Clay', 'Rose Extract', 'Glycerin', 'Bentonite', 'Rosehip Oil', 'Vitamin E'],
    skinTypes: ['oily', 'combination', 'normal'],
    concerns: ['acne', 'oiliness', 'pores'],
    benefits: ['Purifies pores', 'Controls oil', 'Softens skin', 'Evens complexion'],
    howToUse: 'Apply a thin layer to clean face. Leave for 10-15 minutes. Rinse with warm water. Use 2-3 times per week.',
    warnings: 'Avoid eye area. Patch test recommended for sensitive skin.',
    size: '100ml',
    stock: 38,
    isNewArrival: true,
    rating: 4.3,
    reviewCount: 19,
    totalSold: 87
  },
  {
    title: 'Hyaluronic Acid Hydrating Toner',
    slug: 'hyaluronic-acid-hydrating-toner',
    description: 'A multi-weight hyaluronic acid toner that delivers deep hydration across skin layers. Alcohol-free formula that preps skin for better serum absorption.',
    brand: brandMap['GlowCare Essentials'],
    category: catMap['Toners'],
    price: 549,
    discountPrice: 449,
    images: [{ url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600', alt: 'Hyaluronic Acid Toner' }],
    ingredients: ['Multi-weight Hyaluronic Acid', 'Panthenol', 'Beta-Glucan', 'Centella Asiatica', 'Water'],
    skinTypes: ['all'],
    concerns: ['dehydration', 'dryness', 'dullness'],
    benefits: ['Deep hydration', 'Preps skin for serums', 'Alcohol-free', 'Plumps fine lines'],
    howToUse: 'After cleansing, pat onto damp face with hands or soak a cotton pad. Layer 2-3 times for extra hydration.',
    warnings: 'For external use only.',
    size: '200ml',
    stock: 42,
    isFeatured: true,
    isNewArrival: true,
    rating: 4.4,
    reviewCount: 33,
    totalSold: 178
  },
  {
    title: 'Retinol Renewal Eye Cream',
    slug: 'retinol-renewal-eye-cream',
    description: 'An advanced eye cream with encapsulated retinol and peptides that targets fine lines, dark circles, and puffiness around the delicate eye area.',
    brand: brandMap['Derma Radiance'],
    category: catMap['Eye Creams'],
    price: 999,
    discountPrice: null,
    images: [{ url: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=600', alt: 'Retinol Eye Cream' }],
    ingredients: ['Encapsulated Retinol', 'Peptide Complex', 'Caffeine', 'Vitamin K', 'Squalane'],
    skinTypes: ['normal', 'dry', 'combination'],
    concerns: ['aging', 'fine-lines', 'dark-spots'],
    benefits: ['Reduces fine lines', 'Minimizes dark circles', 'Firms eye area', 'Reduces puffiness'],
    howToUse: 'Gently dab a small amount around the eye area with ring finger. Use in the evening only.',
    warnings: 'Avoid direct eye contact. Use sunscreen during the day. Not recommended during pregnancy.',
    size: '15ml',
    stock: 22,
    isTrending: true,
    rating: 4.5,
    reviewCount: 27,
    totalSold: 134
  },
  {
    title: 'Niacinamide Pore Refining Serum',
    slug: 'niacinamide-pore-refining-serum',
    description: 'A 10% niacinamide serum with zinc that visibly reduces pore size, controls excess sebum, and improves skin texture for a smoother complexion.',
    brand: brandMap['GlowCare Essentials'],
    category: catMap['Serums'],
    price: 799,
    discountPrice: 699,
    images: [{ url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600', alt: 'Niacinamide Serum' }],
    ingredients: ['Niacinamide (10%)', 'Zinc PCA', 'Hyaluronic Acid', 'Panthenol', 'Water'],
    skinTypes: ['oily', 'combination', 'normal'],
    concerns: ['pores', 'oiliness', 'acne', 'uneven-tone'],
    benefits: ['Minimizes pores', 'Controls oil', 'Improves texture', 'Brightens skin'],
    howToUse: 'Apply 2-3 drops to clean face. Can be used morning and evening. Layer under moisturizer.',
    warnings: 'Patch test recommended. Avoid using with pure Vitamin C simultaneously.',
    size: '30ml',
    stock: 50,
    isBestseller: true,
    isNewArrival: true,
    rating: 4.6,
    reviewCount: 55,
    totalSold: 267
  },
  {
    title: 'Salicylic Acid Acne Cleanser',
    slug: 'salicylic-acid-acne-cleanser',
    description: 'A 2% salicylic acid cleanser that gently exfoliates, unclogs pores, and reduces breakouts while keeping skin balanced and hydrated.',
    brand: brandMap['Derma Radiance'],
    category: catMap['Cleansers'],
    price: 649,
    discountPrice: null,
    images: [{ url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600', alt: 'Salicylic Acid Cleanser' }],
    ingredients: ['Salicylic Acid (2%)', 'Tea Tree Oil', 'Green Tea Extract', 'Aloe Vera', 'Glycerin'],
    skinTypes: ['oily', 'combination'],
    concerns: ['acne', 'oiliness', 'pores'],
    benefits: ['Clears breakouts', 'Unclogs pores', 'Gentle exfoliation', 'Oil control'],
    howToUse: 'Massage onto wet face for 30-60 seconds, focusing on T-zone. Rinse thoroughly. Use once or twice daily.',
    warnings: 'May increase sun sensitivity. Use sunscreen. Start with once daily to build tolerance.',
    size: '120ml',
    stock: 35,
    rating: 4.2,
    reviewCount: 38,
    totalSold: 145
  },
  {
    title: 'Overnight Repair Sleeping Mask',
    slug: 'overnight-repair-sleeping-mask',
    description: 'A luxurious overnight mask that works while you sleep, delivering intensive hydration and repair with retinol, peptides, and centella asiatica.',
    brand: brandMap['Petal Soft'],
    category: catMap['Face Masks'],
    price: 849,
    discountPrice: 749,
    images: [{ url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600', alt: 'Sleeping Mask' }],
    ingredients: ['Centella Asiatica', 'Peptide Complex', 'Squalane', 'Niacinamide', 'Ceramides'],
    skinTypes: ['dry', 'normal', 'combination'],
    concerns: ['aging', 'dryness', 'dullness', 'fine-lines'],
    benefits: ['Overnight repair', 'Deep nourishment', 'Wake up with glowing skin'],
    howToUse: 'Apply as the last step of your evening routine. Leave on overnight. Rinse in the morning.',
    warnings: 'Avoid eye area. For external use only.',
    size: '80ml',
    stock: 28,
    isNewArrival: true,
    isTrending: true,
    rating: 4.7,
    reviewCount: 22,
    totalSold: 98
  },
  {
    title: 'Green Tea Calming Moisturizer',
    slug: 'green-tea-calming-moisturizer',
    description: 'A lightweight, soothing gel-cream moisturizer with green tea and aloe vera that calms irritation and provides balanced hydration without clogging pores.',
    brand: brandMap['Pure Glow'],
    category: catMap['Moisturizers'],
    price: 699,
    discountPrice: null,
    images: [{ url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600', alt: 'Green Tea Moisturizer' }],
    ingredients: ['Green Tea Extract', 'Aloe Vera', 'Centella Asiatica', 'Hyaluronic Acid', 'Jojoba Oil'],
    skinTypes: ['sensitive', 'combination', 'oily'],
    concerns: ['sensitivity', 'redness', 'acne'],
    benefits: ['Calms irritation', 'Lightweight hydration', 'Non-comedogenic', 'Anti-inflammatory'],
    howToUse: 'Apply to face and neck after serum. Use morning and evening.',
    warnings: 'For external use only. Discontinue if irritation occurs.',
    size: '50ml',
    stock: 40,
    rating: 4.4,
    reviewCount: 31,
    totalSold: 155
  },
  {
    title: 'AHA/BHA Exfoliating Toner',
    slug: 'aha-bha-exfoliating-toner',
    description: 'A gentle chemical exfoliating toner with glycolic acid and salicylic acid that refines skin texture, brightens, and prevents breakouts.',
    brand: brandMap['GlowCare Essentials'],
    category: catMap['Toners'],
    price: 649,
    discountPrice: 549,
    images: [{ url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600', alt: 'AHA BHA Toner' }],
    ingredients: ['Glycolic Acid (5%)', 'Salicylic Acid (0.5%)', 'Witch Hazel', 'Panthenol', 'Aloe Vera'],
    skinTypes: ['oily', 'combination', 'normal'],
    concerns: ['acne', 'dullness', 'uneven-tone', 'pores'],
    benefits: ['Gentle exfoliation', 'Brightens skin', 'Refines texture', 'Prevents breakouts'],
    howToUse: 'Apply to clean face with a cotton pad in the evening. Start 2-3 times per week, gradually increase.',
    warnings: 'Increases sun sensitivity. Always use sunscreen. Do not use with other active acids. Patch test first.',
    size: '150ml',
    stock: 30,
    isTrending: true,
    rating: 4.3,
    reviewCount: 42,
    totalSold: 189
  },

  // === MAKEUP PRODUCTS (12) ===
  {
    title: 'Velvet Matte Lipstick - Rose Petal',
    slug: 'velvet-matte-lipstick-rose-petal',
    description: 'A richly pigmented matte lipstick in a beautiful rose shade. Long-wearing, comfortable formula enriched with vitamin E for soft, supple lips.',
    brand: brandMap['Luxe Beauty'],
    category: catMap['Lipsticks'],
    price: 599,
    discountPrice: 499,
    images: [{ url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600', alt: 'Rose Petal Lipstick' }],
    ingredients: ['Ricinus Communis Oil', 'Vitamin E', 'Shea Butter', 'Candelilla Wax', 'Iron Oxides'],
    skinTypes: ['all'],
    concerns: [],
    benefits: ['Long-lasting color', '8-hour wear', 'Non-drying formula', 'Rich pigmentation'],
    howToUse: 'Apply directly to lips starting from the center. Blot with tissue for a more subtle look.',
    warnings: 'For lip use only. Keep cap tightly closed.',
    size: '3.5g',
    stock: 60,
    isFeatured: true,
    isBestseller: true,
    rating: 4.6,
    reviewCount: 73,
    totalSold: 389
  },
  {
    title: 'Flawless Finish Foundation - Medium',
    slug: 'flawless-finish-foundation-medium',
    description: 'A buildable medium-to-full coverage foundation with a natural satin finish. Enriched with hyaluronic acid for all-day hydration and a flawless look.',
    brand: brandMap['Velvet Touch'],
    category: catMap['Foundations'],
    price: 1199,
    discountPrice: 999,
    images: [{ url: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600', alt: 'Foundation Medium' }],
    ingredients: ['Water', 'Dimethicone', 'Hyaluronic Acid', 'Titanium Dioxide', 'Iron Oxides', 'Niacinamide'],
    skinTypes: ['all'],
    concerns: ['uneven-tone', 'dark-spots'],
    benefits: ['Buildable coverage', 'Satin finish', 'All-day wear', 'Hydrating formula'],
    howToUse: 'Apply with brush, sponge, or fingertips. Build coverage as desired. Set with powder for longer wear.',
    warnings: 'Test shade on jawline before purchase. For external use only.',
    size: '30ml',
    stock: 40,
    isFeatured: true,
    isTrending: true,
    rating: 4.5,
    reviewCount: 58,
    totalSold: 278
  },
  {
    title: 'Silk Glow Blush - Peach Kiss',
    slug: 'silk-glow-blush-peach-kiss',
    description: 'A silky, buildable powder blush in a warm peach tone with a subtle luminous finish. Blends seamlessly for a natural, healthy flush.',
    brand: brandMap['Bloom Cosmetics'],
    category: catMap['Blushes'],
    price: 499,
    discountPrice: null,
    images: [{ url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600', alt: 'Peach Blush' }],
    ingredients: ['Talc', 'Mica', 'Dimethicone', 'Iron Oxides', 'Vitamin E', 'Jojoba Oil'],
    skinTypes: ['all'],
    concerns: [],
    benefits: ['Natural flush', 'Buildable color', 'Luminous finish', 'Long-wearing'],
    howToUse: 'Smile and apply to the apples of cheeks, blending upward toward temples.',
    warnings: 'Avoid inhaling powder. Keep away from eyes.',
    size: '5g',
    stock: 50,
    isBestseller: true,
    isNewArrival: true,
    rating: 4.4,
    reviewCount: 35,
    totalSold: 167
  },
  {
    title: 'Lash Drama Volumizing Mascara',
    slug: 'lash-drama-volumizing-mascara',
    description: 'A high-impact volumizing mascara with a unique hourglass brush that lifts, separates, and dramatically thickens lashes without clumping.',
    brand: brandMap['Luxe Beauty'],
    category: catMap['Mascaras'],
    price: 699,
    discountPrice: 599,
    images: [{ url: 'https://images.unsplash.com/photo-1631214500115-598fc2cb8ada?w=600', alt: 'Volumizing Mascara' }],
    ingredients: ['Beeswax', 'Carnauba Wax', 'Iron Oxides', 'Panthenol', 'Keratin', 'Vitamin E'],
    skinTypes: ['all'],
    concerns: [],
    benefits: ['Dramatic volume', 'No clumping', 'Lash lifting effect', 'Smudge-proof'],
    howToUse: 'Start at the base of upper lashes and wiggle upward. Apply 2 coats for maximum drama.',
    warnings: 'Avoid contact with eyes. Remove with gentle makeup remover. Replace every 3 months.',
    size: '10ml',
    stock: 55,
    isFeatured: true,
    rating: 4.3,
    reviewCount: 47,
    totalSold: 234
  },
  {
    title: 'Precision Gel Eyeliner - Jet Black',
    slug: 'precision-gel-eyeliner-jet-black',
    description: 'An ultra-smooth gel eyeliner with intense black pigment. Waterproof, smudge-proof formula that glides on effortlessly for precise lines and smoky looks.',
    brand: brandMap['Velvet Touch'],
    category: catMap['Eyeliners'],
    price: 449,
    discountPrice: null,
    images: [{ url: 'https://images.unsplash.com/photo-1512207128881-3c0aa8ba6880?w=600', alt: 'Gel Eyeliner Black' }],
    ingredients: ['Cyclopentasiloxane', 'Trimethylsiloxysilicate', 'Synthetic Beeswax', 'Iron Oxides'],
    skinTypes: ['all'],
    concerns: [],
    benefits: ['Waterproof', 'Smudge-proof', 'Intense pigment', 'Easy application'],
    howToUse: 'Draw along the lash line from inner to outer corner. For smoky looks, smudge within 30 seconds.',
    warnings: 'Avoid inner lash line if sensitive. Remove with oil-based cleanser.',
    size: '1.2g',
    stock: 65,
    rating: 4.2,
    reviewCount: 29,
    totalSold: 145
  },
  {
    title: 'Sunset Dreams Eyeshadow Palette',
    slug: 'sunset-dreams-eyeshadow-palette',
    description: 'A curated palette of 12 warm-toned shades ranging from shimmer to matte. Highly pigmented, blendable formula for endless sunset-inspired eye looks.',
    brand: brandMap['Bloom Cosmetics'],
    category: catMap['Eyeshadows'],
    price: 1499,
    discountPrice: 1199,
    images: [{ url: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a07?w=600', alt: 'Eyeshadow Palette' }],
    ingredients: ['Mica', 'Talc', 'Dimethicone', 'Iron Oxides', 'Tin Oxide', 'Silica'],
    skinTypes: ['all'],
    concerns: [],
    benefits: ['12 versatile shades', 'Highly pigmented', 'Blendable', 'Long-wearing'],
    howToUse: 'Apply lighter shades as base, build depth with darker shades. Use damp brush for intense shimmer.',
    warnings: 'Avoid direct eye contact. For external use only.',
    size: '12 x 1.5g',
    stock: 25,
    isFeatured: true,
    isTrending: true,
    rating: 4.7,
    reviewCount: 62,
    totalSold: 198
  },
  {
    title: 'Perfect Cover Concealer - Light',
    slug: 'perfect-cover-concealer-light',
    description: 'A creamy, full-coverage concealer that hides dark circles, blemishes, and redness instantly. Crease-proof formula with a natural finish.',
    brand: brandMap['Velvet Touch'],
    category: catMap['Concealers'],
    price: 549,
    discountPrice: null,
    images: [{ url: 'https://images.unsplash.com/photo-1599733589046-10c941eb3b65?w=600', alt: 'Concealer Light' }],
    ingredients: ['Water', 'Cyclopentasiloxane', 'Titanium Dioxide', 'Iron Oxides', 'Hyaluronic Acid', 'Vitamin E'],
    skinTypes: ['all'],
    concerns: ['dark-spots', 'uneven-tone'],
    benefits: ['Full coverage', 'Crease-proof', 'Natural finish', 'Hydrating'],
    howToUse: 'Dot under eyes and on blemishes. Blend with sponge or fingertip. Set with powder for longevity.',
    warnings: 'Match shade in natural light. For external use only.',
    size: '6ml',
    stock: 45,
    isNewArrival: true,
    rating: 4.4,
    reviewCount: 33,
    totalSold: 156
  },
  {
    title: 'Velvet Matte Lipstick - Berry Crush',
    slug: 'velvet-matte-lipstick-berry-crush',
    description: 'A bold berry-toned matte lipstick with a velvety smooth finish. Lightweight, long-wearing formula that keeps lips comfortable all day.',
    brand: brandMap['Luxe Beauty'],
    category: catMap['Lipsticks'],
    price: 599,
    discountPrice: null,
    images: [{ url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600', alt: 'Berry Lipstick' }],
    ingredients: ['Ricinus Communis Oil', 'Vitamin E', 'Shea Butter', 'Candelilla Wax', 'Iron Oxides'],
    skinTypes: ['all'],
    concerns: [],
    benefits: ['Bold color payoff', 'Comfortable wear', 'Non-drying', 'Lightweight'],
    howToUse: 'Apply directly from the bullet or use a lip brush for precision. Line lips first for a defined look.',
    warnings: 'For lip use only.',
    size: '3.5g',
    stock: 48,
    rating: 4.5,
    reviewCount: 41,
    totalSold: 198
  },
  {
    title: 'Dewy Glass Foundation - Fair',
    slug: 'dewy-glass-foundation-fair',
    description: 'A lightweight, dewy foundation that gives a glass-skin finish. Infused with hyaluronic acid and pearl extracts for luminous, hydrated-looking skin.',
    brand: brandMap['Bloom Cosmetics'],
    category: catMap['Foundations'],
    price: 999,
    discountPrice: 849,
    images: [{ url: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600', alt: 'Dewy Foundation' }],
    ingredients: ['Water', 'Glycerin', 'Hyaluronic Acid', 'Pearl Extract', 'Dimethicone', 'Iron Oxides'],
    skinTypes: ['dry', 'normal'],
    concerns: ['dullness', 'dehydration'],
    benefits: ['Dewy glass finish', 'Lightweight feel', 'Hydrating', 'Natural coverage'],
    howToUse: 'Dot onto forehead, cheeks, nose, and chin. Blend with damp sponge for a seamless finish.',
    warnings: 'Test shade on jawline. May not suit very oily skin.',
    size: '30ml',
    stock: 30,
    isNewArrival: true,
    isTrending: true,
    rating: 4.6,
    reviewCount: 28,
    totalSold: 112
  },
  {
    title: 'Waterproof Micro Eyeliner - Brown',
    slug: 'waterproof-micro-eyeliner-brown',
    description: 'An ultra-fine felt-tip eyeliner in chocolate brown for precise, natural-looking lines. Waterproof and transfer-proof for all-day definition.',
    brand: brandMap['Luxe Beauty'],
    category: catMap['Eyeliners'],
    price: 399,
    discountPrice: 349,
    images: [{ url: 'https://images.unsplash.com/photo-1512207128881-3c0aa8ba6880?w=600', alt: 'Brown Eyeliner' }],
    ingredients: ['Water', 'Acrylates Copolymer', 'Iron Oxides', 'Phenoxyethanol'],
    skinTypes: ['all'],
    concerns: [],
    benefits: ['Micro-fine tip', 'Waterproof', 'Transfer-proof', 'Natural brown shade'],
    howToUse: 'Draw fine strokes along lash line. Build thickness as desired. Create wing at outer corner.',
    warnings: 'Avoid direct eye contact. Cap tightly after use to prevent drying.',
    size: '0.5ml',
    stock: 70,
    rating: 4.1,
    reviewCount: 24,
    totalSold: 123
  },
  {
    title: 'Natural Glow Blush - Mauve Dream',
    slug: 'natural-glow-blush-mauve-dream',
    description: 'A finely milled powder blush in a sophisticated mauve shade with a satin finish. Buildable formula for a natural, fresh-faced glow.',
    brand: brandMap['Velvet Touch'],
    category: catMap['Blushes'],
    price: 549,
    discountPrice: null,
    images: [{ url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600', alt: 'Mauve Blush' }],
    ingredients: ['Talc', 'Mica', 'Dimethicone', 'Iron Oxides', 'Silica', 'Vitamin E'],
    skinTypes: ['all'],
    concerns: [],
    benefits: ['Satin finish', 'Buildable', 'Finely milled', 'All-day wear'],
    howToUse: 'Tap excess powder off brush. Apply to cheekbones in sweeping motions.',
    warnings: 'Avoid inhaling. Keep away from eyes.',
    size: '5g',
    stock: 42,
    rating: 4.3,
    reviewCount: 18,
    totalSold: 87
  },
  {
    title: 'Ultra Volume Mascara - Waterproof',
    slug: 'ultra-volume-mascara-waterproof',
    description: 'A waterproof mascara that delivers extreme volume and length. Its unique fibered brush coats each lash from root to tip for an eye-opening effect.',
    brand: brandMap['Bloom Cosmetics'],
    category: catMap['Mascaras'],
    price: 599,
    discountPrice: null,
    images: [{ url: 'https://images.unsplash.com/photo-1631214500115-598fc2cb8ada?w=600', alt: 'Waterproof Mascara' }],
    ingredients: ['Beeswax', 'Carnauba Wax', 'Iron Oxides', 'Nylon Fibers', 'Panthenol'],
    skinTypes: ['all'],
    concerns: [],
    benefits: ['Waterproof', 'Extreme volume', 'Fibered formula', 'No flaking'],
    howToUse: 'Wiggle brush from roots to tips. Apply 2-3 coats. Remove with waterproof makeup remover.',
    warnings: 'Remove thoroughly before bed. Replace every 3 months.',
    size: '10ml',
    stock: 38,
    rating: 4.2,
    reviewCount: 31,
    totalSold: 145
  },
];

const coupons = [
  {
    code: 'GLOW10',
    description: '10% off on your first order',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 500,
    maxDiscount: 200,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    code: 'BEAUTY20',
    description: 'Flat ₹200 off on orders above ₹1500',
    discountType: 'fixed',
    discountValue: 200,
    minOrderAmount: 1500,
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    code: 'SKIN15',
    description: '15% off on skincare products',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 800,
    maxDiscount: 500,
    expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    isActive: true
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Category.bulkWrite(categories.map(category => ({
      updateOne: {
        filter: { slug: category.slug },
        update: { $set: category },
        upsert: true
      }
    })));
    const createdCategories = await Category.find({
      slug: { $in: categories.map(category => category.slug) }
    });
    const catMap = {};
    createdCategories.forEach(c => { catMap[c.name] = c._id; });

    await Brand.bulkWrite(brands.map(brand => ({
      updateOne: {
        filter: { slug: brand.slug },
        update: { $set: brand },
        upsert: true
      }
    })));
    const createdBrands = await Brand.find({
      slug: { $in: brands.map(brand => brand.slug) }
    });
    const brandMap = {};
    createdBrands.forEach(b => { brandMap[b.name] = b._id; });

    const productData = seedProducts(catMap, brandMap);
    await Product.bulkWrite(productData.map(product => ({
      updateOne: {
        filter: { slug: product.slug },
        update: { $set: product },
        upsert: true
      }
    })));

    await Coupon.bulkWrite(coupons.map(coupon => ({
      updateOne: {
        filter: { code: coupon.code },
        update: { $set: coupon },
        upsert: true
      }
    })));

    console.log('\nDatabase seeded successfully!');
    console.log(`   ${categories.length} categories`);
    console.log(`   ${brands.length} brands`);
    console.log(`   ${productData.length} products`);
    console.log(`   ${coupons.length} coupons\n`);

  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }

  process.exit(0);
}

seed();
