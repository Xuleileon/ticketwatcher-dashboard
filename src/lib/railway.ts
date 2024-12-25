import { supabase } from '@/integrations/supabase/client';
import type { TicketInfo, CommutePreference } from '@/types/components';

export class Railway12306 {
  private static instance: Railway12306;
  private stationsCache: Map<string, { code: string }> = new Map();
  
  private constructor() {
    this.loadStations();
  }

  public static getInstance(): Railway12306 {
    if (!Railway12306.instance) {
      Railway12306.instance = new Railway12306();
    }
    return Railway12306.instance;
  }

  private async loadStations() {
    try {
      // 首先尝试导入车站数据
      await supabase.functions.invoke('import-cities');
      console.log('Triggered station import');

      // 然后加载车站数据到缓存
      const { data: stations, error } = await supabase
        .from('stations')
        .select('name, code');

      if (error) throw error;

      this.stationsCache.clear();
      stations.forEach((station: { name: string; code: string }) => {
        this.stationsCache.set(station.name, { code: station.code });
      });
      
      console.log('Stations loaded:', this.stationsCache.size);
    } catch (error) {
      console.error('Failed to load stations:', error);
    }
  }

  private async getStationCode(stationName: string): Promise<string | null> {
    const station = this.stationsCache.get(stationName);
    if (station) return station.code;

    // 如果缓存中没有，重新加载车站数据
    await this.loadStations();
    const reloadedStation = this.stationsCache.get(stationName);
    return reloadedStation?.code || null;
  }

  async queryTicketsByDate(date: string, fromStation: string, toStation: string): Promise<TicketInfo[]> {
    try {
      const fromCode = await this.getStationCode(fromStation);
      const toCode = await this.getStationCode(toStation);

      if (!fromCode || !toCode) {
        console.error(`Station codes not found for ${fromStation} or ${toStation}`);
        return [];
      }

      console.log('Querying tickets with:', { date, fromCode, toCode });

      const { data, error } = await supabase.functions.invoke('query-tickets', {
        body: {
          date,
          fromStation: fromCode,
          toStation: toCode
        }
      });

      if (error) {
        console.error('Error from query-tickets function:', error);
        return [];
      }

      // 检查用户是否已购买该日期的车票
      const { data: purchases } = await supabase
        .from('ticket_purchases')
        .select('train_number, purchase_status')
        .eq('travel_date', date)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      // 合并购票状态与车票信息
      return (data || []).map((ticket: TicketInfo) => ({
        ...ticket,
        purchased: purchases?.some(p => 
          p.train_number === ticket.trainNumber && 
          p.purchase_status === 'completed'
        ) || false
      }));

    } catch (error) {
      console.error('Error in queryTicketsByDate:', error);
      return [];
    }
  }

  async queryTickets(preferences: CommutePreference): Promise<{
    morningTickets: Record<string, TicketInfo>;
    eveningTickets: Record<string, TicketInfo>;
  }> {
    const workDays = this.getNext15WorkDays();
    const morningTickets: Record<string, TicketInfo> = {};
    const eveningTickets: Record<string, TicketInfo> = {};

    for (const date of workDays) {
      const dateStr = this.formatDate(date);
      const tickets = await this.queryTicketsByDate(
        date.toISOString().split('T')[0],
        preferences.fromStation,
        preferences.toStation
      );

      const morningTicket = tickets.find(t => t.trainNumber === preferences.morningTrainNumber);
      if (morningTicket) {
        morningTickets[dateStr] = morningTicket;
      }

      const eveningTicket = tickets.find(t => t.trainNumber === preferences.eveningTrainNumber);
      if (eveningTicket) {
        eveningTickets[dateStr] = eveningTicket;
      }
    }

    return { morningTickets, eveningTickets };
  }

  private getNext15WorkDays(): Date[] {
    const days: Date[] = [];
    const startDate = new Date();
    let currentDate = new Date(startDate);
    
    while (days.length < 15) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        days.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }

  private formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  }
}