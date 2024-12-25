import React from 'react';
import { useSession } from '../App';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/UserProfile';
import { CommutePreferences } from '@/components/CommutePreferences';
import { TicketMonitor } from '@/components/TicketMonitor';

const Index = () => {
  const session = useSession();

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
        <CommutePreferences />
        <TicketMonitor />
      </div>
    </div>
  );
};

export default Index;