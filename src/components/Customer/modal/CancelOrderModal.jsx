import { Loader2 } from 'lucide-react';

export default function CancelOrderModal({
  order,
  cancelReason,
  onCancelReasonChange,
  onClose,
  onConfirm,
  isSubmitting,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[24px] bg-white p-7 shadow-2xl">
        <h3 className="mb-2 text-xl font-bold text-slate-900">Cancel Order</h3>
        <p className="mb-5 text-sm text-slate-500">
          Please let us know why you are cancelling order #{order?.orderNumber || order?.orderId}.
        </p>

        <textarea
          className="mb-5 h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition-colors focus:border-orange-500"
          placeholder="Cancellation reason (required)"
          value={cancelReason}
          onChange={(e) => onCancelReasonChange(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
          >
            Keep Order
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting || !cancelReason.trim()}
            className="flex flex-1 items-center justify-center rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-md shadow-red-600/20 transition-all hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}