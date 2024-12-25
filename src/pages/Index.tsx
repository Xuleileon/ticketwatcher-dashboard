import React, { useState } from 'react';
import { useSession } from '../App';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/UserProfile';
import { CommutePreferences } from '@/components/CommutePreferences';
import { TicketMonitor } from '@/components/TicketMonitor';
import { toast } from "@/hooks/use-toast";
import type { TaskData } from '@/types/components';

const Index = () => {
  const session = useSession();
  const [isTaskRunning, setIsTaskRunning] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | undefined>();

  const handleStartTask = async (data: TaskData) => {
    try {
      // 创建watch_task
      const { data: task, error: taskError } = await supabase
        .from('watch_tasks')
        .insert({
          user_id: session?.user?.id,
          from_station: data.fromStation,
          to_station: data.toStation,
          travel_date: new Date().toISOString().split('T')[0],
          preferred_trains: data.trainNumber ? [data.trainNumber] : [],
          seat_types: data.seatTypes,
          status: 'active',
          rpa_webhook_url: import.meta.env.VITE_RPA_WEBHOOK_URL,
          rpa_callback_url: `${import.meta.env.VITE_API_URL}/functions/v1/rpa-callback`
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // 触发RPA
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/functions/v1/trigger-rpa`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            taskId: task.id
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to trigger RPA task');
      }

      setIsTaskRunning(true);
      setCurrentTaskId(task.id);
      toast({
        title: "抢票任务已启动",
        description: "RPA机器人将自动为您抢票",
      });
    } catch (error) {
      console.error('Error starting task:', error);
      toast({
        title: "启动任务失败",
        description: error instanceof Error ? error.message : '未知错误',
        variant: "destructive",
      });
    }
  };

  const handleStopTask = async () => {
    if (currentTaskId) {
      try {
        const { error } = await supabase
          .from('watch_tasks')
          .update({ status: 'stopped' })
          .eq('id', currentTaskId);

        if (error) throw error;

        setIsTaskRunning(false);
        setCurrentTaskId(undefined);
        toast({
          title: "抢票任务已停止",
          description: "您可以随时重新启动任务",
        });
      } catch (error) {
        console.error('Error stopping task:', error);
        toast({
          title: "停止任务失败",
          description: error instanceof Error ? error.message : '未知错误',
          variant: "destructive",
        });
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-railway-900">通勤购票助手</h1>
          <Button variant="outline" onClick={handleLogout}>
            退出登录
          </Button>
        </div>

        <UserProfile userId={session?.user?.id} />
        <CommutePreferences 
          onStartTask={handleStartTask}
          onStopTask={handleStopTask}
          isTaskRunning={isTaskRunning}
        />
        <TicketMonitor taskId={currentTaskId} />
      </div>
    </div>
  );
};

export default Index;