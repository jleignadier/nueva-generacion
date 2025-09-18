import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { adminKey } = await req.json();
    
    console.log('Admin validation attempt');
    
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
    
    const isValid = adminKey === validAdminKey;
    
    console.log('Admin key validation result:', isValid);
    
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