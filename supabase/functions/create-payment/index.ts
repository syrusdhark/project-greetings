/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Debug function to safely log environment variables
function debugEnvironmentVariables() {
  const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
  const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
  const razorpayWebhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
  
  console.log('=== RAZORPAY ENVIRONMENT VARIABLES DEBUG ===')
  console.log('RAZORPAY_KEY_ID:', razorpayKeyId ? `✅ Set (${razorpayKeyId.substring(0, 8)}...)` : '❌ Missing')
  console.log('RAZORPAY_KEY_SECRET:', razorpayKeySecret ? `✅ Set (${razorpayKeySecret.substring(0, 8)}...)` : '❌ Missing')
  console.log('RAZORPAY_WEBHOOK_SECRET:', razorpayWebhookSecret ? `✅ Set (${razorpayWebhookSecret.substring(0, 8)}...)` : '❌ Missing')
  
  // Check if we're in test mode based on key prefix
  const isTestMode = razorpayKeyId?.startsWith('rzp_test_')
  const isLiveMode = razorpayKeyId?.startsWith('rzp_live_')
  
  console.log('Razorpay Mode:', isTestMode ? '🧪 TEST MODE' : isLiveMode ? '🚀 LIVE MODE' : '❓ UNKNOWN MODE')
  console.log('============================================')
  
  return {
    razorpayKeyId,
    razorpayKeySecret,
    razorpayWebhookSecret,
    isTestMode,
    isLiveMode,
    hasAllKeys: !!(razorpayKeyId && razorpayKeySecret)
  }
}

// Function to create detailed error responses
function createErrorResponse(type: string, message: string, details?: any, status = 500) {
  const errorResponse = {
    error: message,
    errorType: type,
    timestamp: new Date().toISOString(),
    ...(details && { details })
  }
  
  console.error(`[${type}] ${message}`, details)
  
  return new Response(
    JSON.stringify(errorResponse),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

interface CreatePaymentRequest {
  bookingId: string;
  amount: number;
  currency?: string;
}

interface RazorpayOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== CREATE PAYMENT FUNCTION START ===')
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))
    
    // Debug environment variables first
    const envCheck = debugEnvironmentVariables()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return createErrorResponse('AUTHENTICATION_ERROR', 'User not authenticated', { userId: null }, 401)
    }

    console.log('Authenticated user ID:', user.id)

    if (req.method !== 'POST') {
      return createErrorResponse('METHOD_ERROR', 'Only POST method allowed', { method: req.method }, 405)
    }

    const { bookingId, amount, currency = 'INR' }: CreatePaymentRequest = await req.json()
    console.log('Payment request data:', { bookingId, amount, currency })

    if (!bookingId || !amount) {
      return createErrorResponse('VALIDATION_ERROR', 'Missing required fields', { 
        bookingId: !!bookingId, 
        amount: !!amount 
      }, 400)
    }

    // Early check for Razorpay credentials with detailed error
    if (!envCheck.hasAllKeys) {
      return createErrorResponse('RAZORPAY_CONFIG_ERROR', 
        'Razorpay credentials not configured properly. Check your Supabase Edge Function secrets.', 
        {
          hasKeyId: !!envCheck.razorpayKeyId,
          hasKeySecret: !!envCheck.razorpayKeySecret,
          mode: envCheck.isTestMode ? 'test' : envCheck.isLiveMode ? 'live' : 'unknown',
          troubleshooting: {
            step1: 'Go to Supabase Dashboard → Settings → Edge Functions',
            step2: 'Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET secrets',
            step3: 'For test mode, use rzp_test_* keys from Razorpay Dashboard',
            step4: 'For live mode, use rzp_live_* keys (only after domain setup)'
          }
        }, 
        500)
    }

    console.log('Verifying booking:', { bookingId, userId: user.id })
    
    // Verify booking belongs to user and is in valid state
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .eq('status', 'held')
      .single()

    if (bookingError || !booking) {
      return createErrorResponse('DATABASE_ERROR', 'Booking not found or not accessible', {
        bookingId,
        userId: user.id,
        error: bookingError,
        troubleshooting: {
          check1: 'Verify booking ID is correct',
          check2: 'Ensure booking belongs to authenticated user',
          check3: 'Confirm booking status is "held"',
          check4: 'Check if booking hold has expired'
        }
      }, 400)
    }

    console.log('Booking found:', { 
      bookingCode: booking.booking_code, 
      status: booking.status, 
      amount: booking.amount 
    })

    // Check if hold is still valid
    const { data: hold, error: holdError } = await supabaseClient
      .from('holds')
      .select('expires_at')
      .eq('booking_id', bookingId)
      .maybeSingle()

    if (holdError) {
      return createErrorResponse('DATABASE_ERROR', 'Failed to validate booking hold', {
        bookingId,
        error: holdError
      }, 500)
    }

    if (!hold) {
      return createErrorResponse('BOOKING_HOLD_ERROR', 'Booking hold not found or has expired', {
        bookingId,
        troubleshooting: {
          reason: 'Hold record missing from database',
          action: 'User needs to restart booking process'
        }
      }, 400)
    }

    if (new Date(hold.expires_at) <= new Date()) {
      return createErrorResponse('BOOKING_HOLD_ERROR', 'Booking hold has expired', {
        bookingId,
        expiresAt: hold.expires_at,
        currentTime: new Date().toISOString(),
        troubleshooting: {
          reason: 'Hold expired - booking window closed',
          action: 'User needs to restart booking process'
        }
      }, 400)
    }

    console.log('Hold validated:', { expiresAt: hold.expires_at })

    // Domain and webhook configuration guidance
    const domainConfig = {
      hasCustomDomain: false, // Set to true when you have a domain
      testModeRecommended: envCheck.isTestMode,
      webhookSetupRequired: !envCheck.razorpayWebhookSecret
    }

    console.log('=== DOMAIN & WEBHOOK CONFIGURATION ===')
    console.log('Custom domain setup:', domainConfig.hasCustomDomain ? '✅ Configured' : '⚠️  Not configured (using test mode)')
    console.log('Webhook secret:', envCheck.razorpayWebhookSecret ? '✅ Set' : '⚠️  Missing')
    
    if (!domainConfig.hasCustomDomain && envCheck.isLiveMode) {
      console.warn('⚠️  WARNING: Using live keys without custom domain setup!')
      console.warn('📝 NEXT STEPS FOR PRODUCTION:')
      console.warn('1. Purchase and configure your domain')
      console.warn('2. Set up redirect URLs in Razorpay Dashboard')
      console.warn('3. Configure webhook URLs')
      console.warn('4. Test payment flow end-to-end')
    }

    const orderData: RazorpayOrderRequest = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: booking.booking_code || bookingId,
      notes: {
        booking_id: bookingId,
        customer_name: booking.customer_name,
        activity: booking.activity_booked,
        booking_date: booking.booking_date,
        mode: envCheck.isTestMode ? 'test' : 'live',
        domain_configured: domainConfig.hasCustomDomain.toString()
      }
    }

    console.log('=== RAZORPAY ORDER CREATION ===')
    console.log('Order data:', JSON.stringify(orderData, null, 2))
    console.log('API endpoint: https://api.razorpay.com/v1/orders')
    console.log('Auth header (first 20 chars):', `Basic ${btoa(`${envCheck.razorpayKeyId}:${envCheck.razorpayKeySecret}`).substring(0, 20)}...`)

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${envCheck.razorpayKeyId}:${envCheck.razorpayKeySecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    console.log('Razorpay response status:', razorpayResponse.status)
    console.log('Razorpay response headers:', Object.fromEntries(razorpayResponse.headers.entries()))

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text()
      console.error('=== RAZORPAY API ERROR ===')
      console.error('Status:', razorpayResponse.status)
      console.error('Response:', errorText)
      
      let errorDetails: any = { rawError: errorText }
      try {
        errorDetails = JSON.parse(errorText)
      } catch (e) {
        console.error('Could not parse Razorpay error as JSON:', e)
      }

      return createErrorResponse('RAZORPAY_API_ERROR', 'Failed to create payment order with Razorpay', {
        status: razorpayResponse.status,
        razorpayError: errorDetails,
        mode: envCheck.isTestMode ? 'test' : 'live',
        troubleshooting: {
          step1: 'Check Razorpay Dashboard → Settings → API Keys',
          step2: 'Verify key permissions and status',
          step3: 'Ensure test/live mode matches your keys',
          step4: 'Check account activation status',
          dashboard: 'https://dashboard.razorpay.com/app/keys'
        }
      }, 500)
    }

    const razorpayOrder = await razorpayResponse.json()
    console.log('=== RAZORPAY ORDER SUCCESS ===')
    console.log('Order ID:', razorpayOrder.id)
    console.log('Order details:', JSON.stringify(razorpayOrder, null, 2))

    // Create payment record in our database
    console.log('Creating payment record in database...')
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        booking_id: bookingId,
        amount: amount,
        currency: currency,
        status: 'initiated',
        provider: 'razorpay',
        intent_id: razorpayOrder.id
      })

    if (paymentError) {
      return createErrorResponse('DATABASE_ERROR', 'Failed to create payment record', {
        bookingId,
        razorpayOrderId: razorpayOrder.id,
        error: paymentError,
        troubleshooting: {
          note: 'Razorpay order was created but database record failed',
          action: 'Check Supabase logs and database schema'
        }
      }, 500)
    }

    console.log('Payment record created successfully')

    // Success response with additional debugging info
    const successResponse = {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: envCheck.razorpayKeyId,
      bookingCode: booking.booking_code,
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      debug: {
        mode: envCheck.isTestMode ? 'test' : 'live',
        domainConfigured: domainConfig.hasCustomDomain,
        webhookConfigured: !!envCheck.razorpayWebhookSecret,
        timestamp: new Date().toISOString()
      }
    }

    console.log('=== PAYMENT CREATION SUCCESS ===')
    console.log('Final response:', JSON.stringify(successResponse, null, 2))

    return new Response(
      JSON.stringify(successResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===')
    console.error('Error details:', error)
    console.error('Error stack:', error.stack)
    
    return createErrorResponse('INTERNAL_ERROR', 'Unexpected error occurred', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, 500)
  }
})