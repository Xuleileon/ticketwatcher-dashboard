import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import puppeteer from 'https://esm.sh/puppeteer@21.6.1'

interface TicketInfo {
  trainNo: string;
  fromStation: string;
  toStation: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  seats: {
    secondClass: string;
    firstClass: string;
    business: string;
    noSeat: string;
    hardSeat: string;
    hardSleeper: string;
    softSleeper: string;
  };
}

export class Railway12306 {
  private headers: Record<string, string>;
  private cityData: Record<string, string>;
  private supabaseClient: any;
  private browser: any;

  constructor(cookie: string) {
    this.headers = {
      'Cookie': cookie,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
    };
    this.cityData = {};
    this.supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
  }

  async loadCityData() {
    const { data: cities, error } = await this.supabaseClient
      .from('cities')
      .select('name, code')

    if (error) throw error

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
    const page = await this.initBrowser();
    
    try {
      // 访问登录页面
      await page.goto('https://kyfw.12306.cn/otn/resources/login.html', {
        waitUntil: 'networkidle0'
      });
      
      // 输入账号密码
      await page.type('#J-userName', username);
      await page.type('#J-password', password);
      await page.click('#J-login');
      
      // 等待并处理验证码
      await page.waitForSelector('#id_card', { timeout: 5000 });
      await page.type('#id_card', idCard);
      
      // 等待短信验证码输入框
      await page.waitForSelector('#verification_code', { timeout: 5000 });
      await page.click('#verification_code');
      
      // 等待用户手动输入验证码
      await page.waitForFunction(
        'document.querySelector("#code").value.length === 6',
        { timeout: 60000 }
      );
      
      // 点击确认按钮
      await page.click('#sureClick');
      
      // 等待登录成功
      await page.waitForNavigation({
        waitUntil: 'networkidle0',
        timeout: 10000
      });
      
      // 获取登录后的Cookie
      const cookies = await page.cookies();
      this.headers.Cookie = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      await page.close();
    }
  }

  async submitOrder(trainNo: string, passengers: string[]): Promise<{success: boolean; orderNo?: string}> {
    const page = await this.initBrowser();
    
    try {
      // 访问车票预订页面
      await page.goto('https://kyfw.12306.cn/otn/leftTicket/init', {
        waitUntil: 'networkidle0'
      });
      
      // 设置Cookie
      const cookieObjects = this.headers.Cookie.split('; ').map(cookie => {
        const [name, value] = cookie.split('=');
        return { name, value, domain: '.12306.cn' };
      });
      await page.setCookie(...cookieObjects);
      
      // 选择车次
      await page.waitForSelector(`#queryLeftTable tr:contains(${trainNo})`, {
        timeout: 5000
      });
      await page.click(`#queryLeftTable tr:contains(${trainNo}) .btn72`);
      
      // 选择乘客
      for (const passenger of passengers) {
        await page.waitForSelector('#normalPassenger_0', { timeout: 5000 });
        await page.click('#normalPassenger_0');
      }
      
      // 提交订单
      await page.waitForSelector('#submitOrder_id', { timeout: 5000 });
      await page.click('#submitOrder_id');
      
      // 确认订单
      await page.waitForSelector('#qr_submit_id', { timeout: 5000 });
      await page.click('#qr_submit_id');
      
      // 获取订单号
      await page.waitForSelector('.order-num', { timeout: 10000 });
      const orderNo = await page.$eval('.order-num', (el: any) => el.textContent);
      
      return {
        success: true,
        orderNo: orderNo.trim()
      };
    } catch (error) {
      console.error('Order submission failed:', error);
      return {
        success: false
      };
    } finally {
      await page.close();
    }
  }

  private async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080'
        ]
      });
    }
    return await this.browser.newPage();
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
} 