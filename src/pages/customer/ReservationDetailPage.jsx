import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Navbar from '../../components/customer/Navbar';
import Footer from '../../components/customer/Footer';
import { getReservationById, cancelReservation } from '../../apis/customer/reservations';
import { 
  CheckCircle, Clock, XCircle, CreditCard, User, Calendar, MapPin, AlertCircle, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import ReservationDetailContent from '../../components/customer/ReservationDetailContent';

export default function ReservationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  const { data: reservation, isLoading, error } = useQuery({
    queryKey: ['reservation', id],
    queryFn: async () => {
      const res = await getReservationById(id);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load reservation');
      return data;
    },
    refetchInterval: (data) => {
      if (data?.status === 'REQUESTED' || data?.status === 'CONFIRMED') return 5000;
      return false;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (reason) => {
      const res = await cancelReservation(id, reason);
      if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        throw new Error(data.message || 'Failed to cancel reservation');
      }
    },
    onSuccess: () => {
      // toast.success('Reservation cancelled successfully'); // Removed to avoid duplicate toast with global websocket Notification
      setShowCancelModal(false);
      queryClient.invalidateQueries({ queryKey: ['reservation', id] });
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

  if (isLoading) {
    return (
      <CustomerPageShell maxWidth="max-w-[800px]" contentClassName="px-4 py-8">
        <Navbar />
        <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" /></div>
      </CustomerPageShell>
    );
  }

  if (error || !reservation) {
    return (
      <CustomerPageShell maxWidth="max-w-[800px]" contentClassName="px-4 py-8">
        <Navbar />
        <div className="text-center p-20 text-red-500 font-bold bg-red-50 rounded-3xl mt-8">
          {error?.message || 'Reservation not found'}
        </div>
      </CustomerPageShell>
    );
  }

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
      case 'REQUESTED': return <Clock size={24} />;
      case 'CONFIRMED': return <AlertCircle size={24} />;
      case 'PAID': return <CheckCircle size={24} />;
      case 'REJECTED': return <XCircle size={24} />;
      case 'EXPIRED': return <XCircle size={24} />;
      case 'CANCELLED': return <XCircle size={24} />;
      case 'COMPLETED': return <CheckCircle size={24} />;
      default: return <Clock size={24} />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'REQUESTED': return "Your request has been received and is waiting for restaurant confirmation.";
      case 'CONFIRMED': return "The restaurant has confirmed your request! Please complete payment to secure your table.";
      case 'PAID': return "Your reservation is fully secured. See you soon!";
      case 'REJECTED': return "Unfortunately, the restaurant could not accommodate your request.";
      case 'EXPIRED': return "The payment window has expired. The reservation is cancelled.";
      case 'CANCELLED': return "This reservation has been cancelled.";
      case 'COMPLETED': return "You have been seated. Enjoy your meal!";
      default: return "Status unknown.";
    }
  };

  const handlePayNow = () => {
    navigate('/checkout/payment', { 
      state: { 
        reservationId: reservation.id, 
        finalAmount: reservation.totalCharge,
        returnUrl: `/reservations/${reservation.id}`
      } 
    });
  };

  const isCancellable = ['REQUESTED', 'CONFIRMED', 'PAID'].includes(reservation.status);

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-8">
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
      </main>

      <Footer />
    </div>
  );
}
