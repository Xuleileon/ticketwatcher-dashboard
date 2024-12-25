import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      taskId,
      success,
      error
    } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update RPA task status
    const { data: rpaTask, error: updateError } = await supabaseClient
      .from('rpa_tasks')
      .update({
        status: success ? 'completed' : 'failed',
        end_time: new Date().toISOString(),
        error_message: error || null
      })
      .eq('id', taskId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update watch_task status
    await supabaseClient
      .from('watch_tasks')
      .update({
        status: success ? 'completed' : 'failed'
      })
      .eq('id', rpaTask.watch_task_id);

    // Send notification
    await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/notify-user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          userId: rpaTask.user_id,
          message: `抢票${success ? '成功' : '失败'}！${error ? `错误信息：${error}` : ''}`
        })
      }
    );

    return new Response(
      JSON.stringify({ message: 'Callback processed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});