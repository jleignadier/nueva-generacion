

## Password Reset Issue: CAPTCHA Configuration Problem

### Problem Identified

The auth logs show a 500 error when users try to reset their password:

```
error: "no captcha response (captcha_token) found in request"
msg: "500: captcha verification process failed"
path: "/recover"
```

**Root Cause:** Your Supabase project has CAPTCHA enabled for password recovery, but the application isn't sending a CAPTCHA token with the request.

---

### Solution Options

#### Option A: Disable CAPTCHA (Quick Fix - Recommended)

This is the simplest solution if you don't need CAPTCHA protection for password reset:

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Bot and Abuse Protection**
3. Look for CAPTCHA settings and **disable** it for the password recovery flow
4. Save changes

After this, the current code will work without any modifications.

---

#### Option B: Integrate CAPTCHA (More Secure)

If you want to keep CAPTCHA enabled for security, you'll need to:

1. **Choose a CAPTCHA provider** (Cloudflare Turnstile, hCaptcha, or reCAPTCHA)
2. **Install the CAPTCHA library** and add the widget to the password reset form
3. **Pass the captcha token** to Supabase when calling `resetPasswordForEmail`

**Code changes required for Login.tsx:**

```tsx
// With Cloudflare Turnstile example:
const { error } = await supabase.auth.resetPasswordForEmail(emailToReset, {
  redirectTo: `${window.location.origin}/reset-password`,
  captchaToken: turnstileToken, // Token from CAPTCHA widget
});
```

---

### Recommendation

**Option A is recommended** unless you have specific security requirements for CAPTCHA. Password reset already requires email access, which provides sufficient security for most use cases.

---

### Technical Details

| Item | Details |
|------|---------|
| Affected file | `src/pages/Login.tsx` (line 134) |
| Supabase endpoint | `/auth/v1/recover` |
| Error code | 500 (captcha verification failed) |
| Current function call | `supabase.auth.resetPasswordForEmail()` missing `captchaToken` option |

