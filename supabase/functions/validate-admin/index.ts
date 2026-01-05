import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { attempts: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry) {
    rateLimitMap.set(ip, { attempts: 1, lastAttempt: now });
    return false;
  }
  
  // Reset if window has passed
  if (now - entry.lastAttempt > WINDOW_MS) {
    rateLimitMap.set(ip, { attempts: 1, lastAttempt: now });
    return false;
  }
  
  // Increment attempts
  entry.attempts++;
  entry.lastAttempt = now;
  
  return entry.attempts > MAX_ATTEMPTS;
}

// Timing-safe string comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do a comparison to maintain constant time
    let result = 0;
    for (let i = 0; i < b.length; i++) {
      result |= b.charCodeAt(i);
    }
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);

  // Check rate limit
  if (isRateLimited(clientIP)) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Too many attempts. Please try again later.' 
      }),
      {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const { adminKey } = await req.json();
    
    // Validate input
    if (!adminKey || typeof adminKey !== 'string' || adminKey.length > 256) {
      console.log('Invalid admin key format');
      return new Response(
        JSON.stringify({ valid: false }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log('Admin validation attempt from IP:', clientIP);
    
    // Get the valid admin key from secrets
    const validAdminKey = Deno.env.get('ADMIN_KEY');
    
    if (!validAdminKey) {
      console.error('Admin key not configured in secrets');
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Admin authentication not configured' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Use timing-safe comparison
    const isValid = timingSafeEqual(adminKey, validAdminKey);
    
    console.log('Admin key validation result:', isValid, 'for IP:', clientIP);
    
    return new Response(
      JSON.stringify({ valid: isValid }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
    
  } catch (error) {
    console.error('Error in validate-admin function:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Validation failed' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
