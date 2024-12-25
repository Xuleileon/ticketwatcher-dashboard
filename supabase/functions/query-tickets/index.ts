import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from '@supabase/supabase-js';

interface TicketInfo {
  trainNumber: string;
  fromStation: string;
  toStation: string;
  departureTime: string;
  arrivalTime: string;
  remainingTickets: number;
  price: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { date, fromStation, toStation } = await req.json();
    console.log('Received query request:', { date, fromStation, toStation });

    // 创建 Supabase 客户端
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // 获取车站代码
    const { data: fromStationData, error: fromError } = await supabaseClient
      .from('stations')
      .select('code')
      .eq('name', fromStation)
      .single();

    const { data: toStationData, error: toError } = await supabaseClient
      .from('stations')
      .select('code')
      .eq('name', toStation)
      .single();

    if (fromError || toError || !fromStationData || !toStationData) {
      console.error('Station lookup error:', { fromError, toError });
      throw new Error(`Station codes not found for ${fromStation} or ${toStation}`);
    }

    const fromCode = fromStationData.code;
    const toCode = toStationData.code;

    console.log('Found station codes:', { fromCode, toCode });

    // 构建 12306 API 请求
    const url = `https://kyfw.12306.cn/otn/leftTicket/query?leftTicketDTO.train_date=${date}&leftTicketDTO.from_station=${fromCode}&leftTicketDTO.to_station=${toCode}&purpose_codes=ADULT`;

    console.log('Querying 12306 API:', { url });

    const headers = {
      'Accept': '*/*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'Pragma': 'no-cache',
      'Referer': 'https://kyfw.12306.cn/otn/leftTicket/init',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    const response = await fetch(url, { headers });
    const responseText = await response.text();

    try {
      const data = JSON.parse(responseText);
      console.log('API Response:', data);

      if (!data.data?.result) {
        console.error('Unexpected response structure:', data);
        throw new Error('Invalid response structure from 12306 API');
      }

      const tickets: TicketInfo[] = data.data.result
        .map((ticket: string) => {
          const fields = ticket.split('|');
          if (fields.length < 32) {
            console.warn('Unexpected ticket data structure:', ticket);
            return null;
          }

          // 解析余票信息
          const parseTicketCount = (info: string): number => {
            if (!info || info === '无' || info === '*') return 0;
            if (info === '有') return 999;
            const count = parseInt(info);
            return isNaN(count) ? 0 : count;
          };

          // 解析价格信息
          const parsePrice = (info: string): number => {
            if (!info) return 0;
            const match = info.match(/¥(\d+(\.\d{1,2})?)/);
            if (!match) return 0;
            return parseFloat(match[1]);
          };

          return {
            trainNumber: fields[3],
            fromStation: fields[6],
            toStation: fields[7],
            departureTime: fields[8],
            arrivalTime: fields[9],
            remainingTickets: parseTicketCount(fields[30]), // 二等座
            price: parsePrice(fields[30])
          };
        })
        .filter((ticket): ticket is TicketInfo => ticket !== null);

      return new Response(JSON.stringify(tickets), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } catch (parseError) {
      console.error('Error parsing response:', responseText);
      throw new Error('Failed to parse 12306 API response');
    }

  } catch (error) {
    console.error('Error in query-tickets function:', error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 500
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});