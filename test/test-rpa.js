import crypto from 'crypto';
import fetch from 'node-fetch';

const WEBHOOK_URL = 'https://api-rpa.bazhuayu.com/api/v1/bots/webhooks/676bb714c376815b7ad98291/invoke';
const SECRET_KEY = 'JKzF0i7IuE6k+d2a5wqzeg==';

function getSign(secret, timestamp) {
  const stringToSign = `${timestamp}\n${secret}`;
  return crypto
    .createHmac('sha256', stringToSign)
    .update(Buffer.from(''))
    .digest('base64');
}

async function testRPAWebhook() {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const sign = getSign(SECRET_KEY, timestamp);

    console.log('发送请求到RPA...');
    console.log('时间戳:', timestamp);
    console.log('签名:', sign);

    const requestBody = {
      sign,
      timestamp,
      params: {
        fromStation: '北京',
        toStation: '上海',
        travelDate: '2024-01-20',
        trainNumber: 'G1234',
        seatType: '二等座',
        callbackUrl: 'https://your-callback-url.com'
      }
    };

    console.log('请求体:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log('RPA响应:', data);
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testRPAWebhook(); 