import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, Clock, MapPin, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import BrandLogo from '../../components/customer/BrandLogo';
import Navbar from '../../components/customer/Navbar';
import CustomerPageShell from '../../components/customer/CustomerPageShell';
import CustomerStateCard from '../../components/customer/CustomerStateCard';
import CreateReservationDrawer from '../../components/customer/CreateReservationDrawer';
import ReservationDetailModal from '../../components/customer/ReservationDetailModal';
import { getMyReservations, cancelReservation } from '../../apis/customer/reservations';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useRef } from 'react';

const CountdownTimer = ({ deadline }) => {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!deadline) return;
    const updateTimer = () => {
      const distance = new Date(deadline).getTime() - new Date().getTime();
      if (distance < 0) {
        setTimeRemaining('Expired');
        return;
      }
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeRemaining(`${m}m ${s}s`);
    };
    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [deadline]);

  return <span className="font-mono text-orange-600 font-bold">{timeRemaining}</span>;
};

export default function CustomerReservationsListPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('requests');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(
    location.state?.openReservationId || searchParams.get('open') || null
  );

  // Clear the state so it doesn't reopen on reload
  useEffect(() => {
    if (location.state?.openReservationId) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const observerTargetRef = useRef(null);

  const {
    data,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['myReservations', activeTab],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await getMyReservations(pageParam, 15, activeTab);
      if (!res.ok) throw new Error('Failed to load reservations');
      return await res.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      // Spring Data Page object returns `last: boolean`
      // Check if it's wrapped in `data` or direct
      const isLast = lastPage?.data?.last ?? lastPage?.last;
      if (isLast) return undefined;
      return allPages.length;
    }
  });

  const reservations = data?.pages.flatMap(page => {
    const content = page?.data?.content || page?.content;
    return Array.isArray(content) ? content : (Array.isArray(page) ? page : []);
  }) || [];

  // Infinite scroll intersection observer
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: '200px', threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const cancelMutation = useMutation({
    mutationFn: async (reservationId) => {
      const res = await cancelReservation(reservationId, "Cancelled from quick actions");
      if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        throw new Error(data.message || 'Failed to cancel reservation');
      }
    },
    onSuccess: () => {
      // toast.success('Reservation cancelled successfully'); // Removed to avoid duplicate toast with global websocket Notification
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const getStatusConfig = (status) => {
    if (status === 'CANCELLED' || status === 'REJECTED' || status === 'EXPIRED') 
      return { label: status, color: 'text-red-600 bg-red-50 border-red-100', icon: XCircle };
    if (status === 'COMPLETED') 
      return { label: 'Completed', color: 'text-green-600 bg-green-50 border-green-100', icon: CheckCircle };
    if (status === 'CONFIRMED' || status === 'PAID') 
      return { label: status, color: 'text-orange-600 bg-orange-50 border-orange-100', icon: CheckCircle };
    return { label: status, color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Clock };
  };

  return (
    <CustomerPageShell maxWidth="max-w-7xl">
      <Navbar />
      <div className="mx-auto w-full px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-700 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} /> Back Home
        </button>
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] mb-6">
          <div className="bg-orange-500 px-6 py-8 text-center text-white flex flex-col items-center">
            <BrandLogo />
            <h1 className="mt-3 text-3xl font-bold">My Reservations</h1>
          </div>

          <div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-white border-b border-slate-100">
            <div className="flex w-full md:w-auto bg-slate-50 rounded-xl p-1 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'requests' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Requests / Payment
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'upcoming' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'history' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                History
              </button>
            </div>
            
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 bg-orange-50 text-orange-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-100 transition-colors shrink-0"
            >
              <Plus size={18} /> Book Table
            </button>
          </div>
        </div>

        {loading ? (
          <CustomerStateCard
            variant="loading"
            title="Loading reservations"
            description="We're checking your bookings..."
            className="mx-auto max-w-2xl"
          />
        ) : reservations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {reservations.map((res, idx) => {
                const config = getStatusConfig(res.status);
                const StatusIcon = config.icon;
                
                return (
                  <motion.div
                    key={res.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, delay: Math.min(0.25, idx * 0.10) }}
                    className="bg-white rounded-3xl p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)] transition-all cursor-pointer border border-slate-50 flex flex-col h-full"
                    onClick={() => setSelectedReservationId(res.id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                          RES-{res.id.toString().padStart(4, '0')}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{res.branchName}</h3>
                      </div>
                      
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border w-fit ${config.color}`}>
                        <StatusIcon size={14} />
                        {config.label}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100 mt-auto">
                        <div>
                          <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                            <Calendar size={14} /> Date
                          </div>
                          <div className="text-sm font-medium text-slate-800">
                            {new Date(res.startTime).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                            <Clock size={14} /> Time
                          </div>
                          <div className="text-sm font-medium text-slate-800">
                            {new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                            <Users size={14} /> Guests
                          </div>
                          <div className="text-sm font-medium text-slate-800">
                            {res.guestCount} People
                          </div>
                        </div>
                      </div>

                      {/* QUICK ACTIONS */}
                      <div className="flex items-center gap-2 mt-2 pt-4 border-t border-slate-100" onClick={e => e.stopPropagation()}>
                        {res.status === 'CONFIRMED' && (
                          <div className="flex-1 flex items-center gap-3">
                            <button 
                              onClick={() => navigate('/payment', { state: { reservationId: res.id, finalAmount: res.totalCharge, returnUrl: `/reservations?open=${res.id}` } })}
                              className="flex-1 bg-orange-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20"
                            >
                              Pay Now
                            </button>
                            <div className="text-[11px] text-slate-500 flex flex-col items-end shrink-0">
                              <span>Time left</span>
                              <CountdownTimer deadline={res.paymentDeadline} />
                            </div>
                          </div>
                        )}
                        
                        {['REQUESTED', 'CONFIRMED', 'PAID'].includes(res.status) && (
                          <button 
                            onClick={() => {
                              if(window.confirm('Are you sure you want to quickly cancel this reservation?')) {
                                cancelMutation.mutate(res.id);
                              }
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors ${res.status !== 'CONFIRMED' ? 'w-full' : ''}`}
                            disabled={cancelMutation.isPending}
                          >
                            {cancelMutation.isPending ? '...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center shadow-[0_14px_30px_rgba(15,23,42,0.06)] flex flex-col items-center max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <Calendar size={32} className="text-orange-500" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Reservations Found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              {activeTab === 'requests'
                ? "You don't have any pending requests or reservations waiting for payment."
                : activeTab === 'upcoming' 
                ? "You don't have any upcoming table bookings."
                : "You don't have any past reservations."}
            </p>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-orange-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-colors"
            >
              Book a Table Now
            </button>
          </div>
        )}

        {/* Infinite Scroll Sentinel - Always render if there are more pages */}
        <div ref={observerTargetRef} className="h-10 w-full mt-4 flex items-center justify-center">
          {isFetchingNextPage && reservations.length > 0 && <Loader2 className="animate-spin text-orange-500" size={24} />}
        </div>
      </div>

      <CreateReservationDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

      <ReservationDetailModal
        isOpen={!!selectedReservationId}
        reservationId={selectedReservationId}
        onClose={() => {
          setSelectedReservationId(null);
          if (searchParams.has('open')) {
            setSearchParams({});
          }
        }}
      />
    </CustomerPageShell>
  );
}
