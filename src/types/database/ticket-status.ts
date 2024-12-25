export interface TicketStatus {
  id: string;
  user_id: string;
  travel_date: string;
  direction: string;
  train_number: string;
  first_class_available: boolean;
  second_class_available: boolean;
  ticket_purchased: boolean;
  created_at: string;
  updated_at: string;
}