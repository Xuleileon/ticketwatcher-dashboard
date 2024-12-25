export interface TicketInfo {
  trainNo: string;
  fromStation: string;
  toStation: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  seats: {
    secondClass: string;
    firstClass: string;
    business: string;
    noSeat: string;
    hardSeat: string;
    hardSleeper: string;
    softSleeper: string;
  };
}

export interface OrderResult {
  success: boolean;
  orderNo?: string;
  error?: string;
}