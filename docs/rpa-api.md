# RPA接口规范

## 触发RPA任务
```typescript
// 请求URL
POST https://api-rpa.bazhuayu.com/api/v1/bots/webhooks/{webhookId}/invoke

// 请求头
Content-Type: application/json

// 请求体
{
    "sign": "HmacSHA256签名后Base64编码",
    "timestamp": "1704321234",
    "params": {
        "fromStation": "北京",
        "toStation": "上海",
        "travelDate": "2024-01-20",
        "trainNumber": "G1234",
        "seatType": "二等座",
        "callbackUrl": "回调地址"
    }
}

// 响应体
{
    "enterpriseId": "企业ID",
    "flowId": "流程ID",
    "flowProcessNo": "流程实例号"
}
```

## RPA回调接口
```typescript
// 请求URL
POST {callbackUrl}

// 请求头
Content-Type: application/json

// 请求体
{
    "taskId": "RPA任务ID",
    "success": true,  // 或false
    "error": "错误信息（失败时）"
}
```

## 签名算法
```typescript
function getSign(secret: string, timestamp: string): string {
  const stringToSign = `${timestamp}\n${secret}`;
  return crypto
    .createHmac('sha256', stringToSign)
    .update(Buffer.from(''))
    .digest('base64');
}
```