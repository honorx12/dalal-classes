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
import crypto from 'crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env, ctx) {
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

      // Generate expected signature
      const expectedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

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
          amount,
          status: 'completed',
        });

      if (paymentError) {
        console.error('Payment insert error:', paymentError);
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
        console.error('Enrollment error:', enrollmentError);
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
      console.error('Verify payment error:', error);
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
