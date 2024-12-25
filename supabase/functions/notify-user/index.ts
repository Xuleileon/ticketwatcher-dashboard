import { serve } from 'https://deno.fresh.dev/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, message } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 获取用户信息
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    // 发送邮件通知
    // TODO: 实现实际的邮件发送功能
    console.log(`Sending email to ${user.email}: ${message}`)

    // 发送实时通知
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        message,
        type: 'ticket_order',
        read: false
      })

    return new Response(
      JSON.stringify({ message: 'Notification sent' }),
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