import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

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

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Make request to 12306 API
    const response = await fetch('https://kyfw.12306.cn/otn/leftTicket/submitOrderRequest', {
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

    const data = await response.json()

    if (data.status) {
      // Update ticket status in database
      const { error: updateError } = await supabaseClient
        .from('ticket_status')
        .update({ ticket_purchased: true })
        .eq('train_number', trainNo)
        .eq('travel_date', dates[0])

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({ success: true, message: 'Order submitted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      throw new Error(data.messages || 'Failed to submit order')
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