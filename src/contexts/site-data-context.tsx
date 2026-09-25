'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

// ── Types ────────────────────────────────────────────────────────────────

export interface SiteProduct {
  id: string;
  planId: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  originalPrice: number | null;
  isActive: boolean;
  isPopular: boolean;
  badge: string;
  specs: Record<string, string>;
  features: string[];
  support: string;
  location: string;
  setup: string;
  order: number;
  imageUrl: string;
}

export interface SiteCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  icon: string;
  color: string;
  order: number;
  featured: boolean;
  active: boolean;
  imageUrl: string;
}

interface SiteDataContextValue {
  categories: SiteCategory[];
  products: SiteProduct[];
  loading: boolean;
  getCategoryBySlug: (slug: string) => SiteCategory | undefined;
  getProductsByCategory: (categorySlug: string) => SiteProduct[];
  getPopularProducts: () => SiteProduct[];
  refresh: () => Promise<void>;
}

// ── Context ──────────────────────────────────────────────────────────────

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [products, setProducts] = useState<SiteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Keep a ref so the visibility handler always calls the latest logic
  const fetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    // Prevent duplicate in-flight requests
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const [catRes, prodRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
      ]);

      const catData = await catRes.json();
      const prodData = await prodRes.json();

      setCategories(catData.categories ?? []);
      setProducts(prodData.products ?? []);
    } catch (error) {
      console.error('Failed to fetch site data:', error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Re-fetch when the tab becomes visible again
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchData]);

  // ── Helpers ──────────────────────────────────────────────────────────

  const getCategoryBySlug = useCallback(
    (slug: string) => categories.find((c) => c.slug === slug),
    [categories],
  );

  const getProductsByCategory = useCallback(
    (categorySlug: string) => {
      const cat = categories.find((c) => c.slug === categorySlug);
      if (!cat) return [];
      return products
        .filter((p) => p.categoryId === cat.id && p.isActive)
        .sort((a, b) => a.order - b.order);
    },
    [categories, products],
  );

  const getPopularProducts = useCallback(
    () => products.filter((p) => p.isPopular),
    [products],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchData();
  }, [fetchData]);

  // ── Value ────────────────────────────────────────────────────────────

  const value: SiteDataContextValue = {
    categories,
    products,
    loading,
    getCategoryBySlug,
    getProductsByCategory,
    getPopularProducts,
    refresh,
  };

  return (
    <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────

export function useSiteData(): SiteDataContextValue {
  const ctx = useContext(SiteDataContext);
  if (!ctx) {
    throw new Error('useSiteData must be used within a <SiteDataProvider>');
  }
  return ctx;
}