import { TicketInfo, CommutePreference } from '@/types/components';
import { getNext15WorkDays, formatDate } from '@/components/TicketMonitor/DateUtils';

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

  // 查询指定日期的车票信息
  async queryTicketsByDate(date: string, fromStation: string, toStation: string): Promise<TicketInfo[]> {
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
        `${this.baseUrl}/otn/leftTicket/queryO?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Cookie': `_uab_collina=171959196059070525462211; JSESSIONID=934CC95F7C881851D560D6EF8B7B67B5; tk=OYBnZPnapPHALsWNqLyIlFgK3ADcfICc3mdXI8QJZ-slmB1B0; _jc_save_wfdc_flag=dc; guidesStatus=off; highContrastMode=defaltMode; cursorStatus=off; route=6f50b51faa11b987e576cdb301e545c4; BIGipServerotn=1943601418.64545.0000; BIGipServerpassport=954728714.50215.0000`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
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
          remainingTickets: this.parseTicketCount(fields[30]), // 二等座
          price: this.parsePrice(fields[30]) // 二等座价格
        };
      });
    } catch (error) {
      console.error('查询车票出错:', error);
      return [];
    }
  }

  private parseTicketCount(ticketInfo: string): number {
    if (ticketInfo === '无' || ticketInfo === '*') return 0;
    if (ticketInfo === '有') return 999;
    const count = parseInt(ticketInfo);
    return isNaN(count) ? 0 : count;
  }

  private parsePrice(priceInfo: string): number {
    const match = priceInfo.match(/¥(\d+(\.\d{1,2})?)/);
    if (!match) return 0;
    return parseFloat(match[1]);
  }

  // 查询未来15个工作日的早晚班车票
  async queryTickets(preferences: CommutePreference): Promise<{
    morningTickets: Record<string, TicketInfo>;
    eveningTickets: Record<string, TicketInfo>;
  }> {
    const workDays = getNext15WorkDays();
    const morningTickets: Record<string, TicketInfo> = {};
    const eveningTickets: Record<string, TicketInfo> = {};

    for (const date of workDays) {
      const dateStr = formatDate(date);
      const tickets = await this.queryTicketsByDate(
        date.toISOString().split('T')[0],
        preferences.fromStation,
        preferences.toStation
      );

      // 查找早班车
      const morningTicket = tickets.find(t => t.trainNumber === preferences.morningTrainNumber);
      if (morningTicket) {
        morningTickets[dateStr] = morningTicket;
      }

      // 查找晚班车
      const eveningTicket = tickets.find(t => t.trainNumber === preferences.eveningTrainNumber);
      if (eveningTicket) {
        eveningTickets[dateStr] = eveningTicket;
      }
    }

    return { morningTickets, eveningTickets };
  }
} 