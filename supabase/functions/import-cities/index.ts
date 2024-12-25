import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting station import process');
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    );

    // Fetch station data from 12306
    const response = await fetch(
      'https://kyfw.12306.cn/otn/resources/js/framework/station_name.js',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch stations: ${response.status}`);
    }

    const text = await response.text();
    console.log('Received raw station data');

    // Parse station data
    const stationsText = text.substring(text.indexOf("'") + 1, text.lastIndexOf("'"));
    const stationsData = stationsText.split('@').slice(1);
    
    const stations = stationsData.map(station => {
      const [name, code, pinyin, acronym] = station.split('|');
      return {
        name,
        code,
        pinyin,
        acronym,
        updated_at: new Date().toISOString()
      };
    });

    console.log(`Parsed ${stations.length} stations`);

    // Batch insert stations in chunks to avoid request size limits
    const chunkSize = 100;
    for (let i = 0; i < stations.length; i += chunkSize) {
      const chunk = stations.slice(i, i + chunkSize);
      const { error: upsertError } = await supabaseClient
        .from('stations')
        .upsert(chunk, {
          onConflict: 'code'
        });

      if (upsertError) {
        console.error(`Error upserting stations chunk ${i}-${i + chunkSize}:`, upsertError);
        throw upsertError;
      }
    }

    console.log('Successfully imported all stations');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Stations imported successfully',
        count: stations.length
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in import-cities function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});