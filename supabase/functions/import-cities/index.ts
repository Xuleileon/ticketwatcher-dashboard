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

    // 从存储中获取cities.json
    const { data: fileData, error: fileError } = await supabaseClient
      .storage
      .from('assets')
      .download('cities.json')

    if (fileError) throw fileError

    const citiesData = JSON.parse(await fileData.text())
    const cities = Object.entries(citiesData).map(([name, code]) => ({
      name,
      code
    }))

    // 批量插入城市数据
    const { error: insertError } = await supabaseClient
      .from('cities')
      .upsert(cities, {
        onConflict: 'name'
      })

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ message: 'Cities imported successfully', count: cities.length }),
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
