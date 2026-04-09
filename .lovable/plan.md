

# Fix QR Attendance — Drop Duplicate DB Function

## Problem

The database has **two versions** of `award_event_points`:
- 3-param version: `(p_user_id, p_event_id, p_check_in_method)` — no QR validation
- 4-param version: `(p_user_id, p_event_id, p_check_in_method, p_qr_token DEFAULT NULL)` — validates QR token

PostgREST cannot resolve overloaded functions, so the RPC call fails when a volunteer scans the QR code. The scanning itself works correctly (camera opens, QR is read, data is parsed in-app — no external URL involved).

## Fix

### 1. Database migration — Drop the 3-param overload
```sql
DROP FUNCTION IF EXISTS public.award_event_points(uuid, uuid, check_in_method);
```
The 4-param version already handles both cases:
- Manual check-in: `p_qr_token` defaults to NULL (skips token check)
- QR scan: `p_qr_token` is provided and validated against `qr_active_token`

### 2. `src/pages/EventDetail.tsx` — Clean up `as any` cast
Remove the `as any` cast on the RPC call (line 225) now that only one function signature exists.

**No other changes needed.** The QR content format (`eventId:token`), scanning logic, and admin activation flow are all correct.

