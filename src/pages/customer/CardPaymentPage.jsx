import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { updateCustomerPayment } from '../../apis/customer/checkout';
import { payReservation } from '../../apis/customer/reservations';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function CardPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { orderId, reservationId, finalAmount, returnUrl } = location.state || {};

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState({});
  const [isPaying, setIsPaying] = useState(false);

  // ---------- No order/reservation session guard ----------
  if ((!orderId && !reservationId) || !finalAmount) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <CreditCard size={40} className="mx-auto mb-4 text-gray-400" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">No payment session</h1>
          <p className="text-sm text-gray-500 mb-6">
            Please go back to retry payment.
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

 // AUTO-FORMATTING INPUTS on every keystroke
  const formatCardNumber = (value) => {
    //1. Strip all non-numbers (\D), . Keep only first 16.  //2. Add a space after every 4th number.
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    //1. Strip non-numbers., Keep only first 4.  //2. Automatically insert the slash after the month.
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  // ---------- Validation ----------
  const validate = () => {
    const next = {};

    const rawCard = cardNumber.replace(/\s/g, '');
    if (!rawCard) next.cardNumber = 'Card number is required.';
    else if (rawCard.length !== 16 || !/^\d{16}$/.test(rawCard))
      next.cardNumber = 'Enter a valid 16-digit card number.';

    if (!cardName.trim()) next.cardName = 'Cardholder name is required.';

    if (!expiry) next.expiry = 'Expiry date is required.';
    else if (!/^\d{2}\/\d{2}$/.test(expiry)) next.expiry = 'Use MM/YY format.';
    else {
      const [mm, yy] = expiry.split('/').map(Number);
      if (mm < 1 || mm > 12) next.expiry = 'Invalid month.';
      else {
        const now = new Date();
        const expDate = new Date(2000 + yy, mm);
        if (expDate <= now) next.expiry = 'Card has expired.';
      }
    }

    if (!cvv) next.cvv = 'CVV is required.';
    else if (!/^\d{3,4}$/.test(cvv)) next.cvv = 'Enter a valid 3 or 4 digit CVV.';
    // If 'next' has no keys, it means no errors were found. Returns true.
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  //THE API SUBMISSION
  const handlePay = async () => {
    if (!validate()) return;
    setIsPaying(true);

    try {
      // Generate a fake transaction ID for the database
      const fakeTransactionId = `DUMMY_TX_${Math.floor(Math.random() * 100000000)}`;

      if (orderId) {
        // Tell the backend the card went through
        const res = await updateCustomerPayment(orderId, {
          paymentStatus: 'PAID',
          transactionId: fakeTransactionId,
        });

        if (!res.ok) throw new Error('Server failed to update payment status');

        // Success — navigate to confirmation screen
        navigate('/order-confirmation', {
          replace: true,
          state: { orderId },
        });
      } else if (reservationId) {
        const res = await payReservation(reservationId, fakeTransactionId);
        if (!res.ok) {
           const data = await res.json().catch(()=>({}));
           throw new Error(data.message || 'Server failed to update payment status');
        }
        
        navigate(returnUrl || `/reservations/${reservationId}`, {
          replace: true,
        });
      }
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({ ...prev, submit: err.message || 'Payment update failed. Please try again.' }));
    } finally {
      setIsPaying(false);
    }
  };

  // ---------- UI ----------
  const inputCls =
    'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[0.95rem] text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-orange-500 focus:bg-white';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f7f4] to-[#f2efe9]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-lg items-center px-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="ml-3 text-lg font-bold text-gray-900">Card Payment</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-5 py-6">
        {/* Amount banner */}
        <div className="mb-6 rounded-2xl bg-slate-900 p-5 text-center text-white">
          <p className="mb-1 text-sm text-slate-300">Amount to Pay</p>
          <p className="text-3xl font-extrabold tracking-tight">
            LKR {totalAmount.toLocaleString()}
          </p>
        </div>

        {/* Card form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-gray-700">
            <CreditCard size={20} />
            <span className="font-semibold">Enter Card Details</span>
          </div>

          {/* Card Number */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Card Number
            </label>
            <input
              type="text"
              inputMode="numeric"
              className={inputCls}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            />
            {errors.cardNumber && (
              <p className="mt-1 text-xs text-red-500">{errors.cardNumber}</p>
            )}
          </div>

          {/* Cardholder Name */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Cardholder Name
            </label>
            <input
              type="text"
              className={inputCls}
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />
            {errors.cardName && (
              <p className="mt-1 text-xs text-red-500">{errors.cardName}</p>
            )}
          </div>

          {/* Expiry & CVV */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Expiry Date
              </label>
              <input
                type="text"
                inputMode="numeric"
                className={inputCls}
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              />
              {errors.expiry && (
                <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                CVV
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                className={inputCls}
                placeholder="•••"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
              {errors.cvv && (
                <p className="mt-1 text-xs text-red-500">{errors.cvv}</p>
              )}
            </div>
          </div>

          {/* Pay button */}
          <button
            type="button"
            onClick={handlePay}
            disabled={isPaying}
            className="w-full rounded-xl bg-orange-500 py-3.5 text-base font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-70"
          >
            {isPaying ? 'Processing…' : `Pay LKR ${totalAmount.toLocaleString()}`}
          </button>

          {errors.submit && (
            <p className="mt-3 text-center text-sm font-medium text-red-500">
              {errors.submit}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}