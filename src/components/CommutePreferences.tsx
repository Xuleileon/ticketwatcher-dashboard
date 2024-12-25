import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";
import type { CommutePreferencesProps } from '@/types/components';

export const CommutePreferences: React.FC<CommutePreferencesProps> = ({
  onPreferencesChange,
  initialPreferences
}) => {
  const [fromStation, setFromStation] = useState(initialPreferences?.fromStation || '');
  const [toStation, setToStation] = useState(initialPreferences?.toStation || '');
  const [morningTrainNumber, setMorningTrainNumber] = useState(initialPreferences?.morningTrainNumber || '');
  const [eveningTrainNumber, setEveningTrainNumber] = useState(initialPreferences?.eveningTrainNumber || '');
  const [seatType, setSeatType] = useState(initialPreferences?.seatType || '二等座');
  const [isValidating, setIsValidating] = useState(false);

  // 当初始值改变时更新表单
  useEffect(() => {
    if (initialPreferences) {
      setFromStation(initialPreferences.fromStation);
      setToStation(initialPreferences.toStation);
      setMorningTrainNumber(initialPreferences.morningTrainNumber);
      setEveningTrainNumber(initialPreferences.eveningTrainNumber);
      setSeatType(initialPreferences.seatType);
    }
  }, [initialPreferences]);

  const validateTrainNumber = (trainNumber: string) => {
    return trainNumber.match(/^[GDCZTKYL]\d{1,4}$/);
  };

  const handleSave = async () => {
    setIsValidating(true);
    try {
      // 基本输入验证
      if (!fromStation || !toStation) {
        toast({
          title: "验证失败",
          description: "请输入出发站和到达站",
          variant: "destructive",
        });
        return;
      }

      // 验证车次
      const isMorningTrainValid = validateTrainNumber(morningTrainNumber);
      const isEveningTrainValid = validateTrainNumber(eveningTrainNumber);
      if (!isMorningTrainValid || !isEveningTrainValid) {
        toast({
          title: "车次验证失败",
          description: "请输入正确的车次号，例如：G1234、D5678",
          variant: "destructive",
        });
        return;
      }

      // 保存设置
      onPreferencesChange({
        fromStation,
        toStation,
        morningTrainNumber,
        eveningTrainNumber,
        seatType
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>乘车偏好</CardTitle>
        <CardDescription>设置您的通勤车次信息</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fromStation">出发站</Label>
            <Input
              id="fromStation"
              value={fromStation}
              onChange={(e) => setFromStation(e.target.value)}
              placeholder="请输入出发站"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="toStation">到达站</Label>
            <Input
              id="toStation"
              value={toStation}
              onChange={(e) => setToStation(e.target.value)}
              placeholder="请输入到达站"
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="morningTrainNumber">早班车次</Label>
            <Input
              id="morningTrainNumber"
              value={morningTrainNumber}
              onChange={(e) => setMorningTrainNumber(e.target.value.toUpperCase())}
              placeholder="请输入早班车次号，例如：G1234"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eveningTrainNumber">晚班车次</Label>
            <Input
              id="eveningTrainNumber"
              value={eveningTrainNumber}
              onChange={(e) => setEveningTrainNumber(e.target.value.toUpperCase())}
              placeholder="请输入晚班车次号，例如：G5678"
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seatType">座位类型</Label>
          <Select value={seatType} onValueChange={setSeatType}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="二等座">二等座</SelectItem>
              <SelectItem value="一等座">一等座</SelectItem>
              <SelectItem value="商务座">商务座</SelectItem>
            </SelectContent>
          </Select>
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