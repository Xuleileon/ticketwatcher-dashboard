import React from 'react';
import { useSession } from '../App';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import cities from '../../autoGrabTicketsScript-master/cities.json';

interface TrainPreference {
  departure_station: string;
  arrival_station: string;
  train_number: string;
  departure_time: string;
  preferred_seat_type: string;
  direction: string;
}

export const CommutePreferences = () => {
  const session = useSession();
  const [morningPreference, setMorningPreference] = React.useState<TrainPreference>({
    departure_station: '',
    arrival_station: '',
    train_number: '',
    departure_time: '',
    preferred_seat_type: 'second_class',
    direction: 'morning'
  });
  const [eveningPreference, setEveningPreference] = React.useState<TrainPreference>({
    departure_station: '',
    arrival_station: '',
    train_number: '',
    departure_time: '',
    preferred_seat_type: 'second_class',
    direction: 'evening'
  });

  React.useEffect(() => {
    if (session?.user?.id) {
      fetchPreferences();
    }
  }, [session?.user?.id]);

  const fetchPreferences = async () => {
    const { data, error } = await supabase
      .from('train_preferences')
      .select('*')
      .eq('user_id', session?.user?.id);

    if (error) {
      toast({
        title: "获取通勤偏好失败",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data) {
      const morning = data.find(p => p.direction === 'morning');
      const evening = data.find(p => p.direction === 'evening');
      if (morning) setMorningPreference(morning);
      if (evening) setEveningPreference(evening);
    }
  };

  const savePreference = async (preference: TrainPreference) => {
    const { error } = await supabase
      .from('train_preferences')
      .upsert({
        user_id: session?.user?.id,
        ...preference
      }, {
        onConflict: 'user_id,direction'
      });

    if (error) {
      toast({
        title: "保存偏好失败",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "保存成功",
      description: "通勤偏好已更新",
    });
  };

  const PreferenceForm = ({ preference, setPreference, title }: {
    preference: TrainPreference;
    setPreference: (p: TrainPreference) => void;
    title: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>设置固定通勤车次信息</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>出发站</Label>
            <Select
              value={preference.departure_station}
              onValueChange={(value) => setPreference({ ...preference, departure_station: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择出发站" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(cities).map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>到达站</Label>
            <Select
              value={preference.arrival_station}
              onValueChange={(value) => setPreference({ ...preference, arrival_station: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择到达站" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(cities).map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>车次</Label>
            <Input
              value={preference.train_number}
              onChange={(e) => setPreference({ ...preference, train_number: e.target.value })}
              placeholder="如 G1377"
            />
          </div>
          <div className="space-y-2">
            <Label>发车时间</Label>
            <Input
              type="time"
              value={preference.departure_time}
              onChange={(e) => setPreference({ ...preference, departure_time: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>优先席别</Label>
            <Select
              value={preference.preferred_seat_type}
              onValueChange={(value) => setPreference({ ...preference, preferred_seat_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="second_class">二等座</SelectItem>
                <SelectItem value="first_class">一等座</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={() => savePreference(preference)}>保存设置</Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PreferenceForm
        preference={morningPreference}
        setPreference={setMorningPreference}
        title="早班车设置"
      />
      <PreferenceForm
        preference={eveningPreference}
        setPreference={setEveningPreference}
        title="晚班车设置"
      />
    </div>
  );
};