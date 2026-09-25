# CoreMMC — Full Deployment & Fix Guide

> **Last Updated:** July 2025
> **Deployment URL:** https://coremmc.cloud
> **Stack:** Next.js 16 (App Router) + TypeScript + Firebase + Prisma (SQLite) + Tailwind CSS 4 + shadcn/ui

---

## Table of Contents

1. [Already Applied Fixes](#1-already-applied-fixes)
2. [Deployment Checklist](#2-deployment-checklist)
3. [Required Files for Netlify](#3-required-files-for-netlify)
4. [Environment Variables](#4-environment-variables)
5. [Firestore Collections Setup](#5-firestore-collections-setup)
6. [Pending Fixes & Enhancements](#6-pending-fixes--enhancements)
7. [Known Issues & Workarounds](#7-known-issues--workarounds)
8. [Common Deployment Errors](#8-common-deployment-errors)

---

## 1. Already Applied Fixes

These changes are already in the codebase. Make sure your deployed version includes them.

### 1.1 Removed `XTransformPort` from Admin Dashboard

**File:** `src/components/coremmc/admin-dashboard.tsx`

```diff
- const res = await fetch('/api/admin/dashboard-stats?XTransformPort=3000');
+ const res = await fetch('/api/admin/dashboard-stats');
```

> `XTransformPort` is a sandbox-only gateway parameter. It causes 500 errors on Netlify.

### 1.2 Fixed `service-account.json` Path in All API Routes

**Files (11 total):**

| File |
|------|
| `src/app/api/activity-logs/route.ts` |
| `src/app/api/notifications/route.ts` |
| `src/app/api/orders/route.ts` |
| `src/app/api/orders/update-payment-info/route.ts` |
| `src/app/api/settings/payment-url/route.ts` |
| `src/app/api/settings/qr-payment-url/route.ts` |
| `src/app/api/admin/dashboard-stats/route.ts` |
| `src/app/api/admin/discounts/route.ts` |
| `src/app/api/admin/notifications/route.ts` |
| `src/app/api/admin/orders/route.ts` |
| `src/app/api/admin/orders/approve/route.ts` |

**Change applied to each:**

```diff
+ import { join } from 'path';

  function getAdminDb() {
    if (!getApps().length) {
-     const sa = JSON.parse(readFileSync('service-account.json', 'utf8'));
+     const sa = JSON.parse(readFileSync(join(process.cwd(), 'service-account.json'), 'utf8'));
      initializeApp({ credential: cert(sa) });
    }
    return getFirestore();
  }
```

> Relative path `readFileSync('service-account.json')` fails on Netlify serverless functions because the working directory differs. `process.cwd()` resolves to the project root.

### 1.3 Fixed Firestore Timestamp Serialization

**File:** `src/app/api/admin/dashboard-stats/route.ts`

```diff
  createdAt: data.createdAt || '',
+ // Handle Firestore Timestamp → ISO string
+ let createdAt = '';
+ if (data.createdAt) {
+   const t = data.createdAt;
+   createdAt = typeof t?.toDate === 'function'
+     ? t.toDate().toISOString()
+     : (typeof t === 'string' ? t : new Date(t).toISOString());
+ }
```

> Firestore `Timestamp` objects don't serialize to JSON. They become `{seconds: ..., nanoseconds: ...}` which breaks `formatRelativeTime()`.

### 1.4 Removed SSR Guard (Spinner-Only Render)

**File:** `src/app/page.tsx`

```diff
- import React, { lazy, Suspense, useEffect, useSyncExternalStore } from 'react';
+ import React, { lazy, Suspense, useEffect } from 'react';

  // Removed: useSyncExternalStore SSR guard that rendered only a spinner
  // The full page now renders on both server and client
```

> The `useSyncExternalStore` trick prevented the server from rendering any content. If client-side JS had any loading delay, users saw a blank dark page.

### 1.5 Navbar Centering

**File:** `src/components/coremmc/navbar.tsx`

```diff
  <header
    className={cn(
-     'fixed top-0 left-0 right-0 z-50 transition-transform ...',
+     'fixed top-0 inset-x-0 z-50 flex justify-center transition-transform ...',
      visible ? 'translate-y-0' : '-translate-y-full'
    )}
  >
    <nav
      className={cn(
-       'mx-4 sm:mx-6 lg:mx-8 mt-2 flex h-[68px] ...',
+       'relative mt-2 flex h-[68px] max-w-7xl ...',
        'bg-[rgba(10,10,15,0.85)] backdrop-blur-[12px]',
        'border border-[rgba(255,255,255,0.06)] rounded-full'
      )}
+     style={{ width: '100%', maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto' }}
    >
```

### 1.6 Domains Icon Alignment

**File:** `src/components/coremmc/navbar.tsx`

```diff
  <NavigationMenuLink
    className={cn(
      '...',
-     'h-9 inline-flex items-center justify-center ...',
+     'h-9 inline-flex flex-row items-center justify-center ...',
    )}
  >
```

> The base `NavigationMenuLink` component has `flex-col` which stacked icon above text. Added `flex-row` to override.

---

## 2. Deployment Checklist

Before deploying to Netlify, verify:

- [ ] All fixes from Section 1 are applied
- [ ] `service-account.json` exists in project root (NOT in `.gitignore`)
- [ ] `.env` variables are set in Netlify dashboard (Site Settings → Environment Variables)
- [ ] `public/` folder contains all assets:
  - [ ] `coremmc-icon.png`
  - [ ] `coremmc-icon.svg`
  - [ ] `terminal-card.png`
  - [ ] `header/frames/frame_000000.png` through `frame_000009.png` (or all 235 frames)
- [ ] Prisma schema is correct
- [ ] `npm run lint` passes with no errors
- [ ] Firebase project has all required collections (see Section 5)
- [ ] `next.config.ts` output is configured for Netlify

### Netlify Build Settings

```
Build command:    npm run build
Publish directory: .next
```

> **Important:** Next.js on Netlify requires `@netlify/plugin-nextjs`. Install it:
> ```
> npm install -D @netlify/plugin-nextjs
> ```
> And add to `netlify.toml`:
> ```toml
> [[plugins]]
> package = "@netlify/plugin-nextjs"
> ```

---

## 3. Required Files for Netlify

These files MUST be in your deployment (committed to Git):

```
project-root/
├── service-account.json          ← Firebase Admin SDK credentials
├── .env                           ← Environment variables
├── next.config.ts
├── package.json
├── prisma/
│   └── schema.prisma
├── db/
│   └── custom.db                  ← SQLite database (if using Prisma)
├── public/
│   ├── coremmc-icon.png
│   ├── coremmc-icon.svg
│   ├── terminal-card.png
│   └── header/frames/             ← Hero animation frames
└── src/
    └── ... (all source code)
```

### `.gitignore` — Do NOT ignore these:

```gitignore
# KEEP these in your repo:
# service-account.json      ← DO NOT ignore this
# public/                    ← DO NOT ignore assets

# Standard ignores:
node_modules/
.next/
.env.local
```

> **Warning:** `service-account.json` contains sensitive credentials. If your repo is public, use Netlify Environment Variables instead (see Section 4).

---

## 4. Environment Variables

Set these in **Netlify Dashboard → Site Settings → Environment Variables**:

```env
DATABASE_URL=file:./db/custom.db
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBW1KUytxrMHY15UaXzcdWbH5Myei44Z2I
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=coremmc-hosting-v1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=coremmc-hosting-v1
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=coremmc-hosting-v1.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=599224638089
NEXT_PUBLIC_FIREBASE_APP_ID=1:599224638089:web:843ed93edfa7e49dde4458
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-SX8JKYQW8W
```

---

## 5. Firestore Collections Setup

Your Firebase project needs these collections in Firestore:

| Collection | Purpose | Key Fields |
|---|---|---|
| `users` | User profiles | `uid`, `email`, `displayName`, `role`, `isActive`, `createdAt` |
| `products` | Hosting plans | `name`, `price`, `category`, `features`, `order` |
| `allOrders` | All orders | `orderId`, `userId`, `userName`, `totalAmount`, `status`, `createdAt` |
| `activityLogs` | Activity tracking | `userId`, `userName`, `action`, `resource`, `timestamp` |
| `announcements` | Admin announcements | `title`, `content`, `type`, `active`, `createdAt` |
| `notifications` | User notifications | `userId`, `title`, `message`, `read`, `createdAt` |
| `categories` | Product categories | `name`, `slug`, `description`, `icon`, `order` |
| `discounts` | Discount codes | `code`, `percentage`, `active`, `expiresAt` |

---

## 6. Pending Fixes & Enhancements

These are the remaining tasks to make the website fully production-ready:

### 6.1 Admin Announcements — Firestore Timestamp Rendering

**Problem:** Timestamp fields render as `[object Object]` instead of dates.

**Files to fix:**
- `src/components/coremmc/admin-announcements.tsx`
- Any component displaying Firestore timestamps

**Fix pattern:**
```tsx
// Before
<span>{announcement.createdAt}</span>

// After
<span>{new Date(announcement.createdAt).toLocaleDateString('en-IN')}</span>
```

### 6.2 Notifications — Mark as Read / Mark All as Read

**Problem:** No way for users to mark notifications as read.

**Files to modify:**
- `src/components/coremmc/dashboard-notifications.tsx`
- `src/app/api/notifications/route.ts`

**Implementation:**
```tsx
// Add a "Mark All as Read" button
<Button onClick={markAllAsRead}>Mark All as Read</Button>

// Add API endpoint: PATCH /api/notifications
export async function PATCH(req: NextRequest) {
  const { userId, notificationIds } = await req.json();
  const batch = db.batch();
  notificationIds.forEach(id => {
    batch.update(db.collection('notifications').doc(id), { read: true });
  });
  await batch.commit();
  return NextResponse.json({ success: true });
}
```

### 6.3 Role Dropdown — Add Owner Role

**Problem:** Owner role not visible in admin role management.

**File:** `src/components/coremmc/admin-roles.tsx`

**Fix:**
```tsx
const ROLES = ['user', 'admin', 'owner'];

// Only show 'owner' if current user IS the owner
const showOwner = userProfile?.role === 'owner';
```

### 6.4 Users Screen — Role Should Be Read-Only

**Problem:** Users can change their own role.

**File:** `src/components/coremmc/admin-users.tsx`

**Fix:**
```tsx
// Make role column display-only (not editable) for non-owners
<Badge>{user.role}</Badge>
// Only owners can edit roles via a separate role management page
```

### 6.5 Block `coremmcadmin` from QR/Payment Settings

**Problem:** Admin role can access sensitive payment settings that only owners should see.

**File:** `src/components/coremmc/admin-settings.tsx`

**Fix:**
```tsx
const isOwner = userProfile?.role === 'owner';

{isOwner && (
  <>
    <PaymentSettingsCard />
    <QRPaymentSettingsCard />
  </>
)}
```

### 6.6 Admin/User Panel Session Separation

**Problem:** Logging out of user dashboard also signs out of admin panel.

**File:** `src/components/coremmc/auth-provider.tsx`

**Status:** ✅ Already partially implemented (`logoutFromDashboard` function exists).

**Remaining:** Ensure `logoutFromDashboard` is used in user dashboard and `logout` is used for full sign-out.

### 6.7 Orders — Write Only on Submit for Approval

**Problem:** Orders might be written to Firestore prematurely.

**File:** `src/app/api/orders/route.ts`

**Fix:** Only write to `allOrders` collection when status changes to `pending_approval`:
```ts
if (status === 'pending_approval') {
  await db.collection('allOrders').add(orderData);
}
```

### 6.8 Registration Email — Read-Only

**Problem:** Users might be able to change their email after registration.

**File:** `src/components/coremmc/dashboard-settings.tsx` or registration form.

**Fix:** Disable email input field in settings:
```tsx
<Input value={email} disabled className="opacity-50 cursor-not-allowed" />
```

### 6.9 Delivery Details — Only Show After Approval

**Problem:** Delivery details visible before order is approved.

**File:** Order detail/view component.

**Fix:**
```tsx
{order.status === 'approved' || order.status === 'completed' ? (
  <DeliveryDetailsCard data={order.deliveryDetails} />
) : (
  <p className="text-zinc-500">Delivery details will appear after approval.</p>
)}
```

### 6.10 Navbar Button UI Fixes

**Status:** ✅ Pill-shaped navbar with centered layout already applied.

### 6.11 Live Notification System

**Problem:** No real-time notification updates.

**Implementation options:**
1. **Polling (simple):** Already implemented — `setInterval` every 10 seconds in navbar.
2. **WebSocket (real-time):** Use Firebase `onSnapshot()` for real-time Firestore listeners.

**Recommended fix:** Replace polling with Firestore `onSnapshot`:
```tsx
import { onSnapshot, query, where, orderBy } from 'firebase/firestore';

useEffect(() => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', user.uid),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  );
  const unsub = onSnapshot(q, (snap) => {
    setUnreadCount(snap.size);
  });
  return unsub;
}, [user]);
```

### 6.12 Admin Dashboard Revenue Logic

**Status:** ✅ Already implemented — sums `totalAmount` from orders with `status === 'completed'`.

### 6.13 Activity Logs

**Status:** ✅ API endpoint exists at `POST /api/activity-logs`. Logs login/logout events.

### 6.14 Discount Management

**Status:** API exists at `src/app/api/admin/discounts/route.ts`. Verify it works on Netlify.

### 6.15 Social Links Update

**Status:** Check if social links (Discord, Twitter, etc.) in footer are configurable from admin settings.

---

## 7. Known Issues & Workarounds

### Issue: Hydration Mismatch Warnings (Firefox)

**Cause:** Firefox injects `fdprocessedid` attribute on `<input>` and `<button>` elements.

**Workaround:** The `<body>` tag has `suppressHydrationWarning`. This is cosmetic and does not affect functionality.

### Issue: Dev Server Unstable in Sandbox

**Cause:** The sandbox environment has process limits that kill background processes.

**Workaround:** Not an issue on your local PC or Netlify. Only affects this development sandbox.

### Issue: Service Account File on Netlify

**Risk:** If `service-account.json` is missing from the deployment, ALL admin API routes will return 500.

**Solution:**
- Option A: Commit `service-account.json` to your repo (easier, but exposes credentials)
- Option B: Use environment variable with base64-encoded JSON (more secure):

```ts
// In API route:
const sa = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT!, 'base64').toString('utf8')
);
```

Then set the env var in Netlify:
```bash
# Encode the file:
cat service-account.json | base64
# Paste the output as FIREBASE_SERVICE_ACCOUNT in Netlify env vars
```

---

## 8. Common Deployment Errors

| Error | Cause | Fix |
|---|---|---|
| `500` on all API routes | `service-account.json` not found | Use `process.cwd()` path (already fixed) |
| `XTransformPort` in console | Old cached code deployed | Redeploy with updated files |
| `[object Object]` for dates | Firestore Timestamp not serialized | Use `.toDate().toISOString()` (already fixed) |
| Blank dark page | `useSyncExternalStore` SSR guard | Removed (already fixed) |
| Netlify build fails | Missing `@netlify/plugin-nextjs` | `npm install -D @netlify/plugin-nextjs` |
| Firebase auth not working | Wrong API key or domain | Check `.env` variables in Netlify dashboard |
| Prisma database error | `custom.db` not deployed | Use Firebase-only for production (Prisma is local dev) |

---

## Quick Redeploy Steps

```bash
# 1. Pull latest changes
git pull

# 2. Verify lint passes
npm run lint

# 3. Test locally
npm run dev
# Open http://localhost:3000 → verify everything works

# 4. Push to trigger Netlify deploy
git add .
git commit -m "fix: Netlify deployment - API paths, timestamps, XTransformPort"
git push
```

---

*Generated for CoreMMC Hosting Platform — coremmc.cloud*