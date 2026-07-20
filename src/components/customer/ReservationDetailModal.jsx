import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getReservationById, cancelReservation } from '../../apis/customer/reservations';
import ReservationDetailContent from './ReservationDetailContent';

export default function ReservationDetailModal({ isOpen, onClose, reservationId }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (isOpen && reservationId) {
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
    }
  }, [isOpen, reservationId, queryClient]);

  // Always run hooks, but they fetch only if reservationId exists
  const { data: reservation, isLoading, error } = useQuery({
    queryKey: ['reservation', reservationId],
    queryFn: async () => {
      const res = await getReservationById(reservationId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load reservation');
      return data;
    },
    enabled: !!reservationId && isOpen,
    refetchInterval: (query) => {
      const status = query.state?.data?.status;
      if (status === 'REQUESTED' || status === 'CONFIRMED') return 5000;
      return false;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (reason) => {
      const res = await cancelReservation(reservationId, reason);
      if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        throw new Error(data.message || 'Failed to cancel reservation');
      }
    },
    onSuccess: () => {
      // toast.success('Reservation cancelled successfully'); // Removed to avoid duplicate toast with global websocket Notification
      setShowCancelModal(false);
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  // Countdown timer for CONFIRMED state
  useEffect(() => {
    if (!reservation?.paymentDeadline || reservation.status !== 'CONFIRMED') {
      setTimeRemaining('');
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const deadline = new Date(reservation.paymentDeadline).getTime();
      const distance = deadline - now;

      if (distance < 0) {
        setTimeRemaining('Expired');
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes}m ${seconds}s`);
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [reservation]);

  const handlePayNow = () => {
    navigate('/payment', { 
      state: { 
        reservationId: reservation.id, 
        finalAmount: reservation.totalCharge,
        returnUrl: `/reservations?open=${reservation.id}`
      } 
    });
  };

  const isCancellable = reservation && ['REQUESTED', 'CONFIRMED', 'PAID'].includes(reservation.status);

  // Stop body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset state on open
      setShowCancelModal(false);
      setCancelReason('');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-[900px] max-h-[95vh] flex flex-col pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                <h2 className="text-xl font-bold text-slate-800">Reservation Details</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 p-6 custom-scrollbar relative">
                {isLoading && (
                  <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
                  </div>
                )}
                
                {(error || (!isLoading && !reservation)) && (
                  <div className="text-center p-20 text-red-500 font-bold bg-red-50 rounded-3xl">
                    {error?.message || 'Reservation not found'}
                  </div>
                )}

                {reservation && !isLoading && (
                  <ReservationDetailContent 
                    reservation={reservation}
                    timeRemaining={timeRemaining}
                    handlePayNow={handlePayNow}
                    isCancellable={isCancellable}
                    showCancelModal={showCancelModal}
                    setShowCancelModal={setShowCancelModal}
                    cancelReason={cancelReason}
                    setCancelReason={setCancelReason}
                    cancelMutation={cancelMutation}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
