export interface OrderRequest {
  verificationCode: string;
  dates: string[];
  trainNo: string;
}

export interface OrderResponse {
  success: boolean;
  message?: string;
  error?: string;
}