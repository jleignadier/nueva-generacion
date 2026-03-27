

# Real QR Code Attendance System

## Overview
Replace the mock QR scanner with a real camera-based system. Admins activate a QR code for an event, volunteers scan it with their phone camera to check in and earn points/hours.

## Flow

```text
ADMIN SIDE                          VOLUNTEER SIDE
─────────────                       ──────────────
Event card → "Activar QR"           Event detail → "Escanear QR"
     │                                    │
     ▼                                    ▼
Shows QR code on screen             Opens camera (html5-qrcode)
(contains event_id + secret token)        │
     │                                    ▼
     ▼                              Scans admin's QR code
QR stays active until admin              │
clicks "Desactivar QR"                   ▼
                                    Decoded → calls award_event_points RPC
                                    → points & hours credited
```

## Database Changes (1 migration)

Add a column `qr_active_token` (text, nullable) to the `events` table:
- When admin activates QR: generate a random UUID token, store it in `qr_active_token`
- When admin deactivates: set to `NULL`
- Volunteer scans QR containing `{eventId}:{token}` — the `award_event_points` RPC validates the token matches before awarding points

Update `award_event_points` RPC to accept a `p_qr_token` parameter (text, default NULL):
- For `qr_scan` method: verify `events.qr_active_token` is not null and matches `p_qr_token`
- For `manual` method: no token needed (admin-only, already secured)

## Frontend Changes

### 1. Install `html5-qrcode` library
Real camera-based QR scanning for mobile and desktop browsers.

### 2. Rewrite `QRScanner.tsx`
- Use `Html5QrcodeScanner` to access the device camera
- Decode QR content, extract `eventId:token`, and pass to `onSuccess`
- Handle camera permission errors gracefully
- Clean up scanner on unmount

### 3. Admin: "Activar QR" button on `AdminEvents.tsx`
- Add an "Activar QR" button per event (upcoming events only)
- On click: generate a UUID token, update `events.qr_active_token` via Supabase
- Show a dialog with a large QR code image (generated client-side using `qrcode` library) encoding `{eventId}:{token}`
- "Desactivar QR" button sets `qr_active_token = null`

### 4. Update `EventDetail.tsx` volunteer flow
- When volunteer clicks "Escanear QR": open real camera scanner
- On successful scan: parse `eventId:token` from QR data
- Call `award_event_points` RPC with the token
- Show success/error feedback

### 5. Update `award_event_points` RPC
- Add `p_qr_token TEXT DEFAULT NULL` parameter
- For `qr_scan`: validate `p_qr_token` matches `events.qr_active_token` (and token is not null, meaning QR is active)
- Raise exception if QR is not active or token doesn't match

## Security
- Token is random UUID, not guessable
- QR only works when admin has actively opened attendance
- Existing auth + registration checks remain in the RPC
- Admin can deactivate at any time to close attendance window

## Technical Details
- **New packages**: `html5-qrcode` (scanner), `qrcode` (QR generation for admin display)
- **New DB column**: `events.qr_active_token TEXT NULL`
- **Modified RPC**: `award_event_points` adds token validation for `qr_scan`
- **Files modified**: `QRScanner.tsx`, `EventDetail.tsx`, `AdminEvents.tsx`, `award_event_points` RPC
- **Files created**: None (reuse existing components)

