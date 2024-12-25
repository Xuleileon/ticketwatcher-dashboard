import React, { useState } from 'react';
import StationSelect from '@/components/StationSelect';
import TrainFilter from '@/components/TrainFilter';
import MonitoringBoard from '@/components/MonitoringBoard';
import TicketingTask from '@/components/TicketingTask';
import { toast } from "@/components/ui/use-toast";

// 模拟车票数据
const mockTickets = [
  {
    date: "2024-04-22",
    trainNumber: "G1234",
    available: true,
    price: "¥553.5",
    remainingSeats: 12,
  },
  {
    date: "2024-04-23",
    trainNumber: "G1234",
    available: false,
    price: "¥553.5",
    remainingSeats: 0,
  },
  // 添加更多模拟数据...
];

const Index = () => {
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [trainNumber, setTrainNumber] = useState("");
  const [isTaskRunning, setIsTaskRunning] = useState(false);

  const handleStartTask = () => {
    if (!departure || !arrival) {
      toast({
        title: "请选择站点",
        description: "出发站和到达站都必须选择",
        variant: "destructive",
      });
      return;
    }
    setIsTaskRunning(true);
    toast({
      title: "抢票任务已启动",
      description: "系统将自动监控车票状态",
    });
  };

  const handleStopTask = () => {
    setIsTaskRunning(false);
    toast({
      title: "抢票任务已停止",
      description: "您可以随时重新启动任务",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-railway-900">自动抢票系统</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <StationSelect
              label="出发站"
              value={departure}
              onChange={setDeparture}
            />
            <StationSelect
              label="到达站"
              value={arrival}
              onChange={setArrival}
            />
          </div>
          
          <div>
            <TrainFilter
              trainNumber={trainNumber}
              onTrainNumberChange={setTrainNumber}
            />
          </div>
        </div>

        <TicketingTask
          onStartTask={handleStartTask}
          onStopTask={handleStopTask}
          isRunning={isTaskRunning}
        />

        <MonitoringBoard tickets={mockTickets} />
      </div>
    </div>
  );
};

export default Index;