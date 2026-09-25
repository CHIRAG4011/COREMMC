import { useCartStore } from '@/store/use-cart-store';

export function useCartFly() {
  const startFly = (event: React.MouseEvent | MouseEvent, productName: string) => {
    const startX = event.clientX;
    const startY = event.clientY;

    const cartIcon =
      document.querySelector('[aria-label^="Cart"]') ||
      document.querySelector('[data-cart-icon]');

    if (!cartIcon) return;

    const rect = cartIcon.getBoundingClientRect();
    const endX = rect.left + rect.width / 2;
    const endY = rect.top + rect.height / 2;

    useCartStore.getState().triggerFlyAnimation(startX, startY, endX, endY, productName);
  };

  return { startFly };
}