export interface RPATask {
  id: string;
  watch_task_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  rpa_machine_id: string | null;
  enterprise_id: string | null;
  flow_id: string | null;
  flow_process_no: string | null;
  start_time: string | null;
  end_time: string | null;
  result: any | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}