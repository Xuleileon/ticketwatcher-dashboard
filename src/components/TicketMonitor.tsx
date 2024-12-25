import React from 'react';
import { useSession } from '../App';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface TicketStatus {
  travel_date: string;
  direction: string;
  train_number: string;
  first_class_available: boolean;
  second_class_available: boolean;
  ticket_purchased: boolean;
}

export const TicketMonitor = () => {
  const session = useSession();
  const [ticketStatus, setTicketStatus] = React.useState<TicketStatus[]>([]);
  const [isMonitoring, setIsMonitoring] = React.useState(false);

  React.useEffect(() => {
    if (session?.user?.id) {
      fetchTicketStatus();
    }
  }, [session?.user?.id]);

  const fetchTicketStatus = async () => {
    const { data, error } = await supabase
      .from('ticket_status')
      .select('*')
      .eq('user_id', session?.user?.id)
      .order('travel_date', { ascending: true });

    if (error) {
      toast({
        title: "获取车票状态失败",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setTicketStatus(data || []);
  };

  const startMonitoring = async () => {
    setIsMonitoring(true);
    // Generate next 15 days of monitoring entries
    const dates = Array.from({ length: 15 }, (_, i) => 
      format(addDays(new Date(), i), 'yyyy-MM-dd')
    );

    // Fetch user preferences
    const { data: preferences } = await supabase
      .from('train_preferences')
      .select('*')
      .eq('user_id', session?.user?.id);

    if (!preferences || preferences.length === 0) {
      toast({
        title: "未找到通勤偏好设置",
        description: "请先设置通勤偏好",
        variant: "destructive",
      });
      setIsMonitoring(false);
      return;
    }

    // Create monitoring entries for each date and direction
    for (const date of dates) {
      for (const pref of preferences) {
        const { error } = await supabase
          .from('ticket_status')
          .upsert({
            user_id: session?.user?.id,
            travel_date: date,
            direction: pref.direction,
            train_number: pref.train_number,
            first_class_available: false,
            second_class_available: false,
            ticket_purchased: false
          }, {
            onConflict: 'user_id,travel_date,direction'
          });

        if (error) {
          console.error('Error creating monitoring entry:', error);
        }
      }
    }

    await fetchTicketStatus();
    toast({
      title: "监控已启动",
      description: "系统将自动检查车票状态",
    });
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    toast({
      title: "监控已停止",
      description: "您可以随时重新启动监控",
    });
  };

  const purchaseTickets = async (selectedDates: string[]) => {
    toast({
      title: "开始购票",
      description: "系统正在为您抢票",
    });
    // 实际购票逻辑将在后续实现
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>车票监控</CardTitle>
            <CardDescription>实时监控未来15天的车票状态</CardDescription>
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={stopMonitoring}
              disabled={!isMonitoring}
            >
              停止监控
            </Button>
            <Button
              onClick={startMonitoring}
              disabled={isMonitoring}
              className="bg-railway-500 hover:bg-railway-600"
            >
              开始监控
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日期</TableHead>
              <TableHead>车次</TableHead>
              <TableHead>方向</TableHead>
              <TableHead>一等座</TableHead>
              <TableHead>二等座</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ticketStatus.map((status) => (
              <TableRow key={`${status.travel_date}-${status.direction}`}>
                <TableCell>
                  {format(new Date(status.travel_date), 'MM月dd日 EEEE', { locale: zhCN })}
                </TableCell>
                <TableCell>{status.train_number}</TableCell>
                <TableCell>
                  {status.direction === 'morning' ? '早班' : '晚班'}
                </TableCell>
                <TableCell>
                  <Badge variant={status.first_class_available ? "default" : "secondary"}>
                    {status.first_class_available ? '有票' : '无票'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={status.second_class_available ? "default" : "secondary"}>
                    {status.second_class_available ? '有票' : '无票'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={status.ticket_purchased ? "default" : "outline"}>
                    {status.ticket_purchased ? '已购' : '未购'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    disabled={!status.first_class_available && !status.second_class_available || status.ticket_purchased}
                    onClick={() => purchaseTickets([status.travel_date])}
                  >
                    购票
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};