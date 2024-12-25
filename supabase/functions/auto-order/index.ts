import { serve } from 'https://deno.fresh.dev/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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
    const { taskId, ticketInfo } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 获取任务详情
    const { data: task, error: taskError } = await supabaseClient
      .from('watch_tasks')
      .select('*, users!inner(*)')
      .eq('id', taskId)
      .single()

    if (taskError) throw taskError

    // 初始化12306客户端
    const railway = new Railway12306(Deno.env.get('RAILWAY_COOKIE') ?? '')
    await railway.loadCityData()

    // 尝试登录（以防之前的登录已过期）
    const loginSuccess = await railway.login(
      task.users.username,
      task.users.password,
      task.users.id_card
    )

    if (!loginSuccess) {
      throw new Error('登录失败')
    }

    // 提交订单
    const orderResult = await railway.submitOrder(
      ticketInfo.trainNo,
      task.passenger_ids
    )

    if (orderResult.success) {
      // 创建订单记录
      await supabaseClient
        .from('order_records')
        .insert({
          user_id: task.user_id,
          watch_task_id: taskId,
          train_no: ticketInfo.trainNo,
          order_no: orderResult.orderNo,
          status: 'success',
          passenger_info: {
            passengers: task.passenger_ids,
            seat_type: task.seat_types[0],
            train_info: ticketInfo
          }
        })

      // 更新任务状态
      await supabaseClient
        .from('watch_tasks')
        .update({ status: 'completed' })
        .eq('id', taskId)

      // 发送通知
      await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/notify-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            userId: task.user_id,
            message: `抢票成功！车次：${ticketInfo.trainNo}，订单号：${orderResult.orderNo}`
          })
        }
      )
    } else {
      // 如果下单失败，记录失败状态但保持任务活跃
      await supabaseClient
        .from('order_records')
        .insert({
          user_id: task.user_id,
          watch_task_id: taskId,
          train_no: ticketInfo.trainNo,
          status: 'failed',
          passenger_info: {
            passengers: task.passenger_ids,
            seat_type: task.seat_types[0],
            train_info: ticketInfo,
            error: '下单失败'
          }
        })
    }

    return new Response(
      JSON.stringify({ message: 'Order processed', success: orderResult.success }),
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