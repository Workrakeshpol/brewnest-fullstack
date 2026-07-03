import type { CustomizationGroup } from '../components/product/CustomizationPanel';
import type { Review } from '../components/product/ReviewsSection';
import type { NutritionInfo } from '../components/product/NutritionPanel';

export interface ProductDetailData {
  gallery: { src: string; alt: string }[];
  customizations: CustomizationGroup[];
  nutrition: {
    servingSize: string;
    nutrients: NutritionInfo[];
  };
  reviews: Review[];
  ratingBreakdown: { stars: number; count: number; percentage: number }[];
}

/* ── Gallery images (shared, reused across products) ────────── */
const galleryImages = (main: string, name: string) => [
  { src: main, alt: name },
  { src: '/images/gallery-beans.jpg', alt: `${name} — beans` },
  { src: '/images/gallery-pour.jpg', alt: `${name} — preparation` },
  { src: '/images/gallery-overhead.jpg', alt: `${name} — overhead view` },
];

/* ── Customization groups ───────────────────────────────────── */
const beverageCustomizations: CustomizationGroup[] = [
  {
    id: 'size',
    label: 'Size',
    type: 'single',
    required: true,
    options: [
      { id: 'small', label: 'Small (8oz)', description: 'Classic size' },
      { id: 'medium', label: 'Medium (12oz)', description: 'Most popular', priceModifier: 0.5 },
      { id: 'large', label: 'Large (16oz)', description: 'For the extra boost', priceModifier: 1.0 },
    ],
  },
  {
    id: 'milk',
    label: 'Milk Choice',
    type: 'single',
    required: true,
    options: [
      { id: 'whole', label: 'Whole Milk' },
      { id: 'oat', label: 'Oat Milk', description: 'Barista edition' },
      { id: 'almond', label: 'Almond Milk' },
      { id: 'coconut', label: 'Coconut Milk' },
      { id: 'skim', label: 'Skim Milk' },
    ],
  },
  {
    id: 'syrup',
    label: 'Flavor Syrup',
    type: 'single',
    options: [
      { id: 'none', label: 'No syrup' },
      { id: 'vanilla', label: 'Vanilla', priceModifier: 0.75 },
      { id: 'caramel', label: 'Caramel', priceModifier: 0.75 },
      { id: 'hazelnut', label: 'Hazelnut', priceModifier: 0.75 },
      { id: 'lavender', label: 'Lavender Honey', priceModifier: 1.0 },
    ],
  },
  {
    id: 'extras',
    label: 'Extras',
    type: 'multiple',
    options: [
      { id: 'espresso-shot', label: 'Extra Espresso Shot', priceModifier: 1.0 },
      { id: 'whipped-cream', label: 'Whipped Cream', priceModifier: 0.5 },
      { id: 'cocoa', label: 'Cocoa Powder Dust', priceModifier: 0.25 },
      { id: 'ice', label: 'Over Ice', priceModifier: 0.0 },
    ],
  },
];

const foodCustomizations: CustomizationGroup[] = [
  {
    id: 'portion',
    label: 'Portion',
    type: 'single',
    required: true,
    options: [
      { id: 'regular', label: 'Regular' },
      { id: 'large', label: 'Large', priceModifier: 2.0 },
    ],
  },
  {
    id: 'extras',
    label: 'Add-ons',
    type: 'multiple',
    options: [
      { id: 'butter', label: 'Extra Butter', priceModifier: 0.5 },
      { id: 'jam', label: 'House Jam', priceModifier: 0.75 },
      { id: 'honey', label: 'Wildflower Honey', priceModifier: 0.5 },
    ],
  },
];

/* ── Reviews (shared pool, reused across products) ──────────── */
const sharedReviews: Review[] = [
  {
    id: 'r1',
    author: 'Emily Carter',
    rating: 5,
    date: '2 weeks ago',
    title: 'Absolutely perfect',
    body: "This has become my go-to order. The flavor is rich and balanced, and you can really taste the difference that fresh-roasted beans make. The baristas here genuinely care about every cup they make. I've been coming here for months and the quality is consistently outstanding. The atmosphere of the cafe complements the experience perfectly — warm, inviting, and never too loud. I always bring friends here when they visit Portland and every single one of them has been impressed.",
    helpfulCount: 34,
    verified: true,
  },
  {
    id: 'r2',
    author: 'Marcus Lee',
    rating: 5,
    date: '1 month ago',
    title: 'Best in Portland, hands down',
    body: "I've tried every specialty coffee shop in this city and BrewNest is in a league of its own. The attention to detail in every cup is remarkable. The beans are roasted in-house and you can taste the freshness. The staff are knowledgeable and happy to talk through the flavor notes. It's a bit more expensive than the chain places but absolutely worth every penny.",
    helpfulCount: 28,
    verified: true,
  },
  {
    id: 'r3',
    author: 'Sofia Ramirez',
    rating: 4,
    date: '1 month ago',
    title: 'Really good, small wait',
    body: "Great quality and the staff are lovely. Sometimes there's a bit of a wait during peak hours but it's understandable given everything is made to order. The flavor profile is excellent and I appreciate that they offer oat milk at no extra charge. Would give 5 stars if the line moved a bit faster!",
    helpfulCount: 15,
    verified: true,
  },
  {
    id: 'r4',
    author: 'James Okafor',
    rating: 5,
    date: '2 months ago',
    title: 'Converted me from tea',
    body: "I was never a coffee person until a friend dragged me here. The barista walked me through the options and recommended something perfect for my taste. Now I'm a regular. The space is cozy, the Wi-Fi is reliable, and the coffee is exceptional. The pastries are also worth trying — the almond croissant pairs beautifully.",
    helpfulCount: 22,
    verified: true,
  },
  {
    id: 'r5',
    author: 'Priya Sharma',
    rating: 4,
    date: '3 months ago',
    title: 'Delicious but pricey',
    body: "The quality is undeniable — you can taste the craft in every sip. It's definitely on the pricier side for daily coffee, so I treat it as a weekend indulgence. The seasonal offerings are always creative and worth trying. The lavender honey latte was a revelation.",
    helpfulCount: 9,
    verified: false,
  },
];

const sharedRatingBreakdown = [
  { stars: 5, count: 0, percentage: 0 },
  { stars: 4, count: 0, percentage: 0 },
  { stars: 3, count: 0, percentage: 0 },
  { stars: 2, count: 0, percentage: 0 },
  { stars: 1, count: 0, percentage: 0 },
];

/* ── Nutrition data per category ─────────────────────────────── */
const beverageNutrition = {
  servingSize: 'Per 12oz serving (medium)',
  nutrients: [
    { label: 'Total Fat', value: '4', unit: 'g', percent: 5 },
    { label: 'Saturated Fat', value: '2.5', unit: 'g', percent: 13 },
    { label: 'Trans Fat', value: '0', unit: 'g' },
    { label: 'Cholesterol', value: '15', unit: 'mg', percent: 5 },
    { label: 'Sodium', value: '45', unit: 'mg', percent: 2 },
    { label: 'Total Carbohydrate', value: '12', unit: 'g', percent: 4 },
    { label: 'Dietary Fiber', value: '0', unit: 'g', percent: 0 },
    { label: 'Total Sugars', value: '10', unit: 'g', percent: 20 },
    { label: 'Protein', value: '8', unit: 'g', percent: 16 },
    { label: 'Caffeine', value: '150', unit: 'mg' },
  ] as NutritionInfo[],
};

const foodNutrition = {
  servingSize: 'Per serving',
  nutrients: [
    { label: 'Total Fat', value: '14', unit: 'g', percent: 18 },
    { label: 'Saturated Fat', value: '6', unit: 'g', percent: 30 },
    { label: 'Trans Fat', value: '0', unit: 'g' },
    { label: 'Cholesterol', value: '35', unit: 'mg', percent: 12 },
    { label: 'Sodium', value: '380', unit: 'mg', percent: 17 },
    { label: 'Total Carbohydrate', value: '38', unit: 'g', percent: 14 },
    { label: 'Dietary Fiber', value: '4', unit: 'g', percent: 14 },
    { label: 'Total Sugars', value: '6', unit: 'g', percent: 12 },
    { label: 'Protein', value: '10', unit: 'g', percent: 20 },
  ] as NutritionInfo[],
};

const dessertNutrition = {
  servingSize: 'Per serving',
  nutrients: [
    { label: 'Total Fat', value: '18', unit: 'g', percent: 23 },
    { label: 'Saturated Fat', value: '11', unit: 'g', percent: 55 },
    { label: 'Trans Fat', value: '0', unit: 'g' },
    { label: 'Cholesterol', value: '65', unit: 'mg', percent: 22 },
    { label: 'Sodium', value: '180', unit: 'mg', percent: 8 },
    { label: 'Total Carbohydrate', value: '45', unit: 'g', percent: 16 },
    { label: 'Dietary Fiber', value: '2', unit: 'g', percent: 7 },
    { label: 'Total Sugars', value: '32', unit: 'g', percent: 64 },
    { label: 'Protein', value: '6', unit: 'g', percent: 12 },
  ] as NutritionInfo[],
};

/* ── Build per-product detail data ──────────────────────────── */
export function getProductDetail(
  productId: string,
  image: string,
  name: string,
  category: string,
  rating: number,
  reviewCount: number,
  calories: number,
): ProductDetailData {
  const isFood = ['breakfast', 'bakery', 'desserts'].includes(category);
  const isDessert = category === 'desserts';

  const nutrition = isDessert ? dessertNutrition : isFood ? foodNutrition : beverageNutrition;
  const customizations = isFood ? foodCustomizations : beverageCustomizations;

  // Calculate rating breakdown from rating and reviewCount
  const fullStars = Math.round(rating);
  const breakdown = sharedRatingBreakdown.map((tier) => {
    let count: number;
    if (tier.stars === 5) count = Math.round(reviewCount * 0.68);
    else if (tier.stars === 4) count = Math.round(reviewCount * 0.22);
    else if (tier.stars === 3) count = Math.round(reviewCount * 0.07);
    else if (tier.stars === 2) count = Math.round(reviewCount * 0.02);
    else count = Math.round(reviewCount * 0.01);
    return {
      stars: tier.stars,
      count,
      percentage: Math.round((count / reviewCount) * 100),
    };
  });

  return {
    gallery: galleryImages(image, name),
    customizations,
    nutrition: {
      servingSize: nutrition.servingSize,
      nutrients: nutrition.nutrients,
    },
    reviews: sharedReviews,
    ratingBreakdown: breakdown,
  };
}
