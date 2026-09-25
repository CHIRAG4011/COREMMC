/**
 * SecurityGuard — Client Component
 *
 * Injects client-side protections:
 * 1. DevTools opening detection & page wipe
 * 2. Right-click context menu disabled
 * 3. Keyboard shortcut blocking (F12, Ctrl+Shift+I, Ctrl+U, etc.)
 * 4. Text selection disabled
 * 5. Copy/Cut/Drag disabled
 * 6. Console warning & clear
 */

'use client';

import { useEffect } from 'react';
import { getProtectionScript } from '@/lib/security';

export function SecurityGuard() {
  useEffect(() => {
    // Execute the protection script
    const script = getProtectionScript();
    try {
      // Using Function constructor to execute in current scope
      const fn = new Function(script);
      fn();
    } catch {
      // Silently fail — protection is best-effort
    }
  }, []);

  return null; // No UI rendered
}