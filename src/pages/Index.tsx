import React, { useState, useEffect } from 'react';
import { useSession } from '../App';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/UserProfile';
import { CommutePreferences } from '@/components/CommutePreferences';
import { TicketMonitor } from '@/components/TicketMonitor';
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const session = useSession();
  const [isTaskRunning, setIsTaskRunning] = useState(false);

  const handleStartTask = async (data: {
    fromStation: string;
    toStation: string;
    trainNumber?: string;
    seatTypes: string[];
  }) => {
    try {
      // 创建watch_task
      const { data: task, error: taskError } = await supabase
        .from('watch_tasks')
        .insert({
          from_station: data.fromStation,
          to_station: data.toStation,
          travel_date: new Date().toISOString().split('T')[0],
          preferred_trains: data.trainNumber ? [data.trainNumber] : [],
          seat_types: data.seatTypes,
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
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
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
      toast({
        title: "抢票任务已启动",
        description: "RPA机器人将自动为您抢票",
      });
    } catch (error) {
      console.error('Error starting task:', error);
      toast({
        title: "启动任务失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStopTask = () => {
    setIsTaskRunning(false);
    toast({
      title: "抢票任务已停止",
      description: "您可以随时重新启动任务",
    });
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

        <UserProfile />
        <CommutePreferences 
          onStartTask={handleStartTask}
          onStopTask={handleStopTask}
          isTaskRunning={isTaskRunning}
        />
        <TicketMonitor />
      </div>
    </div>
  );
};

export default Index;