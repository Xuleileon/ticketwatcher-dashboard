import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import axios from 'npm:axios'

interface QueryTicketsBody {
  date: string
  fromStation: string
  toStation: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { date, fromStation, toStation } = await req.json() as QueryTicketsBody

    // 构建12306查询URL
    const url = `https://kyfw.12306.cn/otn/leftTicket/queryO?leftTicketDTO.train_date=${date}&leftTicketDTO.from_station=${fromStation}&leftTicketDTO.to_station=${toStation}&purpose_codes=ADULT`

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    const response = await axios.get(url, { headers })
    const result = response.data.data.result

    // 转换为前端需要的格式
    const tickets = result.map((item: string) => {
      const data = item.split('|')
      return {
        trainNumber: data[3],
        fromStation: data[6],
        toStation: data[7],
        departureTime: data[8],
        arrivalTime: data[9],
        duration: data[10],
        seats: {
          secondClass: data[30],
          firstClass: data[31],
          business: data[32],
          noSeat: data[26],
          hardSeat: data[29],
          hardSleeper: data[28],
          softSleeper: data[23]
        }
      }
    })

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
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})