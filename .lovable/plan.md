
Problem found: the current QR payload is generated as raw text in the format `eventId:token`. That works with the in-app `html5-qrcode` scanner, but when users scan the QR with their phone camera or another scanner, the device treats it like a URI/external target and leaves the app. There is no app route today that receives a QR scan opened from outside the scanner dialog, so attendance is never completed in that path.

Plan

1. Change the QR payload from raw text to an app URL
- Update `src/components/admin/EventQRDialog.tsx`.
- Generate the QR as a first-party URL on this app domain, for example:
  `https://.../qr-check-in?event=<eventId>&token=<token>`
- This makes phone-camera scans open this app instead of some ambiguous external target.

2. Add a dedicated QR check-in route/page
- Add a new page such as `src/pages/QRCheckIn.tsx`.
- Add a public route in `src/App.tsx` for `/qr-check-in`.
- On load, the page will:
  - read `event` and `token` from the URL
  - verify auth state
  - if logged in, call the existing `award_event_points` RPC directly
  - show loading, success, duplicate-attendance, invalid-token, and wrong-event states clearly

3. Preserve QR check-in across login
- If a user opens `/qr-check-in` while logged out, store the pending QR payload in session storage and send them to `/login`.
- Update `src/pages/Login.tsx` so successful login resumes the pending QR check-in flow instead of always going to `/dashboard`.
- This avoids losing the token during auth redirects.

4. Keep the in-app scanner working
- Update `src/pages/EventDetail.tsx` so `handleQRScanSuccess` can parse both:
  - the old legacy format: `eventId:token`
  - the new URL format: `/qr-check-in?event=...&token=...`
- This keeps the modal scanner compatible while moving admins to the safer QR format.

5. Improve admin/volunteer guidance
- In `EventQRDialog`, add a short note that the QR can now be scanned with either:
  - the in-app scanner, or
  - the phone camera, which will open the app check-in page
- Optionally add a “Copiar enlace” action for testing.

Technical details
- No new backend endpoint is required if `award_event_points` is already working after the function-overload fix.
- The main missing piece is not the RPC itself; it is the absence of a route that handles QR scans opened outside the in-app scanner.
- The raw `eventId:token` format is fragile for native camera apps because anything shaped like `something:...` may be interpreted as a link/URI scheme.
- This approach keeps attendance validation server-side through the existing Supabase function and only changes how the client receives the QR data.

Files to update
- `src/components/admin/EventQRDialog.tsx`
- `src/pages/QRCheckIn.tsx` (new)
- `src/App.tsx`
- `src/pages/Login.tsx`
- `src/pages/EventDetail.tsx`

Expected result
- Admin activates QR
- Volunteer scans with phone camera or app scanner
- The app opens its own `/qr-check-in` route
- The route performs the attendance update through Supabase
- Users no longer get sent to an unrelated web destination
