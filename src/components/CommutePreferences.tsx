import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";
import type { CommutePreferencesProps } from '@/types/components';

export const CommutePreferences: React.FC<CommutePreferencesProps> = ({
  onPreferencesChange
}) => {
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [morningTrainNumber, setMorningTrainNumber] = useState('');
  const [eveningTrainNumber, setEveningTrainNumber] = useState('');
  const [seatType, setSeatType] = useState('二等座');
  const [isValidating, setIsValidating] = useState(false);

  const validateStation = async (station: string) => {
    try {
      const response = await fetch(
        `https://kyfw.12306.cn/otn/resources/js/framework/station_name.js`
      );
      if (!response.ok) throw new Error('站点验证失败');
      const text = await response.text();
      // 解析12306返回的站点数据
      const stationData = text.split('@').slice(1);
      return stationData.some(station => station.includes(station));
    } catch (error) {
      console.error('Error validating station:', error);
      return false;
    }
  };

  const validateTrainNumber = async (trainNumber: string) => {
    if (!trainNumber.match(/^[GDCZTKYL]\d{1,4}$/)) {
      return false;
    }
    try {
      // 调用12306列车查询接口验证车次
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/proxy/otn/queryTrainInfo/query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `trainNo=${trainNumber}`
        }
      );
      if (!response.ok) throw new Error('车次验证失败');
      const data = await response.json();
      return data.status && data.data.length > 0;
    } catch (error) {
      console.error('Error validating train number:', error);
      return false;
    }
  };

  const handleSave = async () => {
    setIsValidating(true);
    try {
      // 验证站点
      const isFromStationValid = await validateStation(fromStation);
      const isToStationValid = await validateStation(toStation);
      if (!isFromStationValid || !isToStationValid) {
        toast({
          title: "站点验证失败",
          description: "请输入有效的车站名称",
          variant: "destructive",
        });
        return;
      }

      // 验证车次
      const isMorningTrainValid = await validateTrainNumber(morningTrainNumber);
      const isEveningTrainValid = await validateTrainNumber(eveningTrainNumber);
      if (!isMorningTrainValid || !isEveningTrainValid) {
        toast({
          title: "车次验证失败",
          description: "请输入有效的车次号",
          variant: "destructive",
        });
        return;
      }

      // 所有验证通过，保存设置
      onPreferencesChange({
        fromStation,
        toStation,
        morningTrainNumber,
        eveningTrainNumber,
        seatType
      });

      toast({
        title: "保存成功",
        description: "乘车偏好设置已更新",
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>乘车偏好</CardTitle>
        <CardDescription>设置您的通勤车次信息</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fromStation">出发站</Label>
            <Input
              id="fromStation"
              value={fromStation}
              onChange={(e) => setFromStation(e.target.value)}
              placeholder="请输入出发站"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="toStation">到达站</Label>
            <Input
              id="toStation"
              value={toStation}
              onChange={(e) => setToStation(e.target.value)}
              placeholder="请输入到达站"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="morningTrainNumber">早班车次</Label>
            <Input
              id="morningTrainNumber"
              value={morningTrainNumber}
              onChange={(e) => setMorningTrainNumber(e.target.value.toUpperCase())}
              placeholder="请输入早班车次号"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eveningTrainNumber">晚班车次</Label>
            <Input
              id="eveningTrainNumber"
              value={eveningTrainNumber}
              onChange={(e) => setEveningTrainNumber(e.target.value.toUpperCase())}
              placeholder="请输入晚班车次号"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="seatType">座位类型</Label>
            <Select value={seatType} onValueChange={setSeatType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="二等座">二等座</SelectItem>
                <SelectItem value="一等座">一等座</SelectItem>
                <SelectItem value="商务座">商务座</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleSave}
          disabled={isValidating || !fromStation || !toStation || !morningTrainNumber || !eveningTrainNumber}
        >
          {isValidating ? "验证中..." : "保存设置"}
        </Button>
      </CardFooter>
    </Card>
  );
};