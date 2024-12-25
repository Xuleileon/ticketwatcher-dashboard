import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import axios from 'npm:axios';

interface QueryTicketsBody {
  date: string;
  fromStation: string;
  toStation: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { date, fromStation, toStation } = await req.json() as QueryTicketsBody;

    // 构建12306查询URL
    const url = `https://kyfw.12306.cn/otn/leftTicket/queryO?leftTicketDTO.train_date=${date}&leftTicketDTO.from_station=${fromStation}&leftTicketDTO.to_station=${toStation}&purpose_codes=ADULT`;

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    console.log('Querying 12306 API:', { url, headers });

    const response = await axios.get(url, { headers });
    const result = response.data.data.result;

    // Get user's purchased tickets
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: purchases } = await supabaseClient
      .from('ticket_purchases')
      .select('train_number, purchase_status')
      .eq('travel_date', date)
      .eq('user_id', req.headers.get('x-user-id'));

    // Transform the data
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
        remainingTickets: parseInt(data[30]) || 0, // 二等座余票数
        price: 0, // 12306 API doesn't provide price info directly
        purchased: purchases?.some(p => 
          p.train_number === trainNumber && 
          p.purchase_status === 'completed'
        ) || false
      };
    });

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
    console.error('Error querying tickets:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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