import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

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

    // 构建 12306 API 请求
    const url = `https://kyfw.12306.cn/otn/leftTicket/queryO?leftTicketDTO.train_date=${date}&leftTicketDTO.from_station=${fromStation}&leftTicketDTO.to_station=${toStation}&purpose_codes=ADULT`;

    const response = await fetch(url, {
      headers: {
        'Cookie': '_uab_collina=171959196059070525462211; JSESSIONID=934CC95F7C881851D560D6EF8B7B67B5; tk=OYBnZPnapPHALsWNqLyIlFgK3ADcfICc3mdXI8QJZ-slmB1B0; _jc_save_wfdc_flag=dc; guidesStatus=off; highContrastMode=defaltMode; cursorStatus=off; route=6f50b51faa11b987e576cdb301e545c4; BIGipServerotn=1943601418.64545.0000; BIGipServerpassport=954728714.50215.0000',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`12306 API responded with status ${response.status}`);
    }

    const data = await response.json();
    
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

        // 字段映射说明：
        // fields[3]: 车次
        // fields[6]: 出发站代码
        // fields[7]: 到达站代码
        // fields[8]: 出发时间
        // fields[9]: 到达时间
        // fields[30]: 二等座余票
        // fields[31]: 一等座余票
        // fields[32]: 商务座余票
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