# 部署指南

## 环境配置
### 必需的环境变量
```env
# Supabase配置
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥

# RPA配置
VITE_RPA_WEBHOOK_URL=https://api-rpa.bazhuayu.com/api/v1/bots/webhooks/{webhookId}/invoke
RPA_SIGN_KEY=你的RPA签名密钥

# API配置
VITE_API_URL=你的API基础URL
```

### RPA配置步骤
1. 登录八爪鱼RPA平台
2. 创建新的Webhook触发器
3. 配置运行机器人
4. 获取Webhook URL和签名密钥
5. 设置环境变量

## 部署流程
1. 部署数据库迁移
```bash
supabase db push
```

2. 部署Edge Functions
```bash
supabase functions deploy trigger-rpa
supabase functions deploy rpa-callback
```

3. 部署前端
```bash
npm install
npm run build
npm run deploy
```

## 维护建议
1. 定期更新依赖包
2. 监控12306接口变化
3. 备份重要数据
4. 记录详细的操作日志

## 故障排除
### 常见问题
1. RPA连接失败
   - 检查Webhook URL是否正确
   - 验证签名是否正确
   - 确认RPA机器人是否在线

2. 数据库错误
   - 检查类型定义是否匹配
   - 验证RLS策略是否正确
   - 确认数据库连接状态

3. 前端问题
   - 检查环境变量配置
   - 验证API响应格式
   - 查看控制台错误日志