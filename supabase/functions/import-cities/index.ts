import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 创建 Supabase 客户端
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // 从12306获取车站数据
    const response = await fetch(
      'https://kyfw.12306.cn/otn/resources/js/framework/station_name.js',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch stations');
    }

    const text = await response.text();
    const stationsData = text.split('@').slice(1);
    
    // 解析并格式化车站数据
    const stations = stationsData.map(station => {
      const [name, code, pinyin, acronym] = station.split('|');
      return { name, code, pinyin, acronym };
    });

    console.log(`Parsed ${stations.length} stations`);

    // 批量插入车站数据
    const { error: insertError } = await supabaseClient
      .from('stations')
      .upsert(stations, {
        onConflict: 'code'
      });

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
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
    console.error('Error importing stations:', error);
    
    return new Response(
      JSON.stringify({ 
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