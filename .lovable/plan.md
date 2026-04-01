

# Fix Recurring Events & Registration Flow

## Issues Identified

1. **"Evento de varios días" label** still shows in EventForm.tsx (line 276). Should be replaced with "Evento Recurrente" — but actually both toggles exist now (multi-day AND recurring). The user wants to **remove the multi-day toggle entirely** and keep only "Evento Recurrente."

2. **EventDetail skips registration, goes straight to QR scan.** The volunteer action buttons (lines 451-540) show QR scan for admins by default and for registered users. But for non-registered, non-admin users the `canRegister` check at line 482 works correctly. The real problem: **admins always see "Escanear QR" and "Check-in Manual" (lines 452-468)** with no register option, and the `canScanQR` logic (line 76) sets it true immediately upon registration — even before the event day. This means a volunteer who just registered sees "Escanear QR" instead of "Registrado" with a calendar download.

3. **Recurring date generation is correct** (uses `addWeeks`/`addMonths`), so same-day-of-week is already preserved for weekly/biweekly. Monthly uses `addMonths` which keeps the same day-of-month (close enough). No fix needed here.

4. **Admin QR generation** already exists via `EventQRDialog` in `AdminEvents.tsx`. The user wants it also accessible from `EventDetail.tsx` for admins — currently admins see a "Escanear QR" (scan) button there, but not a "Generar/Activar QR" button for displaying the QR to attendees.

## Changes

### 1. `EventForm.tsx` — Remove multi-day toggle, keep only recurring
- Remove the `isMultiDay` state and the "Evento de varios días" switch + end date picker block (lines 269-317)
- Remove `endDate` from form data (or keep it unused)
- The recurring toggle already exists and works correctly

### 2. `EventDetail.tsx` — Fix registration flow
- **For volunteers:** After registering, show "Registrado ✓" status + calendar download, NOT the QR scan button. Only show QR scan on the **event day** when the admin has activated QR (check `qr_active_token` exists).
- Change `canScanQR` logic: must be registered AND event is today AND QR is active (token exists in DB)
- Add a check for `qr_active_token` when determining if QR scan is available
- **For admins on EventDetail:** Add an "Activar QR" button that opens `EventQRDialog` (to display/generate QR for attendees to scan), in addition to the existing manual check-in button

### 3. `EventDetail.tsx` — Add series registration with calendar
- When registering for the full series, download calendar files for all events in the series (or at least the first one)

### 4. `AdminEvents.tsx` — No changes needed
- QR activation button already exists here

## Technical Details

**Files modified:**
- `src/pages/admin/EventForm.tsx` — remove multi-day toggle
- `src/pages/EventDetail.tsx` — fix registration flow, add admin QR display button, check qr_active_token for scan availability

**Key logic change in EventDetail:**
```text
Volunteer flow:
  Not registered → "Registrarse" button (+ series option if recurring)
  Registered, not event day → "Registrado ✓" (disabled green button)
  Registered, event day, QR active → "Escanear QR para Asistencia"
  Attended → "Asistencia Registrada ✓"

Admin flow:
  Always show "Activar QR" (opens EventQRDialog to display QR)
  Always show "Check-in Manual"
```

**No DB changes needed.**

