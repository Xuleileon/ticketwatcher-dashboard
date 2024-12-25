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
    const { date, fromStation, toStation, trainNumbers } = await req.json()

    // Mock ticket data for testing
    const mockTickets = trainNumbers.map(trainNo => ({
      trainNumber: trainNo,
      remainingTickets: Math.floor(Math.random() * 100),
      price: Math.floor(Math.random() * 500) + 200,
      date: date,
      fromStation,
      toStation,
      available: true
    }));

    return new Response(
      JSON.stringify(mockTickets),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('Error querying tickets:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    )
  }
})