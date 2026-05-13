## Goal

When an admin activates the QR for an event, present the QR in a fullscreen view so that volunteers scanning the device only see the QR (and a close button) — never the admin UI behind it.

## Changes

Single file: `src/components/admin/EventQRDialog.tsx`

1. Replace the current `Dialog` / `DialogContent` (which renders a small centered modal) with a fullscreen overlay once a QR is active:
   - Fixed-position container covering the entire viewport (`fixed inset-0 z-50`), solid white background so the QR has maximum contrast for scanning.
   - Centered QR image, scaled large (e.g. `min(80vw, 80vh)`) so it fills most of the screen.
   - Event title shown small at the top.
   - A single, clearly visible **Close / Desactivar QR** button in a corner (top-right `X` icon button) plus the existing destructive "Desactivar QR" action at the bottom. The corner X just closes the overlay without deactivating; the bottom button deactivates server-side as today.
   - Lock body scroll while the overlay is open.

2. Keep the **pre-activation** state (the "Activar QR" prompt) inside the existing small `Dialog` — fullscreen only kicks in once `qrDataUrl` exists. This avoids a jarring fullscreen takeover before the admin actually generates a code.

3. No changes to:
   - QR payload / URL format
   - Supabase calls (`activateQR`, `deactivateQR`, initial fetch effect)
   - `AdminEvents.tsx` integration (same props)
   - `/qr-check-in` flow

## Technical notes

- Use a plain `div` portal-like overlay (`fixed inset-0 bg-white flex flex-col`) instead of `DialogContent` for the active state, because Radix Dialog content is constrained by `sm:max-w-*` and centered sizing. Render it conditionally next to the existing `Dialog` (the `Dialog` only handles the inactive/activation prompt state).
- Add `useEffect` to set `document.body.style.overflow = 'hidden'` while the fullscreen overlay is mounted, restoring on unmount.
- Close button: top-right, large tap target, semantic tokens for styling. Use the already-imported `X` icon.
- Keep the helper text ("Los voluntarios pueden escanear...") small and below the QR so it doesn't compete visually.

## Expected result

Admin taps "Activar QR" → screen flips to a clean white fullscreen with a giant QR centered, event title at top, X to close at top-right, and "Desactivar QR" at the bottom. Volunteers scanning can no longer see any admin data behind the code.
