import { TicketInfo, CommutePreference } from '@/types/components';
import { getNext15WorkDays, formatDate } from '@/components/TicketMonitor/DateUtils';
import { supabase } from '@/integrations/supabase/client';

export interface Station {
  name: string;
  code: string;
  pinyin: string;
  acronym: string;
}

export class Railway12306 {
  private static instance: Railway12306;
  private stationsCache: Map<string, Station> = new Map();
  
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
      const { data: stations, error } = await supabase
        .from('stations')
        .select('*');

      if (error) throw error;

      stations.forEach((station: Station) => {
        this.stationsCache.set(station.name, station);
      });
    } catch (error) {
      console.error('Failed to load stations:', error);
    }
  }

  private async getStationCode(stationName: string): Promise<string | null> {
    const station = this.stationsCache.get(stationName);
    if (station) return station.code;

    // Try reloading stations if not found
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

      const { data, error } = await supabase.functions.invoke('query-tickets', {
        body: {
          date,
          fromStation: fromCode,
          toStation: toCode
        }
      });

      if (error) {
        console.error('Error querying tickets:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error querying tickets:', error);
      return [];
    }
  }

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
}