import { TicketInfo } from '@/types/components';

export interface Station {
  name: string;
  code: string;
  pinyin: string;
  acronym: string;
}

export class Railway12306 {
  private static instance: Railway12306;
  private baseUrl: string;
  private stationsCache: Station[] | null = null;
  
  private constructor() {
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/railway`;
  }

  public static getInstance(): Railway12306 {
    if (!Railway12306.instance) {
      Railway12306.instance = new Railway12306();
    }
    return Railway12306.instance;
  }

  // 获取车站列表
  async getStations(): Promise<Station[]> {
    try {
      // 如果已经缓存了站点数据，直接返回
      if (this.stationsCache) {
        return this.stationsCache;
      }

      const response = await fetch(
        `${this.baseUrl}/otn/resources/js/framework/station_name.js`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        }
      );
      
      if (!response.ok) throw new Error('获取车站列表失败');
      
      const text = await response.text();
      // 解析返回的JavaScript文件内容
      const stationsData = text.substring(text.indexOf("'") + 1, text.lastIndexOf("'"));
      const stations = stationsData.split('@').filter(Boolean).map(station => {
        const [name, code, pinyin, acronym] = station.split('|');
        return { name, code, pinyin, acronym };
      });

      // 缓存站点数据
      this.stationsCache = stations;
      return stations;
    } catch (error) {
      console.error('获取车站列表出错:', error);
      return [];
    }
  }

  // 获取站点代码
  async getStationCode(stationName: string): Promise<string | null> {
    const stations = await this.getStations();
    const station = stations.find(s => s.name === stationName);
    return station?.code || null;
  }

  // 查询车票信息
  async queryTickets(date: string, fromStation: string, toStation: string): Promise<TicketInfo[]> {
    try {
      const fromCode = await this.getStationCode(fromStation);
      const toCode = await this.getStationCode(toStation);

      if (!fromCode || !toCode) {
        throw new Error('无效的站点名称');
      }

      const params = new URLSearchParams({
        'leftTicketDTO.train_date': date,
        'leftTicketDTO.from_station': fromCode,
        'leftTicketDTO.to_station': toCode,
        'purpose_codes': 'ADULT'
      });

      const response = await fetch(
        `${this.baseUrl}/otn/leftTicket/queryZ?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        }
      );

      if (!response.ok) throw new Error('查询车票失败');
      
      const data = await response.json();
      if (!data.data?.result) return [];

      return data.data.result.map((ticket: string) => {
        const fields = ticket.split('|');
        return {
          trainNumber: fields[3],
          fromStation: fields[6],
          toStation: fields[7],
          departureTime: fields[8],
          arrivalTime: fields[9],
          remainingTickets: parseInt(fields[fields.length - 1]) || 0,
          price: parseFloat(fields[fields.length - 2]) || 0
        };
      });
    } catch (error) {
      console.error('查询车票出错:', error);
      return [];
    }
  }
} 