import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1'
import { Railway12306 } from '../lib/12306.ts'

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

    // Initialize 12306 client
    const railway = new Railway12306('')
    await railway.loadCityData()

    // Query tickets
    const tickets = await railway.queryTickets(date, fromStation, toStation)

    // Filter by train numbers if provided
    const filteredTickets = trainNumbers && trainNumbers.length > 0
      ? tickets.filter(ticket => trainNumbers.includes(ticket.trainNo))
      : tickets

    return new Response(
      JSON.stringify(filteredTickets),
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