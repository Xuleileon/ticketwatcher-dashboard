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
import { VerificationDialog } from './VerificationDialog';

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
  const [showVerification, setShowVerification] = React.useState(false);
  const [currentPurchase, setCurrentPurchase] = React.useState<{
    dates: string[];
    trainNo: string;
  } | null>(null);

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

  const handleVerification = async (code: string) => {
    if (!currentPurchase) return;

    try {
      const { error } = await supabase.functions.invoke('auto-order', {
        body: {
          verificationCode: code,
          dates: currentPurchase.dates,
          trainNo: currentPurchase.trainNo,
        },
      });

      if (error) throw error;

      toast({
        title: "购票成功",
        description: "订单已提交，请在12306官网查看详情",
      });

      await fetchTicketStatus();
    } catch (error) {
      console.error('Purchase failed:', error);
      toast({
        title: "购票失败",
        description: error instanceof Error ? error.message : "请重试",
        variant: "destructive",
      });
    } finally {
      setCurrentPurchase(null);
    }
  };

  const purchaseTickets = async (dates: string[], trainNo: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('train_account, id_card_number')
        .eq('id', session?.user?.id)
        .single();

      if (!profile?.train_account || !profile?.id_card_number) {
        toast({
          title: "请先完善个人信息",
          description: "需要设置12306账号和身份证号",
          variant: "destructive",
        });
        return;
      }

      setCurrentPurchase({ dates, trainNo });
      setShowVerification(true);
    } catch (error) {
      console.error('Error starting purchase:', error);
      toast({
        title: "启动购票失败",
        description: "请检查网络连接并重试",
        variant: "destructive",
      });
    }
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
                    onClick={() => purchaseTickets([status.travel_date], status.train_number)}
                  >
                    购票
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <VerificationDialog
        open={showVerification}
        onClose={() => {
          setShowVerification(false);
          setCurrentPurchase(null);
        }}
        onVerify={handleVerification}
      />
    </Card>
  );
};
