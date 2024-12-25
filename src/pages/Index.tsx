import React, { useState, useEffect } from 'react';
import { useSession } from '../App';
import { supabase } from '@/integrations/supabase/client';
import StationSelect from '@/components/StationSelect';
import TrainFilter from '@/components/TrainFilter';
import MonitoringBoard from '@/components/MonitoringBoard';
import TicketingTask from '@/components/TicketingTask';
import { toast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const session = useSession();
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [trainNumber, setTrainNumber] = useState("");
  const [isTaskRunning, setIsTaskRunning] = useState(false);
  const [profile, setProfile] = useState<{
    id_card_number: string | null;
    train_account: string | null;
  } | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
      fetchPreferences();
    }
  }, [session?.user?.id]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id_card_number, train_account')
      .eq('id', session?.user?.id)
      .single();

    if (error) {
      toast({
        title: "获取用户信息失败",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setProfile(data);
  };

  const fetchPreferences = async () => {
    const { data, error } = await supabase
      .from('train_preferences')
      .select('*')
      .eq('user_id', session?.user?.id);

    if (error) {
      toast({
        title: "获取乘车偏好失败",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data && data.length > 0) {
      // Set default values from preferences
      setDeparture(data[0].departure_station);
      setArrival(data[0].arrival_station);
      setTrainNumber(data[0].train_number);
    }
  };

  const updateProfile = async (id_card_number: string, train_account: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        id_card_number,
        train_account,
      })
      .eq('id', session?.user?.id);

    if (error) {
      toast({
        title: "更新用户信息失败",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "更新成功",
      description: "用户信息已更新",
    });
    await fetchProfile();
  };

  const handleStartTask = async () => {
    if (!departure || !arrival) {
      toast({
        title: "请选择站点",
        description: "出发站和到达站都必须选择",
        variant: "destructive",
      });
      return;
    }

    try {
      // 创建watch_task
      const { data: task, error: taskError } = await supabase
        .from('watch_tasks')
        .insert({
          from_station: departure,
          to_station: arrival,
          travel_date: new Date().toISOString().split('T')[0],
          preferred_trains: trainNumber ? [trainNumber] : [],
          seat_types: ['二等座', '一等座'],
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
          <h1 className="text-3xl font-bold text-railway-900">自动抢票系统</h1>
          <Button variant="outline" onClick={handleLogout}>
            退出登录
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>用户信息</CardTitle>
            <CardDescription>设置您的12306账号信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_card">身份证号</Label>
                <Input
                  id="id_card"
                  value={profile?.id_card_number || ''}
                  onChange={(e) => setProfile(prev => ({
                    ...prev!,
                    id_card_number: e.target.value
                  }))}
                  placeholder="请输入身份证号"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="train_account">12306账号</Label>
                <Input
                  id="train_account"
                  value={profile?.train_account || ''}
                  onChange={(e) => setProfile(prev => ({
                    ...prev!,
                    train_account: e.target.value
                  }))}
                  placeholder="请输入12306账号"
                />
              </div>
            </div>
            <Button
              onClick={() => profile && updateProfile(
                profile.id_card_number || '',
                profile.train_account || ''
              )}
            >
              保存信息
            </Button>
          </CardContent>
        </Card>
        
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

        <MonitoringBoard tickets={[]} />
      </div>
    </div>
  );
};

export default Index;