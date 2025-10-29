import Razorpay from 'razorpay';

// Initialize Razorpay with your key_id and key_secret
// In production, these should be environment variables
const razorpay = new Razorpay({
  key_id: 'rzp_test_RY3WvDTVIw8cad', // Updated with the correct test key
  key_secret: 'YOUR_KEY_SECRET', // Replace with your test secret
});

export interface PaymentOptions {
  amount: number; // in paise (100 paise = ₹1)
  currency?: string;
  name: string;
  description: string;
  orderId?: string;
  email: string;
  contact: string;
  notes?: Record<string, string>;
}

// Create an order with Razorpay
export const createOrder = async (options: Omit<PaymentOptions, 'orderId'>) => {
  try {
    // In a real application, this would be a server-side call
    // For demo purposes, we're simulating the API response
    const orderOptions = {
      amount: options.amount,
      currency: options.currency || 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: options.notes || {},
    };
    
    // Simulate order creation (in production, this would be a server API call)
    // const order = await razorpay.orders.create(orderOptions);
    const simulatedOrder = {
      id: `order_${Date.now()}`,
      entity: 'order',
      amount: options.amount,
      amount_paid: 0,
      amount_due: options.amount,
      currency: options.currency || 'INR',
      receipt: orderOptions.receipt,
      status: 'created',
      created_at: Date.now(),
    };
    
    return {
      success: true,
      order: simulatedOrder,
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      success: false,
      error: error.message || 'Failed to create order',
    };
  }
};

// Initialize payment
export const initializePayment = (options: PaymentOptions) => {
  return new Promise((resolve) => {
    const rzp = new (window as any).Razorpay({
      key: 'rzp_test_RY3WvDTVIw8cad', // Updated with the correct test key
      amount: options.amount,
      currency: options.currency || 'INR',
      name: options.name,
      description: options.description,
      order_id: options.orderId,
      handler: function (response: any) {
        // This handler is called when payment is successful
        resolve({
          success: true,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        });
      },
      prefill: {
        email: options.email,
        contact: options.contact,
      },
      notes: options.notes || {},
      theme: {
        color: '#3399cc',
      },
    });
    
    rzp.open();
    
    rzp.on('payment.failed', function (response: any) {
      resolve({
        success: false,
        error: response.error.description,
        errorCode: response.error.code,
        errorSource: response.error.source,
        errorStep: response.error.step,
        errorReason: response.error.reason,
      });
    });
  });
};

// Verify payment signature (this would typically be done on the server)
export const verifyPayment = (paymentId: string, orderId: string, signature: string) => {
  // In a real application, this would be a server-side verification
  // For demo purposes, we're returning success
  return {
    success: true,
    verified: true,
  };
};

export default {
  createOrder,
  initializePayment,
  verifyPayment,
};