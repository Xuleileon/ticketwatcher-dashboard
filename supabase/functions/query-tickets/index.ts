import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import axios from 'npm:axios';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueryTicketsBody {
  date: string;
  fromStation: string;
  toStation: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { date, fromStation, toStation } = await req.json() as QueryTicketsBody;

    console.log('Received query request:', { date, fromStation, toStation });

    // 构建12306查询URL
    const url = `https://kyfw.12306.cn/otn/leftTicket/queryO?leftTicketDTO.train_date=${date}&leftTicketDTO.from_station=${fromStation}&leftTicketDTO.to_station=${toStation}&purpose_codes=ADULT`;

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    console.log('Querying 12306 API:', { url });

    const response = await axios.get(url, { headers });
    
    // Add defensive checks for the response structure
    if (!response.data) {
      console.error('No response data received');
      throw new Error('No response from 12306 API');
    }

    if (!response.data.data) {
      console.error('Invalid response structure - no data field:', response.data);
      throw new Error('Invalid response structure from 12306 API');
    }

    if (!Array.isArray(response.data.data.result)) {
      console.error('Invalid response structure - result is not an array:', response.data.data);
      throw new Error('Invalid result format from 12306 API');
    }

    const result = response.data.data.result;

    // Get user's purchased tickets from Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const userId = req.headers.get('x-user-id');
    console.log('Checking purchases for user:', userId);

    const { data: purchases, error: purchasesError } = await supabaseClient
      .from('ticket_purchases')
      .select('train_number, purchase_status')
      .eq('travel_date', date)
      .eq('user_id', userId);

    if (purchasesError) {
      console.error('Error fetching purchases:', purchasesError);
    }

    // Transform the ticket data
    const tickets = result.map((item: string) => {
      const data = item.split('|');
      const trainNumber = data[3];
      
      return {
        trainNumber,
        fromStation: data[6],
        toStation: data[7],
        departureTime: data[8],
        arrivalTime: data[9],
        duration: data[10],
        remainingTickets: parseInt(data[30]) || 0,
        price: 0,
        purchased: purchases?.some(p => 
          p.train_number === trainNumber && 
          p.purchase_status === 'completed'
        ) || false
      };
    });

    console.log(`Found ${tickets.length} tickets`);

    return new Response(
      JSON.stringify(tickets),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in query-tickets function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});