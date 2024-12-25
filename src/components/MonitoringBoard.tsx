import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TicketStatus {
  date: string;
  trainNumber: string;
  available: boolean;
  price: string;
  remainingSeats: number;
}

interface MonitoringBoardProps {
  tickets: TicketStatus[];
}

const MonitoringBoard: React.FC<MonitoringBoardProps> = ({ tickets }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>车票监控面板</CardTitle>
        <CardDescription>显示未来15天工作日的车票状态</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{ticket.date}</h3>
                  <p className="text-sm text-gray-500">{ticket.trainNumber}</p>
                </div>
                <Badge
                  variant={ticket.available ? "default" : "destructive"}
                  className="ml-2"
                >
                  {ticket.available ? "有票" : "无票"}
                </Badge>
              </div>
              <div className="mt-2">
                <p className="text-sm">
                  票价: <span className="font-medium">{ticket.price}</span>
                </p>
                <p className="text-sm">
                  余票: <span className="font-medium">{ticket.remainingSeats}</span>
                </p>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonitoringBoard;