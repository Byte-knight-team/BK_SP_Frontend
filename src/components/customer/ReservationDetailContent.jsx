import {
  CheckCircle, Clock, XCircle, CreditCard, User, Calendar, MapPin, AlertCircle, FileText
} from 'lucide-react';
import { format } from 'date-fns';

export default function ReservationDetailContent({
  reservation,
  timeRemaining,
  handlePayNow,
  isCancellable,
  showCancelModal,
  setShowCancelModal,
  cancelReason,
  setCancelReason,
  cancelMutation,
}) {

  const getStatusColor = (status) => {
    switch (status) {
      case 'REQUESTED': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'CONFIRMED': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'PAID': return 'text-green-600 bg-green-50 border-green-200';
      case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200';
      case 'EXPIRED': return 'text-slate-600 bg-slate-50 border-slate-200';
      case 'CANCELLED': return 'text-red-600 bg-red-50 border-red-200';
      case 'COMPLETED': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'REQUESTED': return <Clock size={20} />;
      case 'CONFIRMED': return <AlertCircle size={20} />;
      case 'PAID': return <CheckCircle size={20} />;
      case 'REJECTED': return <XCircle size={20} />;
      case 'EXPIRED': return <XCircle size={20} />;
      case 'CANCELLED': return <XCircle size={20} />;
      case 'COMPLETED': return <CheckCircle size={20} />;
      default: return <Clock size={20} />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'REQUESTED': return "Your request has been received and is waiting for restaurant confirmation.";
      case 'CONFIRMED': return "The restaurant confirmed your request! Please pay to secure your table.";
      case 'PAID': return "Your reservation is fully secured. See you soon!";
      case 'REJECTED': return "Unfortunately, the restaurant could not accommodate your request.";
      case 'EXPIRED': return "The payment window has expired. The reservation is cancelled.";
      case 'CANCELLED': return "This reservation has been cancelled.";
      case 'COMPLETED': return "Reservation Completed, Till Next Time";
      default: return "Status unknown.";
    }
  };

  return (
    <div className="w-full">
      {/* Header section (compact) */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-xl font-bold font-heading text-slate-900">Reservation #{reservation.id}</h1>
          <p className="text-slate-500 text-xs mt-0.5">Placed on {format(new Date(reservation.createdAt), 'PPP p')}</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-sm font-bold ${getStatusColor(reservation.status)}`}>
          {getStatusIcon(reservation.status)}
          {reservation.status}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">

        {/* LEFT COLUMN: Details */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex flex-col gap-3 ${getStatusColor(reservation.status)}`}>
            <div>
              <p className="font-semibold text-sm mb-1">{getStatusMessage(reservation.status)}</p>
              {reservation.status === 'CONFIRMED' && timeRemaining !== 'Expired' && (
                <p className="text-orange-700 font-medium text-sm">
                  Time remaining to pay: <span className="font-bold text-base ml-1">{timeRemaining}</span>
                </p>
              )}
            </div>

            {reservation.status === 'CONFIRMED' && timeRemaining !== 'Expired' && (
              <button
                onClick={handlePayNow}
                className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20 transition-all"
              >
                <CreditCard size={18} /> Pay LKR {reservation.totalCharge.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </button>
            )}
          </div>

          {(reservation.receptionistNote) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <h4 className="font-bold text-yellow-800 text-sm mb-1 flex items-center gap-1.5">
                <FileText size={16} /> Note from Restaurant
              </h4>
              <p className="text-yellow-700 italic text-sm">"{reservation.receptionistNote}"</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">Details</h3>

            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1"><User size={14} /> Guests</p>
                <p className="font-bold text-slate-900 text-sm">{reservation.guestCount} People</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1"><Calendar size={14} /> Date</p>
                <p className="font-bold text-slate-900 text-sm">{format(new Date(reservation.startTime), 'MMM d, yyyy')}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1"><Clock size={14} /> Time</p>
                <p className="font-bold text-slate-900 text-sm">
                  {format(new Date(reservation.startTime), 'p')} — {format(new Date(reservation.endTime), 'p')}
                </p>
              </div>

              {reservation.tableNumbers && reservation.tableNumbers.length > 0 && (
                <div className="col-span-2 mt-1">
                  <p className="text-xs font-semibold text-slate-500 mb-1.5">Assigned Tables</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {reservation.tableNumbers.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-xs">T{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Time Charge</span>
                <span className="font-medium">LKR {(reservation.totalCharge - reservation.handlingFee).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Handling Fee (Non-refundable)</span>
                <span className="font-medium">LKR {reservation.handlingFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-lg text-orange-600">LKR {reservation.totalCharge.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              {reservation.status === 'CANCELLED' && reservation.refundAmount != null && (
                <div className="mt-3 bg-green-50 border border-green-200 p-2.5 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-bold text-xs text-green-800">Refunded</span>
                    <p className="text-[10px] text-green-600">Time charge</p>
                  </div>
                  <span className="font-bold text-sm text-green-700">LKR {reservation.refundAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Map */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 h-full flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <MapPin size={16} className="text-orange-500" /> {reservation.branchName}
            </h3>
            <p className="text-xs text-slate-500 mb-3">Location Map</p>

            <div className="flex-1 w-full rounded-xl overflow-hidden bg-slate-100 min-h-[250px] relative border border-slate-200">
              {reservation.latitude && reservation.longitude ? (
                <iframe
                  title="Branch Location"
                  width="100%"
                  height="100%"
                  className="absolute inset-0 border-0"
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${reservation.latitude},${reservation.longitude}&z=15&output=embed`}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <MapPin size={32} className="mb-2 opacity-50" />
                  <span className="text-sm font-medium">Map location unavailable</span>
                </div>
              )}
            </div>

            {reservation.customerNote && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">Your Special Request</p>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                  {reservation.customerNote}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Action */}
      {isCancellable && (
        <div className="mt-6 flex justify-center pb-2">
          <button
            onClick={() => setShowCancelModal(true)}
            className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md shadow-red-500/20 hover:bg-red-600 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
          >
            Cancel Reservation
          </button>
        </div>
      )}

      {/* Cancel Modal (Nested) */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-[400px] w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Cancel Reservation?</h3>
            <p className="text-slate-500 text-sm mb-6">
              {reservation.status === 'PAID'
                ? 'Your handling fee is non-refundable. Only the time charge will be refunded.'
                : 'Are you sure you want to cancel this reservation request?'}
            </p>

            <textarea
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none mb-6 text-sm resize-none"
              placeholder="Reason for cancellation (optional)"
              rows={3}
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                disabled={cancelMutation.isPending}
              >
                Keep It
              </button>
              <button
                onClick={() => cancelMutation.mutate(cancelReason)}
                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-70"
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
