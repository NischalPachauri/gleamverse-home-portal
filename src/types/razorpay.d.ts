interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill: {
    email: string;
    contact: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color: string;
  };
}

interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed', callback: (response: {
    error: {
      code: string;
      description: string;
      source: string;
      step: string;
      reason: string;
    };
  }) => void): void;
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}
