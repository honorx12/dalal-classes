/**
 * Cloudflare Worker: Verify Payment
 * Endpoint: /api/verify-payment
 * 
 * This worker verifies the Razorpay payment signature and enrolls the user
 * 
 * Environment Variables:
 * - SUPABASE_URL: Supabase project URL
 * - SUPABASE_SERVICE_KEY: Supabase service role key (for server-side operations)
 * - RAZORPAY_SECRET: Razorpay webhook secret for signature verification
 */
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Generate HMAC-SHA256 signature using Web Crypto API
 * Compatible with Cloudflare Workers runtime
 * @param {string} secret - The secret key
 * @param {string} data - The data to sign
 * @returns {Promise<string>} Hex-encoded signature
 */
async function generateHmac(secret, data) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  
  // Convert ArrayBuffer to hex string
  const hashArray = new Uint8Array(signature);
  return Array.from(hashArray, byte => byte.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env, _ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
      const body = await request.json();
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature, user_id, course_id, amount } = body;

      // Validate required fields
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !user_id || !course_id) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Missing required fields' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate expected signature using Web Crypto API
      const expectedSignature = await generateHmac(
        env.RAZORPAY_SECRET,
        `${razorpay_order_id}|${razorpay_payment_id}`
      );

      // Verify signature
      if (razorpay_signature !== expectedSignature) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid payment signature' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Insert payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id,
          course_id,
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          amount: amount || 0,
          status: 'completed',
        });

      if (paymentError) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Failed to record payment' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create enrollment
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .upsert({
          user_id,
          course_id,
          progress: 0,
          enrolled_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,course_id',
        });

      if (enrollmentError) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Failed to create enrollment' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Payment verified and enrollment created',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
