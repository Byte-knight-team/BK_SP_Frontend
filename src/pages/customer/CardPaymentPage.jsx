import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { createPaymentIntent } from '../../apis/customer/checkout';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Safe initialization of Stripe
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) {
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY is not defined in the environment.');
}
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// Formatter for currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
  }).format(amount);
};

function CheckoutForm({ orderId, reservationId, finalAmount, returnUrl }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return; // Stripe.js hasn't yet loaded.
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required', // Handle success locally instead of redirecting
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      // 2. Trust the Webhook: Payment succeeded, just redirect!
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        if (orderId) {
          navigate(returnUrl || '/order-confirmation', {
            replace: true,
            state: { orderId },
          });
        } else if (reservationId) {
          navigate(returnUrl || `/reservations/${reservationId}`, {
            replace: true,
          });
        }
      } else {
        setErrorMessage(`Unexpected payment status: ${paymentIntent?.status}`);
      }
    } catch (err) {
      console.error('Payment finalization error:', err);
      setErrorMessage(err.message || 'Payment update failed. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2 text-gray-700">
        <CreditCard size={20} />
        <span className="font-semibold">Enter Card Details</span>
      </div>

      <PaymentElement className="mb-6" />

      <button
        disabled={isProcessing || !stripe || !elements}
        type="submit"
        className="w-full rounded-xl bg-orange-500 py-3.5 text-base font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing…' : `Pay ${formatCurrency(finalAmount)}`}
      </button>

      {errorMessage && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-600 border border-red-100">
          {errorMessage}
        </div>
      )}
    </form>
  );
}

export default function CardPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { orderId, reservationId, finalAmount, returnUrl } = location.state || {};

  const [clientSecret, setClientSecret] = useState('');
  const [initError, setInitError] = useState(null);

  // ---------- No order/reservation session guard ----------
  if ((!orderId && !reservationId) || !finalAmount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <CreditCard size={40} className="mx-auto mb-4 text-gray-400" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">No payment session found</h1>
          <p className="text-sm text-gray-500 mb-6">
            Please return to your cart or reservation to retry the payment.
          </p>
          <button
            type="button"
            onClick={() => navigate(returnUrl || '/', { replace: true })}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = Number(finalAmount || 0);

  // Fetch the PaymentIntent client secret on load
  useEffect(() => {
    let mounted = true;

    const fetchIntent = async () => {
      try {
        const res = await createPaymentIntent(totalAmount, orderId, reservationId);
        const data = await res.json().catch(() => ({}));
        
        if (!res.ok) {
          throw new Error(data.message || 'Failed to securely connect to payment gateway.');
        }

        if (mounted && data.data?.clientSecret) {
          setClientSecret(data.data.clientSecret);
        } else if (mounted) {
          throw new Error('Invalid response from payment gateway.');
        }
      } catch (err) {
        if (mounted) setInitError(err.message);
      }
    };

    fetchIntent();

    return () => {
      mounted = false;
    };
  }, [totalAmount]);

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#f97316', // tailwind orange-500
      colorBackground: '#ffffff',
      colorText: '#1f2937', // tailwind gray-800
      colorDanger: '#ef4444', // tailwind red-500
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '12px',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f7f4] to-[#f2efe9]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-lg items-center px-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="ml-3 text-lg font-bold text-gray-900">Secure Checkout</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-5 py-6">
        {/* Amount banner */}
        <div className="mb-6 rounded-2xl bg-slate-900 p-5 text-center text-white shadow-md">
          <p className="mb-1 text-sm font-medium text-slate-300">Amount to Pay</p>
          <p className="text-3xl font-extrabold tracking-tight">
            {formatCurrency(totalAmount)}
          </p>
        </div>

        {initError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
            <p className="mb-2 font-semibold text-red-600">Payment System Unavailable</p>
            <p className="text-sm text-red-500">{initError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        ) : clientSecret && stripePromise ? (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
            <CheckoutForm 
              orderId={orderId} 
              reservationId={reservationId} 
              finalAmount={totalAmount} 
              returnUrl={returnUrl} 
            />
          </Elements>
        ) : !stripePromise ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
            <p className="font-semibold text-amber-700">Configuration Error</p>
            <p className="mt-1 text-sm text-amber-600">
              Payment gateway keys are missing. Please contact support.
            </p>
          </div>
        ) : (
          <div className="flex justify-center items-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          </div>
        )}
      </main>
    </div>
  );
}