

# Fix Email Verification Issues & Add Spam Folder Warning

## Issues Found

1. **`emailRedirectTo` points to root (`window.location.origin`)** — After clicking the verification link, users land on `/` which may not handle the auth callback properly. It should redirect to `/login` so users see the login page with a "verified" confirmation.

2. **`needsConfirmation` check is unreliable** — The code checks `data.user.identities.length === 0` to detect if email confirmation is needed. This is a workaround for detecting duplicate signups, NOT for checking if confirmation is pending. With `enable_confirmations = true` in Supabase config, ALL new signups require confirmation but will have identities. The `signOut()` call after signup may be interfering — Supabase with confirmations enabled should NOT create a session for unconfirmed users, so the explicit `signOut()` is unnecessary and could cause race conditions with the auth state listener.

3. **No spam folder warning on the registration success screen** — The success message (line 207-210) tells users to check their inbox but does NOT mention the spam/junk folder.

4. **Login resend verification has duplicate UI** — Two `showResendConfirmation` blocks render (lines 263-278 AND 311-326), showing redundant resend buttons.

5. **Organization signup missing firstName/lastName** — When `accountType === 'organization'`, the form collects `orgName` but never sets `firstName`/`lastName`. The signup call sends empty strings for these fields, which means the profile gets created with blank names. This could cause issues with the trigger and profile display.

## Changes

### 1. `src/pages/Signup.tsx` — Add spam warning + fix org fields
- Add "Revisa también tu carpeta de spam o correo no deseado" to the success message (line 209)
- Add a resend verification button on the success screen
- For organization accounts, use `orgName` as `firstName` so the profile isn't blank

### 2. `src/contexts/AuthContext.tsx` — Fix redirect URL & confirmation logic
- Change `emailRedirectTo` from `window.location.origin` to `window.location.origin + '/login'`
- Remove the unreliable `identities.length === 0` check and the explicit `signOut()` — with `enable_confirmations = true`, Supabase handles this automatically (no session is created for unconfirmed users)

### 3. `src/pages/Login.tsx` — Remove duplicate resend UI + add spam tip
- Remove one of the two duplicate `showResendConfirmation` blocks
- Add spam folder mention to the resend confirmation messages

## Technical Details

**Files modified:**
- `src/pages/Signup.tsx` — spam warning on success screen, resend button, org name fix
- `src/contexts/AuthContext.tsx` — fix `emailRedirectTo`, remove broken confirmation check
- `src/pages/Login.tsx` — deduplicate resend UI, add spam mention

**No database changes needed.**

