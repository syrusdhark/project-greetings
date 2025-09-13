import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
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
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const signature = req.headers.get('x-razorpay-signature')
    if (!signature) {
      return new Response('Missing signature', { status: 400 })
    }

    const body = await req.text()
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
    
    if (!webhookSecret) {
      console.error('Webhook secret not configured')
      return new Response('Webhook not configured', { status: 500 })
    }

    // Verify webhook signature
    const isValidSignature = await verifyWebhookSignature(body, signature, webhookSecret)
    if (!isValidSignature) {
      console.error('Invalid webhook signature')
      return new Response('Invalid signature', { status: 401 })
    }

    const event = JSON.parse(body)
    console.log('Webhook event received:', event.event, event.payload?.payment?.entity?.id)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
      case 'payment.authorized': {
        const payment = event.payload.payment.entity
        const orderId = payment.order_id
        const paymentId = payment.id
        const amount = payment.amount / 100 // Convert from paise to rupees

        console.log('Processing successful payment:', paymentId, 'for order:', orderId)

        // Find the booking by order ID
        const { data: paymentRecord, error: paymentError } = await supabaseClient
          .from('payments')
          .select('booking_id, bookings(*)')
          .eq('intent_id', orderId)
          .single()

        if (paymentError || !paymentRecord) {
          console.error('Payment record not found for order:', orderId, paymentError)
          return new Response('Payment record not found', { status: 404 })
        }

        // Update payment status
        const { error: updatePaymentError } = await supabaseClient
          .from('payments')
          .update({
            status: 'succeeded',
            is_verified: true,
            verified_at: new Date().toISOString()
          })
          .eq('intent_id', orderId)

        if (updatePaymentError) {
          console.error('Failed to update payment status:', updatePaymentError)
          return new Response('Update failed', { status: 500 })
        }

        // Update booking status
        const { error: updateBookingError } = await supabaseClient
          .from('bookings')
          .update({
            status: 'paid_deposit',
            payment_status: 'paid'
          })
          .eq('id', paymentRecord.booking_id)

        if (updateBookingError) {
          console.error('Failed to update booking status:', updateBookingError)
          return new Response('Booking update failed', { status: 500 })
        }

        // Update seat availability if time slot exists
        const booking = paymentRecord.bookings
        if (booking?.time_slot_id) {
          // First get current seat count
          const { data: timeSlot, error: seatCheckError } = await supabaseClient
            .from('time_slots')
            .select('seats_left')
            .eq('id', booking.time_slot_id)
            .single()

          if (!seatCheckError && timeSlot && timeSlot.seats_left > 0) {
            const { error: seatError } = await supabaseClient
              .from('time_slots')
              .update({
                seats_left: Math.max(0, timeSlot.seats_left - 1)
              })
              .eq('id', booking.time_slot_id)

            if (seatError) {
              console.error('Failed to update seat count:', seatError)
            }
          }
        }

        // Remove hold
        const { error: holdError } = await supabaseClient
          .from('holds')
          .delete()
          .eq('booking_id', paymentRecord.booking_id)

        if (holdError) {
          console.error('Failed to remove hold:', holdError)
        }

        console.log('Payment processed successfully for booking:', paymentRecord.booking_id)
        break
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity
        const orderId = payment.order_id

        console.log('Processing failed payment for order:', orderId)

        // Update payment status to failed
        const { error: updateError } = await supabaseClient
          .from('payments')
          .update({ status: 'failed' })
          .eq('intent_id', orderId)

        if (updateError) {
          console.error('Failed to update payment status:', updateError)
        }

        // Find and expire the booking
        const { data: paymentRecord } = await supabaseClient
          .from('payments')
          .select('booking_id')
          .eq('intent_id', orderId)
          .single()

        if (paymentRecord) {
          const { error: bookingError } = await supabaseClient
            .from('bookings')
            .update({ status: 'expired' })
            .eq('id', paymentRecord.booking_id)

          if (bookingError) {
            console.error('Failed to expire booking:', bookingError)
          }

          // Remove hold
          const { error: holdError } = await supabaseClient
            .from('holds')
            .delete()
            .eq('booking_id', paymentRecord.booking_id)

          if (holdError) {
            console.error('Failed to remove hold:', holdError)
          }
        }
        break
      }

      default:
        console.log('Unhandled webhook event:', event.event)
    }

    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Internal server error', { status: 500 })
  }
})