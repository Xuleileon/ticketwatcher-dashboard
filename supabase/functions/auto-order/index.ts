import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { verificationCode, dates, trainNo } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Submit order to 12306
    const orderResponse = await fetch('https://kyfw.12306.cn/otn/leftTicket/submitOrderRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: new URLSearchParams({
        'train_date': dates[0],
        'train_no': trainNo,
        'verify_code': verificationCode
      })
    })

    const orderData = await orderResponse.json()

    if (orderData.status) {
      // Update ticket status
      await supabaseClient
        .from('ticket_status')
        .update({ 
          ticket_purchased: true,
          updated_at: new Date().toISOString()
        })
        .eq('train_number', trainNo)
        .eq('travel_date', dates[0])

      return new Response(
        JSON.stringify({ success: true, message: 'Order submitted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      throw new Error(orderData.messages || 'Failed to submit order')
    }

  } catch (error) {
    console.error('Error processing order:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})