import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CommutePreferencesProps } from '@/types/components';

export const CommutePreferences: React.FC<CommutePreferencesProps> = ({
  onPreferencesChange
}) => {
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [morningTrainNumber, setMorningTrainNumber] = useState('');
  const [eveningTrainNumber, setEveningTrainNumber] = useState('');
  const [seatType, setSeatType] = useState('二等座');

  // 当任何值改变时，通知父组件
  React.useEffect(() => {
    onPreferencesChange({
      fromStation,
      toStation,
      morningTrainNumber,
      eveningTrainNumber,
      seatType
    });
  }, [fromStation, toStation, morningTrainNumber, eveningTrainNumber, seatType]);

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
              onChange={(e) => setMorningTrainNumber(e.target.value)}
              placeholder="请输入早班车次号"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eveningTrainNumber">晚班车次</Label>
            <Input
              id="eveningTrainNumber"
              value={eveningTrainNumber}
              onChange={(e) => setEveningTrainNumber(e.target.value)}
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
    </Card>
  );
};