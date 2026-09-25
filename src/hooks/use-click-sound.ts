import { useCallback } from "react";
import {
  playClickSound,
  playCartSound,
  playBuySound,
  playNavSound,
} from "@/lib/sounds";

type ClickSoundType = "click" | "cart" | "buy" | "nav";

const soundMap: Record<ClickSoundType, () => void> = {
  click: playClickSound,
  cart: playCartSound,
  buy: playBuySound,
  nav: playNavSound,
};

export function useClickSound(type: ClickSoundType) {
  const playSound = useCallback(() => {
    soundMap[type]();
  }, [type]);

  return { playSound };
}