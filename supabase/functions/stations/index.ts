import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Station {
  name: string;
  code: string;
  pinyin: string;
  acronym: string;
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

    // Check if we already have stations in the database
    const { data: existingStations } = await supabaseClient
      .from('stations')
      .select('*')
      .limit(1)

    if (existingStations && existingStations.length > 0) {
      // Return cached stations
      const { data: stations } = await supabaseClient
        .from('stations')
        .select('*')
        .order('name')

      return new Response(
        JSON.stringify(stations),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If no stations in DB, fetch from 12306
    const response = await fetch(
      'https://kyfw.12306.cn/otn/resources/js/framework/station_name.js',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch stations')
    }

    const text = await response.text()
    const stationsData = text.split('@').slice(1)
    const stations: Station[] = stationsData.map(station => {
      const [name, code, pinyin, acronym] = station.split('|')
      return { name, code, pinyin, acronym }
    })

    // Store in database
    const { error: insertError } = await supabaseClient
      .from('stations')
      .insert(stations)

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify(stations),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})