/* ── Menu Type Definitions ─────────────────────────────────── */

export type CategoryId =
  | 'all'
  | 'coffee'
  | 'espresso'
  | 'latte'
  | 'mocha'
  | 'tea'
  | 'cold-coffee'
  | 'breakfast'
  | 'bakery'
  | 'desserts';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  image: string;
  category: Exclude<CategoryId, 'all'>;
  rating: number;
  reviewCount: number;
  calories?: number;
  prepTime: string;
  tags: string[];
  ingredients: string[];
  isPopular?: boolean;
  isNew?: boolean;
}

export type SortOption =
  | 'popular'
  | 'price-low'
  | 'price-high'
  | 'rating'
  | 'name-az'
  | 'name-za';

export type FilterTag =
  | 'vegan'
  | 'vegetarian'
  | 'gluten-free'
  | 'sugar-free'
  | 'hot'
  | 'iced'
  | 'signature'
  | 'seasonal';
