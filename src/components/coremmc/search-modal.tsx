'use client';

import { useReducer, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  HelpCircle,
  Loader2,
  Package,
  FolderOpen,
  Globe,
  Cpu,
  CircuitBoard,
  Shield,
  ShieldCheck,
  Gamepad2,
  Server,
  HardDrive,
  Globe2,
  Bot,
  MessageCircle,
  Wrench,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { faqs } from '@/data/products';
import { useSiteData } from '@/contexts/site-data-context';
import type { SiteProduct, SiteCategory } from '@/contexts/site-data-context';

type IconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

const iconComponents: Record<string, IconComponent> = {
  Globe, Cpu, CircuitBoard, Shield, ShieldCheck, Gamepad2, Server,
  HardDrive, Globe2, Bot, MessageCircle, Wrench, HelpCircle, Package, FolderOpen,
};

function getDynamicIcon(name: string): IconComponent {
  return iconComponents[name] || Package;
}

interface SearchResult {
  type: 'product' | 'category' | 'faq';
  id: string;
  title: string;
  subtitle: string;
  slug?: string;
  iconName: string;
  color?: string;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-[#6366f1]/30 text-[#a5b4fc] rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function performSearch(query: string, products: SiteProduct[], categories: SiteCategory[]): SearchResult[] {
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  const matchedProducts = products
    .filter(
      (p) =>
        p.isActive &&
        (p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q))
    )
    .slice(0, 5);

  for (const p of matchedProducts) {
    const cat = categories.find((c) => c.id === p.categoryId);
    results.push({
      type: 'product',
      id: p.planId,
      title: p.name,
      subtitle: p.categoryName + ' · ₹' + p.price.toLocaleString('en-IN') + '/mo',
      slug: cat?.slug,
      iconName: cat?.icon || 'Package',
      color: cat?.color,
    });
  }

  const matchedCategories = categories
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    )
    .slice(0, 3);

  for (const c of matchedCategories) {
    results.push({
      type: 'category',
      id: c.id,
      title: c.name,
      subtitle: c.shortDescription,
      slug: c.slug,
      iconName: c.icon,
      color: c.color,
    });
  }

  const matchedFaqs = faqs
    .filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    )
    .slice(0, 3);

  for (let i = 0; i < matchedFaqs.length; i++) {
    const f = matchedFaqs[i];
    results.push({
      type: 'faq',
      id: 'faq-' + i,
      title: f.question,
      subtitle: f.answer.length > 60 ? f.answer.slice(0, 60) + '...' : f.answer,
      iconName: 'HelpCircle',
    });
  }

  return results;
}

// ── Reducer for all search modal state ─────────────────────────────────────
interface SearchModalState {
  query: string;
  debouncedQuery: string;
  activeIndex: number;
  isSearching: boolean;
  openGeneration: number;
}

type SearchModalAction =
  | { type: 'RESET' }
  | { type: 'SET_QUERY'; value: string }
  | { type: 'SET_DEBOUNCED_QUERY'; value: string }
  | { type: 'SET_SEARCHING'; value: boolean }
  | { type: 'SET_ACTIVE_INDEX'; index: number }
  | { type: 'MOVE_INDEX'; direction: 'up' | 'down'; max: number };

const initialState: SearchModalState = {
  query: '',
  debouncedQuery: '',
  activeIndex: -1,
  isSearching: false,
  openGeneration: 0,
};

function searchModalReducer(state: SearchModalState, action: SearchModalAction): SearchModalState {
  switch (action.type) {
    case 'RESET':
      return {
        ...initialState,
        openGeneration: state.openGeneration + 1,
      };
    case 'SET_QUERY':
      return { ...state, query: action.value, activeIndex: -1 };
    case 'SET_DEBOUNCED_QUERY':
      return { ...state, debouncedQuery: action.value };
    case 'SET_SEARCHING':
      return { ...state, isSearching: action.value };
    case 'SET_ACTIVE_INDEX':
      return { ...state, activeIndex: action.index };
    case 'MOVE_INDEX': {
      const { direction, max } = action;
      if (max === 0) return { ...state, activeIndex: -1 };
      const next = direction === 'down'
        ? (state.activeIndex < max - 1 ? state.activeIndex + 1 : 0)
        : (state.activeIndex > 0 ? state.activeIndex - 1 : max - 1);
      return { ...state, activeIndex: next };
    }
    default:
      return state;
  }
}

export function SearchModal() {
  const searchOpen = useAppStore((s) => s.searchOpen);
  const setSearchOpen = useAppStore((s) => s.setSearchOpen);
  const navigate = useAppStore((s) => s.navigate);
  const { categories, products } = useSiteData();

  const [state, dispatch] = useReducer(searchModalReducer, initialState);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSearchOpenRef = useRef(false);

  // Detect searchOpen transition from false→true, dispatch RESET
  useEffect(() => {
    if (searchOpen && !prevSearchOpenRef.current) {
      dispatch({ type: 'RESET' });
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    prevSearchOpenRef.current = searchOpen;
  }, [searchOpen]);

  // Global CMD+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  // Debounce query changes (called from event handler)
  const handleQueryChange = useCallback((value: string) => {
    dispatch({ type: 'SET_QUERY', value });
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (value.length >= 3) {
      dispatch({ type: 'SET_SEARCHING', value: true });
      debounceTimerRef.current = setTimeout(() => {
        dispatch({ type: 'SET_DEBOUNCED_QUERY', value });
        dispatch({ type: 'SET_SEARCHING', value: false });
      }, 300);
    } else {
      dispatch({ type: 'SET_DEBOUNCED_QUERY', value: '' });
      dispatch({ type: 'SET_SEARCHING', value: false });
    }
  }, []);

  // Clear query
  const handleClear = useCallback(() => {
    handleQueryChange('');
    inputRef.current?.focus();
  }, [handleQueryChange]);

  // Perform search from debounced query
  const results = useMemo(() => {
    if (state.debouncedQuery.length < 3) return [];
    return performSearch(state.debouncedQuery, products, categories);
  }, [state.debouncedQuery, products, categories]);

  // Group results by type
  const grouped = useMemo(() => {
    const groups: { label: string; icon: React.ReactNode; items: SearchResult[] }[] = [];
    const prodItems = results.filter((r) => r.type === 'product');
    const catItems = results.filter((r) => r.type === 'category');
    const faqItems = results.filter((r) => r.type === 'faq');

    if (prodItems.length > 0) {
      groups.push({
        label: 'Products',
        icon: <Package className="w-3.5 h-3.5 text-[#6366f1]" />,
        items: prodItems,
      });
    }
    if (catItems.length > 0) {
      groups.push({
        label: 'Categories',
        icon: <FolderOpen className="w-3.5 h-3.5 text-[#22c55e]" />,
        items: catItems,
      });
    }
    if (faqItems.length > 0) {
      groups.push({
        label: 'FAQs',
        icon: <HelpCircle className="w-3.5 h-3.5 text-[#f59e0b]" />,
        items: faqItems,
      });
    }

    return groups;
  }, [results]);

  // Flat list for keyboard navigation
  const flatItems = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  // Select a result
  const selectResult = useCallback(
    (result: SearchResult) => {
      if (result.type === 'product' && result.slug) {
        navigate('category', result.slug);
      } else if (result.type === 'category' && result.slug) {
        navigate('category', result.slug);
      } else if (result.type === 'faq') {
        navigate('home');
        setTimeout(() => {
          const faqEl = document.getElementById('faq');
          if (faqEl) faqEl.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      setSearchOpen(false);
    },
    [navigate, setSearchOpen]
  );

  // Keyboard navigation inside modal
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        dispatch({ type: 'MOVE_INDEX', direction: 'down', max: flatItems.length });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        dispatch({ type: 'MOVE_INDEX', direction: 'up', max: flatItems.length });
      } else if (e.key === 'Enter' && state.activeIndex >= 0 && flatItems[state.activeIndex]) {
        e.preventDefault();
        selectResult(flatItems[state.activeIndex]);
      }
    },
    [flatItems, state.activeIndex, selectResult, setSearchOpen]
  );

  // Scroll active item into view
  useEffect(() => {
    if (state.activeIndex < 0 || !resultsRef.current) return;
    const activeEl = resultsRef.current.querySelector(`[data-index="${state.activeIndex}"]`);
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
  }, [state.activeIndex]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          key={`search-${state.openGeneration}`}
          className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 search-backdrop-blur"
            onClick={() => setSearchOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.25 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-[95vw] max-w-2xl mt-[10vh] sm:mt-0 rounded-2xl overflow-hidden glass-noise"
            style={{
              background: 'rgba(18, 18, 26, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
            initial={{ opacity: 0, scale: 0.92, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
            onKeyDown={handleKeyDown}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <Search className="w-5 h-5 text-white/40 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={state.query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search products, categories, FAQs..."
                className="flex-1 bg-transparent text-lg text-white placeholder:text-white/30 outline-none"
                aria-label="Search"
              />
              {state.query.length > 0 && (
                <button
                  onClick={handleClear}
                  className="p-1 rounded-md text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-white/20 bg-white/5 rounded border border-white/10 shrink-0">
                ESC
              </kbd>
            </div>

            {/* Results Area */}
            <div
              ref={resultsRef}
              className="max-h-[60vh] overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.1) transparent',
              }}
            >
              {state.isSearching ? (
                <div className="flex items-center justify-center gap-2 py-12 text-white/40">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Searching...</span>
                </div>
              ) : state.debouncedQuery.length < 3 ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/30">
                  <Search className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">Type at least 3 characters to search</p>
                </div>
              ) : grouped.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/40">
                  <Search className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm font-medium">No results found</p>
                  <p className="text-xs text-white/20 mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="py-2">
                  {grouped.map((group) => {
                    const offset = flatItems.indexOf(group.items[0]);
                    return (
                      <div key={group.label} className="mb-1">
                        <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/30 uppercase tracking-wider">
                          {group.icon}
                          {group.label}
                        </div>
                        {group.items.map((resultItem, i) => {
                          const globalIndex = offset + i;
                          const isActive = globalIndex === state.activeIndex;
                          const IconComp = getDynamicIcon(resultItem.iconName);
                          return (
                            <button
                              key={resultItem.id}
                              data-index={globalIndex}
                              onClick={() => selectResult(resultItem)}
                              onMouseEnter={() => dispatch({ type: 'SET_ACTIVE_INDEX', index: globalIndex })}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 cursor-pointer ${
                                isActive
                                  ? 'bg-white/10 border-l-2 border-[#6366f1]'
                                  : 'hover:bg-white/5 border-l-2 border-transparent'
                              }`}
                            >
                              <div className="shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                {resultItem.type === 'faq' ? (
                                  <HelpCircle className="w-4 h-4 text-[#f59e0b]" />
                                ) : (
                                  <span style={resultItem.color ? { color: resultItem.color } : undefined}>
                                    <IconComp className="w-4 h-4" />
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white/90 truncate">
                                  {highlightMatch(resultItem.title, state.debouncedQuery)}
                                </p>
                                <p className="text-xs text-white/40 truncate mt-0.5">
                                  {resultItem.subtitle}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer keyboard hints */}
            {flatItems.length > 0 && (
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/5 text-[11px] text-white/20">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10 font-mono">↑</kbd>
                  <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10 font-mono">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10 font-mono">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10 font-mono">esc</kbd>
                  Close
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}