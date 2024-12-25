import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CommutePreferencesProps } from '@/types/components';

export const CommutePreferences: React.FC<CommutePreferencesProps> = ({
  onStartTask,
  onStopTask,
  isTaskRunning
}) => {
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [trainNumber, setTrainNumber] = useState('');
  const [seatType, setSeatType] = useState('二等座');

  const handleStart = () => {
    if (!fromStation || !toStation) {
      return;
    }

    onStartTask({
      fromStation,
      toStation,
      trainNumber: trainNumber || undefined,
      seatTypes: [seatType]
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>乘车偏好</CardTitle>
        <CardDescription>设置您的乘车偏好信息</CardDescription>
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
            <Label htmlFor="trainNumber">车次号（选填）</Label>
            <Input
              id="trainNumber"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              placeholder="请输入优先车次"
            />
          </div>
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
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onStopTask}
            disabled={!isTaskRunning}
          >
            停止任务
          </Button>
          <Button
            onClick={handleStart}
            disabled={isTaskRunning || !fromStation || !toStation}
          >
            开始抢票
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};