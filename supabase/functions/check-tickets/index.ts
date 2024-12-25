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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 获取活跃的抢票任务
    const { data: tasks, error: tasksError } = await supabaseClient
      .from('watch_tasks')
      .select('*, users!inner(*)')
      .eq('status', 'active')

    if (tasksError) throw tasksError

    // 初始化12306客户端
    const railway = new Railway12306(Deno.env.get('RAILWAY_COOKIE') ?? '')
    await railway.loadCityData()

    // 处理每个任务
    for (const task of tasks) {
      // 查询车票
      const tickets = await railway.queryTickets(
        task.travel_date,
        task.from_station,
        task.to_station
      )

      // 检查是否有符合条件的车票
      const availableTicket = tickets.find(ticket => {
        // 检查是否是优先车次
        if (task.preferred_trains.length > 0 && !task.preferred_trains.includes(ticket.trainNo)) {
          return false
        }

        // 检查座位类型
        for (const seatType of task.seat_types) {
          const remaining = ticket.seats[seatType]
          if (remaining && remaining !== '无' && remaining !== '*') {
            return true
          }
        }
        return false
      })

      if (availableTicket) {
        // 更新票务信息
        await supabaseClient
          .from('tickets')
          .upsert({
            train_no: availableTicket.trainNo,
            from_station: task.from_station,
            to_station: task.to_station,
            departure_time: new Date(`${task.travel_date} ${availableTicket.departureTime}`),
            arrival_time: new Date(`${task.travel_date} ${availableTicket.arrivalTime}`),
            seat_type: task.seat_types[0],
            price: 0, // 价格需要在下单时获取
            remaining_tickets: 1
          })

        // 尝试登录
        const loginSuccess = await railway.login(
          task.users.username,
          task.users.password,
          task.users.id_card
        )

        if (loginSuccess) {
          // 触发自动下单
          await fetch(
            `${Deno.env.get('SUPABASE_URL')}/functions/v1/auto-order`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
              },
              body: JSON.stringify({
                taskId: task.id,
                ticketInfo: availableTicket
              })
            }
          )
        }
      }
    }

    return new Response(
      JSON.stringify({ message: 'Tickets checked successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 