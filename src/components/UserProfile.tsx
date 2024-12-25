import React from 'react';
import { useSession } from '../App';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Profile {
  id_card_number: string | null;
  train_account: string | null;
}

export const UserProfile = () => {
  const session = useSession();
  const [profile, setProfile] = React.useState<Profile | null>(null);

  React.useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
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

  const updateProfile = async () => {
    if (!profile) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        id_card_number: profile.id_card_number,
        train_account: profile.train_account,
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
  };

  return (
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
        <Button onClick={updateProfile}>保存信息</Button>
      </CardContent>
    </Card>
  );
};