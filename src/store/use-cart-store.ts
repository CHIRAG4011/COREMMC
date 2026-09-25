import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  planId: string;
  name: string;
  categoryName: string;
  categoryId: string;
  price: number;
  originalPrice: number | null;
  currency: string;
  quantity: number;
  selectedDuration: string;
}

export interface AppliedDiscount {
  discountId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  description: string;
}

interface CartState {
  items: CartItem[];
  cartOpen: boolean;
  cartToastName: string;
  flyAnimation: { id: string; startX: number; startY: number; endX: number; endY: number; productName: string } | null;
  appliedDiscount: AppliedDiscount | null;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (planId: string) => void;
  updateQuantity: (planId: string, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getDiscountedTotal: () => number;
  applyDiscount: (discount: AppliedDiscount) => void;
  removeDiscount: () => void;
  triggerFlyAnimation: (startX: number, startY: number, endX: number, endY: number, productName: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartOpen: false,
      cartToastName: '',
      flyAnimation: null,
      appliedDiscount: null,

      addToCart: (item) => {
        const { items } = get();
        const existing = items.find((i) => i.planId === item.planId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.planId === item.planId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
            cartToastName: `${item.name} (x${existing.quantity + 1})`,
          });
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
            cartToastName: item.name,
          });
        }
        setTimeout(() => set({ cartToastName: '' }), 2500);
      },

      removeFromCart: (planId) => {
        const { items, appliedDiscount } = get();
        const newItems = items.filter((i) => i.planId !== planId);
        // Remove discount if cart becomes empty
        set({
          items: newItems,
          appliedDiscount: newItems.length === 0 ? null : appliedDiscount,
        });
      },

      updateQuantity: (planId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((i) =>
            i.planId === planId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [], appliedDiscount: null }),
      setCartOpen: (open) => set({ cartOpen: open }),

      getTotalItems: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },

      getDiscountedTotal: () => {
        const total = get().getTotalPrice();
        const discount = get().appliedDiscount;
        if (!discount) return total;
        return Math.max(0, total - discount.discountAmount);
      },

      applyDiscount: (discount) => {
        set({ appliedDiscount: discount });
      },

      removeDiscount: () => {
        set({ appliedDiscount: null });
      },

      triggerFlyAnimation: (startX, startY, endX, endY, productName) => {
        const id = String(Date.now());
        set({ flyAnimation: { id, startX, startY, endX, endY, productName } });
        setTimeout(() => {
          set({ flyAnimation: null });
        }, 800);
      },
    }),
    {
      name: 'coremmc-cart',
      partialize: (state) => ({ items: state.items, appliedDiscount: state.appliedDiscount }),
    }
  )
);