import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyPaymentRequest {
  orderId: string;
  paymentId: string;
  signature: string;
  bookingId: string;
}

async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const body = orderId + '|' + paymentId
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return expectedSignature === signature
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { orderId, paymentId, signature, bookingId }: VerifyPaymentRequest = await req.json()

    if (!orderId || !paymentId || !signature || !bookingId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify booking belongs to user
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single()

    if (bookingError || !booking) {
      console.error('Booking verification failed:', bookingError)
      return new Response(
        JSON.stringify({ error: 'Invalid booking' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!razorpayKeySecret) {
      console.error('Razorpay secret not configured')
      return new Response(
        JSON.stringify({ error: 'Payment service configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify Razorpay signature
    const isValidSignature = await verifyRazorpaySignature(
      orderId,
      paymentId,
      signature,
      razorpayKeySecret
    )

    if (!isValidSignature) {
      console.error('Invalid payment signature')
      return new Response(
        JSON.stringify({ error: 'Invalid payment signature' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch payment details from Razorpay
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayResponse = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
      },
    })

    if (!razorpayResponse.ok) {
      console.error('Failed to fetch payment details from Razorpay')
      return new Response(
        JSON.stringify({ error: 'Failed to verify payment with Razorpay' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const paymentDetails = await razorpayResponse.json()
    console.log('Payment verified successfully:', paymentId)

    // Update payment record
    const { error: paymentUpdateError } = await supabaseClient
      .from('payments')
      .update({
        status: 'succeeded',
        is_verified: true,
        verified_at: new Date().toISOString(),
        verified_by: user.id
      })
      .eq('booking_id', bookingId)
      .eq('intent_id', orderId)

    if (paymentUpdateError) {
      console.error('Failed to update payment:', paymentUpdateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update payment record' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update booking status and release seat
    const { error: bookingUpdateError } = await supabaseClient
      .from('bookings')
      .update({
        status: 'paid_deposit',
        payment_status: 'paid'
      })
      .eq('id', bookingId)

    if (bookingUpdateError) {
      console.error('Failed to update booking:', bookingUpdateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update booking' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Reduce available seats for the time slot
    if (booking.time_slot_id) {
      // First get current seat count
      const { data: timeSlot, error: seatCheckError } = await supabaseClient
        .from('time_slots')
        .select('seats_left')
        .eq('id', booking.time_slot_id)
        .single()

      if (!seatCheckError && timeSlot && timeSlot.seats_left > 0) {
        const { error: seatUpdateError } = await supabaseClient
          .from('time_slots')
          .update({
            seats_left: Math.max(0, timeSlot.seats_left - 1)
          })
          .eq('id', booking.time_slot_id)

        if (seatUpdateError) {
          console.error('Failed to update seat count:', seatUpdateError)
          // Not critical error, continue
        }
      }
    }

    // Remove hold
    const { error: holdDeleteError } = await supabaseClient
      .from('holds')
      .delete()
      .eq('booking_id', bookingId)

    if (holdDeleteError) {
      console.error('Failed to remove hold:', holdDeleteError)
      // Not critical error, continue
    }

    console.log('Booking confirmed successfully:', bookingId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        bookingStatus: 'confirmed',
        paymentId: paymentId,
        bookingCode: booking.booking_code
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Payment verification error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})