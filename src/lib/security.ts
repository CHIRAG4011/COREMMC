/**
 * security.ts — Frontend Protection Utilities
 *
 * Provides ONLY:
 * 1. Frontend code stealing protection (right-click, keyboard shortcuts, text selection)
 *
 * Note: DevTools detection was removed because it caused false positives
 * on mobile browsers and embedded environments, showing "Access Denied"
 * to legitimate users.
 *
 * All protections are CLIENT-SIDE and applied via the SecurityGuard component.
 */

// =============================================================================
// Client-Side Protection Script
// =============================================================================

/**
 * Returns an inline script string that gets injected into the page.
 * Handles: right-click disable, keyboard shortcut blocking,
 * text selection disable, console clearing, and drag prevention.
 */
export function getProtectionScript(): string {
  return `
    (function() {
      'use strict';

      // ─── Disable Right-Click Context Menu ────────────────────────────
      document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
      });

      // ─── Block Keyboard Shortcuts ────────────────────────────────────
      document.addEventListener('keydown', function(e) {
        // F12
        if (e.key === 'F12') {
          e.preventDefault();
          return false;
        }
        // Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
          e.preventDefault();
          return false;
        }
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
          e.preventDefault();
          return false;
        }
        // Ctrl+Shift+C (Inspector)
        if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
          e.preventDefault();
          return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
          e.preventDefault();
          return false;
        }
        // Ctrl+S (Save Page)
        if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
          e.preventDefault();
          return false;
        }
        // Ctrl+Shift+K (Firefox Web Console)
        if (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
          e.preventDefault();
          return false;
        }
        // Cmd+Option+I (Mac DevTools)
        if (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i')) {
          e.preventDefault();
          return false;
        }
        // Cmd+Option+J (Mac Console)
        if (e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j')) {
          e.preventDefault();
          return false;
        }
        // Cmd+Option+U (Mac View Source)
        if (e.metaKey && (e.key === 'U' || e.key === 'u')) {
          e.preventDefault();
          return false;
        }
      }, true);

      // ─── Disable Text Selection ──────────────────────────────────────
      document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
      });

      // ─── Disable Drag ────────────────────────────────────────────────
      document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
      });

      // ─── Disable Copy/Cut/Paste ──────────────────────────────────────
      document.addEventListener('copy', function(e) {
        e.preventDefault();
        return false;
      });
      document.addEventListener('cut', function(e) {
        e.preventDefault();
        return false;
      });

      // ─── Clear Console on Load ───────────────────────────────────────
      try { console.clear(); } catch(e) {}
      try {
        console.log('%c⚠ STOP!', 'color: red; font-size: 48px; font-weight: bold;');
        console.log('%cThis is a browser feature intended for developers.', 'font-size: 18px;');
        console.log('%cIf someone told you to paste something here, it is a scam.', 'font-size: 16px; color: red;');
        console.clear();
      } catch(e) {}

      // ─── Prevent View Source via URL ─────────────────────────────────
      if (window.location.href.indexOf('view-source:') === 0) {
        window.location.href = '/';
      }
    })();
  `;
}