export interface TicketPurchase {
  id: string;
  user_id: string;
  travel_date: string;
  train_number: string;
  purchase_status: string;
  rpa_result: any | null;
  created_at: string;
  updated_at: string;
}