import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { date, fromStation, toStation } = await req.json()

    // Generate mock ticket data for testing
    const tickets = [
      {
        trainNumber: 'G1377',
        fromStation,
        toStation,
        departureTime: '07:15',
        arrivalTime: '08:45',
        remainingTickets: Math.floor(Math.random() * 100),
        price: Math.floor(Math.random() * 500) + 200
      },
      {
        trainNumber: 'G7566',
        fromStation,
        toStation,
        departureTime: '17:15',
        arrivalTime: '18:45',
        remainingTickets: Math.floor(Math.random() * 100),
        price: Math.floor(Math.random() * 500) + 200
      }
    ]

    return new Response(
      JSON.stringify(tickets),
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