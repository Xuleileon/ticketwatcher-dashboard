import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import type { RPATask } from '@/types/database';

interface TicketMonitorProps {
  taskId?: string;
}

export const TicketMonitor: React.FC<TicketMonitorProps> = ({ taskId }) => {
  const [taskStatus, setTaskStatus] = useState<RPATask | null>(null);

  useEffect(() => {
    if (taskId) {
      // 初始加载
      fetchTaskStatus();
      // 订阅状态更新
      const subscription = supabase
        .channel('rpa_tasks_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rpa_tasks',
            filter: `watch_task_id=eq.${taskId}`
          },
          (payload) => {
            setTaskStatus(payload.new as RPATask);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [taskId]);

  const fetchTaskStatus = async () => {
    if (!taskId) return;

    const { data, error } = await supabase
      .from('rpa_tasks')
      .select('*')
      .eq('watch_task_id', taskId)
      .single();

    if (!error && data) {
      setTaskStatus(data);
    }
  };

  const getStatusDisplay = () => {
    if (!taskStatus) return '等待中';
    switch (taskStatus.status) {
      case 'pending':
        return '准备中';
      case 'running':
        return '执行中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      default:
        return '未知状态';
    }
  };

  const getStatusVariant = () => {
    if (!taskStatus) return 'secondary';
    switch (taskStatus.status) {
      case 'pending':
        return 'secondary';
      case 'running':
        return 'default';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>任务状态</CardTitle>
        <CardDescription>实时监控抢票任务状态</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Badge variant={getStatusVariant()}>
                {getStatusDisplay()}
              </Badge>
            </div>
            {taskStatus?.start_time && (
              <div className="text-sm text-gray-500">
                开始时间: {new Date(taskStatus.start_time).toLocaleString()}
              </div>
            )}
          </div>
          {taskStatus?.error_message && (
            <div className="text-sm text-red-500">
              错误信息: {taskStatus.error_message}
            </div>
          )}
          {taskStatus?.end_time && (
            <div className="text-sm text-gray-500">
              结束时间: {new Date(taskStatus.end_time).toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};