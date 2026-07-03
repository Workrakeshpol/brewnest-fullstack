import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Section from '../components/ui/Section';
import Badge from '../components/ui/Badge';
import CategoryTabs from '../components/menu/CategoryTabs';
import MenuToolbar from '../components/menu/MenuToolbar';
import FilterBar from '../components/menu/FilterBar';
import ProductCard from '../components/menu/ProductCard';
import Pagination from '../components/menu/Pagination';
import EmptyState from '../components/menu/EmptyState';
import { categories as localCategories, menuItems as localItems } from '../data/menuData';
import { productsApi, categoriesApi } from '../lib/api';
import type { CategoryId, SortOption, FilterTag, MenuItem, Category } from '../types/menu';

const ITEMS_PER_PAGE = 9;

const allTags: FilterTag[] = [
  'vegan',
  'vegetarian',
  'gluten-free',
  'sugar-free',
  'hot',
  'iced',
  'signature',
  'seasonal',
];

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── State ──────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState<CategoryId>(
    (searchParams.get('category') as CategoryId) || 'all',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('popular');
  const [activeTags, setActiveTags] = useState<FilterTag[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch data from API (fallback to local data) ───────────
  const [apiItems, setApiItems] = useState<MenuItem[] | null>(null);
  const [apiCategories, setApiCategories] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        productsApi.list({ limit: 200 }),
        categoriesApi.list(),
      ]);

      if (productsResult?.items?.length) {
        const mapped: MenuItem[] = productsResult.items.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          longDescription: p.long_description || '',
          price: parseFloat(p.price),
          image: p.image,
          category: p.category,
          rating: parseFloat(p.rating) || 0,
          reviewCount: p.review_count || 0,
          calories: p.calories,
          prepTime: p.prep_time || '5 min',
          tags: Array.isArray(p.tags) ? p.tags : [],
          ingredients: Array.isArray(p.ingredients) ? p.ingredients : [],
          isPopular: p.is_popular || false,
          isNew: p.is_new || false,
        }));
        setApiItems(mapped);
      }

      if (Array.isArray(categoriesResult) && categoriesResult.length > 0) {
        const formatted: Category[] = [
          { id: 'all', label: 'All', icon: '🍽️' },
          ...categoriesResult.map((c: any) => ({
            id: c.id as CategoryId,
            label: c.label,
            icon: c.icon || '☕',
          })),
        ];
        setApiCategories(formatted);
      }
    } catch {
      // Fallback to local data — UI still works
      setApiItems(null);
      setApiCategories(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Use API data if available, otherwise local data
  const menuItems = apiItems || localItems;
  const categories = apiCategories || localCategories;

  // Sync category to URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (activeCategory !== 'all') params.category = activeCategory;
    setSearchParams(params, { replace: true });
  }, [activeCategory, setSearchParams]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, sortOption, activeTags]);

  // ── Filter + sort ──────────────────────────────────────────
  const filteredItems = useMemo(() => {
    let result = [...menuItems];

    // Category
    if (activeCategory !== 'all') {
      result = result.filter((item) => item.category === activeCategory);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.includes(query)),
      );
    }

    // Tags
    if (activeTags.length > 0) {
      result = result.filter((item) =>
        activeTags.every((tag) => item.tags.includes(tag)),
      );
    }

    // Sort
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name-az':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-za':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'popular':
      default:
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return result;
  }, [activeCategory, searchQuery, sortOption, activeTags]);

  // ── Pagination ─────────────────────────────────────────────
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ── Handlers ───────────────────────────────────────────────
  const handleToggleTag = (tag: FilterTag) => {
    setActiveTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag],
    );
  };

  const handleReset = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setActiveTags([]);
    setSortOption('popular');
    setCurrentPage(1);
  };

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────── */}
      <Section padding="lg" className="pt-32">
        <div className="text-center">
          <Badge variant="accent" size="md" className="mb-4">The Menu</Badge>
          <h1 className="font-serif text-4xl font-bold text-text sm:text-5xl">
            Crafted with Intention
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
            Every drink and dish is made to order with beans roasted within
            the week and ingredients sourced from local partners.
          </p>
        </div>
      </Section>

      {/* ── Category Tabs ─────────────────────────────────────── */}
      <Section padding="none" className="pb-4">
        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
        />
      </Section>

      {/* ── Toolbar (search + sort) ────────────────────────────── */}
      <Section padding="none" className="pb-4">
        <MenuToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={setSortOption}
          resultCount={filteredItems.length}
        />
      </Section>

      {/* ── Filter Bar ─────────────────────────────────────────── */}
      <Section padding="none" className="pb-8">
        <FilterBar
          availableTags={allTags}
          activeTags={activeTags}
          onToggleTag={handleToggleTag}
          onClearAll={() => setActiveTags([])}
        />
      </Section>

      {/* ── Product Grid ───────────────────────────────────────── */}
      <Section padding="none" className="pb-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="animate-pulse rounded-2xl border border-border bg-surface p-5 space-y-4">
                <div className="aspect-[4/3] w-full rounded-xl bg-border" />
                <div className="h-6 w-3/4 rounded bg-border" />
                <div className="h-4 w-1/2 rounded bg-border" />
                <div className="h-10 w-full rounded-full bg-border" />
              </div>
            ))}
          </div>
        ) : paginatedItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.map((item, i) => (
              <ProductCard key={item.id} item={item} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState onReset={handleReset} />
        )}
      </Section>

      {/* ── Pagination ─────────────────────────────────────────── */}
      {totalPages > 1 && (
        <Section padding="none" className="pb-16">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </Section>
      )}

      {/* ── Note ───────────────────────────────────────────────── */}
      <Section variant="muted" padding="md">
        <div className="text-center">
          <p className="text-sm text-text-muted">
            Oat, almond, and coconut milk available at no extra charge. Decaf
            options available for all espresso drinks. Ask your barista about
            today's single-origin selection.
          </p>
        </div>
      </Section>
    </>
  );
}
