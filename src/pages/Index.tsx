import React, { useState, useEffect } from 'react';
import { useSession } from '../App';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/UserProfile';
import { CommutePreferences } from '@/components/CommutePreferences';
import { TicketMonitor } from '@/components/TicketMonitor';
import { toast } from "@/hooks/use-toast";
import type { CommutePreference } from '@/types/components';
import { database } from '@/lib/database';

const Index = () => {
  const session = useSession();
  const [preferences, setPreferences] = useState<CommutePreference | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // 加载保存的偏好设置
  useEffect(() => {
    const loadPreferences = async () => {
      if (!session?.user?.id) return;
      
      try {
        const savedPreferences = await database.getPreferences(session.user.id);
        if (savedPreferences) {
          setPreferences(savedPreferences);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        toast({
          title: "加载失败",
          description: "无法加载乘车偏好设置",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [session?.user?.id]);

  const handlePreferencesChange = async (newPreferences: CommutePreference) => {
    if (!session?.user?.id) {
      toast({
        title: "保存失败",
        description: "请先登录",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await database.savePreferences(session.user.id, newPreferences);
      if (success) {
        setPreferences(newPreferences);
        toast({
          title: "保存成功",
          description: "乘车偏好设置已更新",
        });
      } else {
        throw new Error('保存失败');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "保存失败",
        description: "无法保存乘车偏好设置",
        variant: "destructive",
      });
    }
  };

  const handlePurchase = async (date: string, trainNumber: string) => {
    if (!session?.user?.id) {
      toast({
        title: "购票失败",
        description: "请先登录",
        variant: "destructive",
      });
      return;
    }

    try {
      // 调用RPA webhook进行购票
      const response = await fetch(
        `${import.meta.env.VITE_RPA_WEBHOOK_URL}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            fromStation: preferences?.fromStation,
            toStation: preferences?.toStation,
            trainNumber: trainNumber,
            travelDate: date,
            seatType: preferences?.seatType
          })
        }
      );

      if (!response.ok) {
        throw new Error('购票请求失败');
      }

      toast({
        title: "购票请求已发送",
        description: "RPA机器人将为您执行购票操作",
      });
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      toast({
        title: "购票请求失败",
        description: error instanceof Error ? error.message : '未知错误',
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    if (session?.user?.id) {
      // 清除用户偏好设置
      await database.clearPreferences(session.user.id);
    }
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-railway-900">加载中...</h1>
        </div>
      </div>
    );
  }

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
          onPreferencesChange={handlePreferencesChange}
          initialPreferences={preferences}
        />
        <TicketMonitor 
          preferences={preferences}
          onPurchase={handlePurchase}
        />
      </div>
    </div>
  );
};

export default Index;