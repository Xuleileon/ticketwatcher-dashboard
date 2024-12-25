import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TaskProps {
  onStartTask: () => void;
  onStopTask: () => void;
  isRunning: boolean;
}

const TicketingTask: React.FC<TaskProps> = ({
  onStartTask,
  onStopTask,
  isRunning,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>抢票任务</CardTitle>
        <CardDescription>管理自动抢票任务</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Badge variant={isRunning ? "default" : "secondary"}>
              {isRunning ? "运行中" : "已停止"}
            </Badge>
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={onStopTask}
              disabled={!isRunning}
            >
              停止任务
            </Button>
            <Button
              onClick={onStartTask}
              disabled={isRunning}
              className="bg-railway-500 hover:bg-railway-600"
            >
              开始抢票
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketingTask;