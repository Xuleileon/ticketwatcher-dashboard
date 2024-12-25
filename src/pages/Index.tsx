import React, { useState } from 'react';
import { useSession } from '../App';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/UserProfile';
import { CommutePreferences } from '@/components/CommutePreferences';
import { TicketMonitor } from '@/components/TicketMonitor';
import { toast } from "@/hooks/use-toast";
import type { CommutePreference } from '@/types/components';

const Index = () => {
  const session = useSession();
  const [preferences, setPreferences] = useState<CommutePreference | undefined>();

  const handlePreferencesChange = (newPreferences: CommutePreference) => {
    setPreferences(newPreferences);
  };

  const handlePurchase = async (date: string, trainNumber: string) => {
    try {
      // 调用RPA webhook进行购票
      const response = await fetch(
        `${import.meta.env.VITE_RPA_WEBHOOK_URL}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
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
          onPreferencesChange={handlePreferencesChange}
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