import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

  useEffect(() => {
    const fetchTickets = async () => {
      if (!preferences) return;

      setIsLoading(true);
      setError(null);

      try {
        const railway = new Railway12306();
        const { morningTickets, eveningTickets } = await railway.queryTickets(preferences);
        
        setMorningTickets(morningTickets);
        setEveningTickets(eveningTickets);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError(err instanceof Error ? err.message : '获取车票信息失败');
      } finally {
        setIsLoading(false);
      }
    };

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
      <CardHeader>
        <CardTitle>车票监控</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="text-center py-4">加载中...</div>
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