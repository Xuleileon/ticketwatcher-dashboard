import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";
import type { CommutePreferencesProps } from '@/types/components';
import { Combobox } from '@/components/ui/combobox';
import { Railway12306, Station } from '@/lib/railway';

export const CommutePreferences: React.FC<CommutePreferencesProps> = ({
  onPreferencesChange
}) => {
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [morningTrainNumber, setMorningTrainNumber] = useState('');
  const [eveningTrainNumber, setEveningTrainNumber] = useState('');
  const [seatType, setSeatType] = useState('二等座');
  const [isValidating, setIsValidating] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoadingStations, setIsLoadingStations] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const railway = Railway12306.getInstance();
        const stationList = await railway.getStations();
        setStations(stationList);
      } catch (error) {
        console.error('Error fetching stations:', error);
        toast({
          title: "获取站点失败",
          description: "无法加载车站数据，请稍后重试",
          variant: "destructive",
        });
      } finally {
        setIsLoadingStations(false);
      }
    };

    fetchStations();
  }, []);

  const validateStation = (station: string) => {
    return stations.some(s => s.name === station);
  };

  const validateTrainNumber = (trainNumber: string) => {
    return trainNumber.match(/^[GDCZTKYL]\d{1,4}$/);
  };

  const handleSave = async () => {
    setIsValidating(true);
    try {
      // 验证站点
      const isFromStationValid = validateStation(fromStation);
      const isToStationValid = validateStation(toStation);
      if (!isFromStationValid || !isToStationValid) {
        toast({
          title: "站点验证失败",
          description: "请输入有效的车站名称",
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
          description: "请输入有效的车次号",
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
            <Combobox
              items={stations.map(s => ({ 
                label: `${s.name} (${s.pinyin})`, 
                value: s.name,
                description: s.code
              }))}
              value={fromStation}
              onChange={setFromStation}
              placeholder="请输入出发站"
              isLoading={isLoadingStations}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="toStation">到达站</Label>
            <Combobox
              items={stations.map(s => ({ 
                label: `${s.name} (${s.pinyin})`, 
                value: s.name,
                description: s.code
              }))}
              value={toStation}
              onChange={setToStation}
              placeholder="请输入到达站"
              isLoading={isLoadingStations}
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