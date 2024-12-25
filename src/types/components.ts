export interface TaskData {
  fromStation: string;
  toStation: string;
  trainNumber?: string;
  seatTypes: string[];
}

export interface CommutePreferencesProps {
  onStartTask: (data: TaskData) => Promise<void>;
  onStopTask: () => void;
  isTaskRunning: boolean;
}

export interface UserProfileProps {
  userId?: string;
}

export interface TicketMonitorProps {
  taskId?: string;
} 