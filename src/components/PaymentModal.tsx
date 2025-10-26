import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { IndianRupee } from "lucide-react";
import { cn } from "../lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: number;
  purpose: string;
}

// Razorpay configuration
const RAZORPAY_KEY_ID = 'rzp_test_RY3WvDTVIw8cad';

// Type definition for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentModal({ isOpen, onClose, amount = 0, purpose }: PaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState(amount || 100);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  
  // Reset amount when modal opens with new props
  useEffect(() => {
    if (isOpen && amount) {
      setPaymentAmount(amount);
    }
  }, [isOpen, amount]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay SDK loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      toast.error('Failed to load payment gateway');
    };
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please sign in to make a payment");
      return;
    }

    if (paymentAmount < 1) {
      toast.error("Please enter a valid amount (minimum ₹1)");
      return;
    }

    try {
      setIsProcessing(true);
      
      // Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Razorpay SDK not loaded. Please refresh and try again.');
      }
      
      // Amount in paise (₹1 = 100 paise)
      const amountInPaise = Math.round(paymentAmount * 100);
      
      // Razorpay options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: 'INR',
        name: 'Gleamverse',
        description: purpose || 'Payment',
        image: '/logo.png', // Optional: Add your logo
        handler: function (response: {
          razorpay_payment_id: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }) {
          // Payment successful
          console.log('Payment successful:', response);
          
          toast.success(`Payment of ₹${paymentAmount} successful!`);
          
          // Log payment details for verification
          console.log('Payment ID:', response.razorpay_payment_id);
          
          // In production, send these details to your backend for verification
          // verifyPayment({
          //   payment_id: response.razorpay_payment_id,
          //   order_id: response.razorpay_order_id,
          //   signature: response.razorpay_signature
          // });
          
          setIsProcessing(false);
          onClose();
        },
        prefill: {
          name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          email: user?.email || 'user@example.com',
          contact: user?.user_metadata?.phone || ''
        },
        notes: {
          purpose: purpose,
          userId: user?.id || 'unknown',
          timestamp: new Date().toISOString()
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled by user');
            toast.info("Payment cancelled");
            setIsProcessing(false);
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setIsProcessing(false);
      });
      
      razorpay.open();
      
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'An error occurred during payment');
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isProcessing && !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Make a Payment</DialogTitle>
          <DialogDescription>
            {purpose || "Complete your payment securely using Razorpay"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="col-span-3 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <IndianRupee className="h-4 w-4 text-gray-500" />
              </div>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Math.max(1, Number(e.target.value)))}
                className="pl-9"
                min="1"
                placeholder="Enter amount"
                disabled={isProcessing}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[100, 500, 1000].map((amt) => (
              <Button
                key={amt}
                variant={paymentAmount === amt ? "default" : "outline"}
                onClick={() => setPaymentAmount(amt)}
                className="text-center"
                disabled={isProcessing}
              >
                ₹{amt}
              </Button>
            ))}
          </div>
          
          {/* Test Mode Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-2">
            <p className="text-xs text-amber-800">
              <strong>Test Mode:</strong> Use test cards for payment. No real money will be charged.
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Test Card: 4111 1111 1111 1111 | CVV: Any 3 digits | Expiry: Any future date
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={isProcessing || paymentAmount < 1}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              `Pay ₹${paymentAmount}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}