import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Railway12306 } from '@/lib/railway';
import { TicketTable } from './TicketTable';
import type { CommutePreference, TicketInfo } from '@/types/components';

interface TicketMonitorProps {
  preferences?: CommutePreference;
  onPurchase: (date: string, trainNumber: string) => Promise<void>;
}

export const TicketMonitor: React.FC<TicketMonitorProps> = ({
  preferences,
  onPurchase
}) => {
  const [morningTickets, setMorningTickets] = useState<Record<string, TicketInfo>>({});
  const [eveningTickets, setEveningTickets] = useState<Record<string, TicketInfo>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  const fetchTickets = async () => {
    if (!preferences) return;

    setIsLoading(true);
    setError(null);

    try {
      const railway = Railway12306.getInstance();
      const { morningTickets, eveningTickets } = await railway.queryTickets(preferences);
      
      setMorningTickets(morningTickets);
      setEveningTickets(eveningTickets);
      setLastUpdateTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err instanceof Error ? err.message : '获取车票信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 只在组件加载和偏好设置变化时获取一次数据
  useEffect(() => {
    fetchTickets();
  }, [preferences]);

  if (!preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>车票监控</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              请先设置乘车偏好
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>车票监控</CardTitle>
          {lastUpdateTime && (
            <div className="text-sm text-muted-foreground">
              上次更新: {lastUpdateTime}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTickets}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              刷新中
            </>
          ) : (
            <>
              <ReloadIcon className="mr-2 h-4 w-4" />
              刷新
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <TicketTable
            morningTickets={morningTickets}
            eveningTickets={eveningTickets}
            onPurchase={onPurchase}
          />
        )}
      </CardContent>
    </Card>
  );
}; 