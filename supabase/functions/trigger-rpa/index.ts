import { serve } from 'https://deno.fresh.dev/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getSign(secret: string, timestamp: string): string {
  const stringToSign = `${timestamp}\n${secret}`;
  const encoder = new TextEncoder();
  const key = encoder.encode(stringToSign);
  const data = new Uint8Array(0);
  // @ts-ignore: Deno中crypto.subtle.sign的类型定义问题
  return crypto.subtle.sign('HMAC-SHA256', key, data)
    .then(signature => btoa(String.fromCharCode(...new Uint8Array(signature))));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { taskId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 获取任务详情
    const { data: task, error: taskError } = await supabaseClient
      .from('watch_tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (taskError) throw taskError

    // 创建RPA任务记录
    const { data: rpaTask, error: rpaError } = await supabaseClient
      .from('rpa_tasks')
      .insert({
        watch_task_id: taskId,
        status: 'pending'
      })
      .select()
      .single()

    if (rpaError) throw rpaError

    // 触发RPA Webhook
    if (task.rpa_webhook_url) {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const sign = await getSign(Deno.env.get('RPA_SIGN_KEY') ?? '', timestamp);

      const response = await fetch(task.rpa_webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sign,
          timestamp,
          params: {
            fromStation: task.from_station,
            toStation: task.to_station,
            travelDate: task.travel_date,
            trainNumber: task.preferred_trains[0] || '',
            seatType: task.seat_types[0] || '二等座',
            callbackUrl: task.rpa_callback_url
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to trigger RPA webhook')
      }

      const rpaResponse = await response.json()

      // 更新RPA任务状态和流程信息
      await supabaseClient
        .from('rpa_tasks')
        .update({
          status: 'running',
          start_time: new Date().toISOString(),
          enterprise_id: rpaResponse.enterpriseId,
          flow_id: rpaResponse.flowId,
          flow_process_no: rpaResponse.flowProcessNo
        })
        .eq('id', rpaTask.id)
    }

    return new Response(
      JSON.stringify({ 
        message: 'RPA task triggered successfully',
        rpaTaskId: rpaTask.id 
      }),
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