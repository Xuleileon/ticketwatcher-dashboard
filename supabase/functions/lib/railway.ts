import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { BrowserManager } from './browser.ts';
import { TicketInfo, OrderResult } from './types.ts';

export class Railway12306 {
  private headers: Record<string, string>;
  private cityData: Record<string, string>;
  private supabaseClient: any;
  private browserManager: BrowserManager;

  constructor(cookie: string) {
    this.headers = {
      'Cookie': cookie,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    this.cityData = {};
    this.supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    this.browserManager = new BrowserManager();
  }

  async loadCityData() {
    const { data: cities, error } = await this.supabaseClient
      .from('cities')
      .select('name, code');

    if (error) throw error;

    this.cityData = cities.reduce((acc: Record<string, string>, city: any) => {
      acc[city.name] = city.code;
      return acc;
    }, {});
  }

  async queryTickets(date: string, fromCity: string, toCity: string): Promise<TicketInfo[]> {
    const url = `https://kyfw.12306.cn/otn/leftTicket/queryO?leftTicketDTO.train_date=${date}&leftTicketDTO.from_station=${this.cityData[fromCity]}&leftTicketDTO.to_station=${this.cityData[toCity]}&purpose_codes=ADULT`;
    
    const response = await fetch(url, { headers: this.headers });
    const data = await response.json();
    
    if (!data.data?.result) {
      return [];
    }

    return data.data.result.map((item: string) => {
      const parts = item.split('|');
      return {
        trainNo: parts[3],
        fromStation: parts[6],
        toStation: parts[7],
        departureTime: parts[8],
        arrivalTime: parts[9],
        duration: parts[10],
        seats: {
          secondClass: parts[30],
          firstClass: parts[31],
          business: parts[32],
          hardSleeper: parts[28],
          hardSeat: parts[29],
          noSeat: parts[26],
          softSleeper: parts[23]
        }
      };
    });
  }

  async login(username: string, password: string, idCard: string): Promise<boolean> {
    const page = await this.browserManager.initBrowser();
    
    try {
      await page.goto('https://kyfw.12306.cn/otn/resources/login.html');
      await page.type('#J-userName', username);
      await page.type('#J-password', password);
      await page.click('#J-login');
      await page.waitForSelector('#id_card', { timeout: 5000 });
      await page.type('#id_card', idCard);
      
      // Return verification code input element for frontend handling
      const verificationElement = await page.$('#verification_code');
      if (verificationElement) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      await page.close();
    }
  }

  async submitOrder(trainNo: string, passengers: string[]): Promise<OrderResult> {
    const page = await this.browserManager.initBrowser();
    
    try {
      await page.goto('https://kyfw.12306.cn/otn/leftTicket/init');
      
      const cookieObjects = this.headers.Cookie.split('; ').map(cookie => {
        const [name, value] = cookie.split('=');
        return { name, value, domain: '.12306.cn' };
      });
      await page.setCookie(...cookieObjects);
      
      await page.waitForSelector(`#queryLeftTable tr:contains(${trainNo})`);
      await page.click(`#queryLeftTable tr:contains(${trainNo}) .btn72`);
      
      for (const passenger of passengers) {
        await page.waitForSelector('#normalPassenger_0');
        await page.click('#normalPassenger_0');
      }
      
      await page.waitForSelector('#submitOrder_id');
      await page.click('#submitOrder_id');
      await page.waitForSelector('#qr_submit_id');
      await page.click('#qr_submit_id');
      
      await page.waitForSelector('.order-num');
      const orderNo = await page.$eval('.order-num', (el: any) => el.textContent);
      
      return {
        success: true,
        orderNo: orderNo.trim()
      };
    } catch (error) {
      console.error('Order submission failed:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      await page.close();
    }
  }

  async cleanup() {
    await this.browserManager.cleanup();
  }
}