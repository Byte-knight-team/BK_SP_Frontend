import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';

export default function CardPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;
  const receipt = location.state?.receipt;

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-[520px] rounded-[22px] border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h1 className="font-heading text-[1.2rem] font-bold text-navy">No payment session found</h1>
          <p className="mt-2 text-sm text-gray-600">Start from checkout again to create a card payment session.</p>
          <button
            type="button"
            onClick={() => navigate('/checkout', { replace: true })}
            className="mt-5 inline-flex items-center gap-2 rounded-[12px] bg-orange-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            <ArrowLeft size={16} /> Back to Checkout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f7f4] to-[#f2efe9] px-4 py-8">
      <div className="mx-auto max-w-[760px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm text-slate-700 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_16px_30px_rgba(15,23,42,0.08)]">
          <div className="mb-6 flex items-center gap-3 rounded-[18px] bg-slate-900 px-5 py-4 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white">
              <CreditCard size={22} />
            </div>
            <div>
              <h1 className="font-heading text-[1.35rem] font-bold">Card Payment</h1>
              <p className="text-sm text-slate-300">This page is ready for your card form integration.</p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[18px] border border-gray-200 bg-gray-50 p-5">
              <div className="mb-4 flex items-center gap-2 text-navy">
                <ShieldCheck size={16} className="text-green-600" />
                <span className="font-semibold">Secure payment stub</span>
              </div>
              <p className="text-sm leading-6 text-gray-600">
                The order has already been created. Use this page later to collect card details and finalize the payment gateway flow.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[14px] bg-white p-4">
                  <div className="text-[0.75rem] uppercase tracking-wide text-gray-500">Order Number</div>
                  <div className="mt-1 font-semibold text-navy">{order.orderNumber || order.orderId || 'Pending'}</div>
                </div>
                <div className="rounded-[14px] bg-white p-4">
                  <div className="text-[0.75rem] uppercase tracking-wide text-gray-500">Amount</div>
                  <div className="mt-1 font-semibold text-navy">LKR {Number(receipt?.finalTotal || order.finalTotal || 0).toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-5 rounded-[14px] border border-dashed border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
                <Sparkles size={16} className="mb-2" />
                Card fields are intentionally not wired yet. When you add them, submit the gateway response here and then redirect to confirmation.
              </div>
            </section>

            <section className="rounded-[18px] border border-gray-200 p-5">
              <h2 className="font-heading text-[1rem] font-bold text-navy">Quick Summary</h2>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Customer</span>
                  <span className="font-semibold text-navy">{location.state?.contact?.username || 'Guest'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment Method</span>
                  <span className="font-semibold text-navy">CARD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <span className="font-semibold text-amber-600">Waiting for card form</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout', { replace: true })}
                className="mt-6 w-full rounded-[12px] border border-gray-200 bg-white py-3 font-semibold text-gray-700 transition-colors hover:border-gray-300"
              >
                Return to Checkout
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}