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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get active tasks
    const { data: tasks, error: tasksError } = await supabaseClient
      .from('ticket_status')
      .select('*')
      .eq('ticket_purchased', false)

    if (tasksError) throw tasksError

    // Check each task
    for (const task of tasks) {
      try {
        // Make direct HTTP request to 12306 API
        const response = await fetch(`https://kyfw.12306.cn/otn/leftTicket/queryZ?leftTicketDTO.train_date=${task.travel_date}&leftTicketDTO.from_station=${task.from_station}&leftTicketDTO.to_station=${task.to_station}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })

        const data = await response.json()
        
        if (data.data && data.data.result) {
          const trainInfo = data.data.result.find((info: string) => 
            info.split('|')[3] === task.train_number
          )

          if (trainInfo) {
            const parts = trainInfo.split('|')
            const firstClassAvailable = parts[31] !== '无' && parts[31] !== '*'
            const secondClassAvailable = parts[30] !== '无' && parts[30] !== '*'

            // Update ticket status
            await supabaseClient
              .from('ticket_status')
              .update({
                first_class_available: firstClassAvailable,
                second_class_available: secondClassAvailable,
                updated_at: new Date().toISOString()
              })
              .eq('id', task.id)
          }
        }
      } catch (error) {
        console.error(`Error checking tickets for task ${task.id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ message: 'Ticket check completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})