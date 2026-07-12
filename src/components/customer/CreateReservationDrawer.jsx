import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapPin, Phone, Mail, Calendar, Clock, Users, ArrowRight, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getActiveReservationBranches, 
  previewReservationCharge, 
  createReservationRequest 
} from '../../apis/customer/reservations';

export default function CreateReservationDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState(1); // 1: Branch, 2: Details, 3: Review
  const [selectedBranch, setSelectedBranch] = useState(null);
  
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [customerNote, setCustomerNote] = useState('');
  
  const [chargePreview, setChargePreview] = useState(null);

  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: ['activeReservationBranches'],
    queryFn: async () => {
      const res = await getActiveReservationBranches();
      if (!res.ok) throw new Error('Failed to load branches');
      const data = await res.json();
      return Array.isArray(data) ? data : (data?.data || []);
    },
    enabled: isOpen
  });

  // Calculate localdatetime strings
  const getStartDateTime = () => {
    if (!date || !startTime) return null;
    return new Date(`${date}T${startTime}:00`);
  };

  const getEndDateTime = () => {
    if (!date || !endTime) return null;
    return new Date(`${date}T${endTime}:00`);
  };

  useEffect(() => {
    const fetchPreview = async () => {
      const start = getStartDateTime();
      const end = getEndDateTime();
      if (selectedBranch && start && end && start < end && guestCount > 0) {
        try {
          const res = await previewReservationCharge(selectedBranch.id, guestCount, start, end);
          if (res.ok) {
            const data = await res.json();
            setChargePreview(data?.data || data);
          }
        } catch (e) {
          // ignore error for preview
        }
      } else {
        setChargePreview(null);
      }
    };
    
    const timer = setTimeout(fetchPreview, 300);
    return () => clearTimeout(timer);
  }, [selectedBranch, date, startTime, endTime, guestCount]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const start = getStartDateTime();
      const end = getEndDateTime();
      const res = await createReservationRequest({
        branchId: selectedBranch.id,
        startTime: start,
        endTime: end,
        guestCount,
        customerNote
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit request');
      return data;
    },
    onSuccess: (data) => {
      toast.success('Reservation request submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
      onClose(); // close drawer
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const handleNext = () => {
    if (step === 1 && !selectedBranch) {
      toast.warn('Please select a branch');
      return;
    }
    if (step === 2) {
      const start = getStartDateTime();
      const end = getEndDateTime();
      if (!start || !end) {
        toast.warn('Please select a valid date and time');
        return;
      }
      if (start <= new Date()) {
        toast.warn('Reservation time must be in the future');
        return;
      }
      if (end <= start) {
        toast.warn('End time must be after start time');
        return;
      }
    }
    setStep(s => s + 1);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset state on open
      setStep(1);
      setSelectedBranch(null);
      setDate('');
      setStartTime('');
      setEndTime('');
      setGuestCount(2);
      setCustomerNote('');
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
          />

          <AnimatePresence>
            {step === 1 && selectedBranch && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-6 top-6 bottom-6 right-[526px] z-[65] hidden lg:flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
              >
                <div className="flex-1 relative bg-slate-100">
                  {selectedBranch.latitude && selectedBranch.longitude ? (
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=${selectedBranch.latitude},${selectedBranch.longitude}&z=15&output=embed`}
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                      <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-3">
                        <MapPin size={24} className="text-slate-400" />
                      </div>
                      <p className="font-medium text-slate-500">Map location not available for this branch</p>
                    </div>
                  )}
                </div>
                
                <div className="p-8 bg-white">
                  <h2 className="text-3xl font-bold text-slate-900 mb-6">{selectedBranch.name}</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-orange-50 text-orange-500 rounded-xl shrink-0">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-1">Address</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{selectedBranch.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-orange-50 text-orange-500 rounded-xl shrink-0">
                        <Phone size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-1">Contact Number</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{selectedBranch.contactNumber}</p>
                      </div>
                    </div>

                    {selectedBranch.email && (
                      <div className="flex items-start gap-4 col-span-2">
                        <div className="p-3 bg-orange-50 text-orange-500 rounded-xl shrink-0">
                          <Mail size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 mb-1">Email Address</p>
                          <p className="text-sm text-slate-600 leading-relaxed">{selectedBranch.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-[500px] bg-white shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-orange-500 text-white">
              <h2 className="text-xl font-bold">Book a Table</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Stepper */}
              <div className="flex items-center justify-between mb-8 px-2 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full" />
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-orange-500 -z-10 rounded-full transition-all duration-300"
                  style={{ width: `${((step - 1) / 2) * 100}%` }}
                />
                
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 ${
                      step >= i ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' : 'bg-white border-2 border-slate-200 text-slate-400'
                    }`}>
                      {step > i ? <CheckCircle size={16} /> : i}
                    </div>
                    <span className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider ${step >= i ? 'text-slate-800' : 'text-slate-400'}`}>
                      {i === 1 ? 'Location' : i === 2 ? 'Details' : 'Review'}
                    </span>
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Select a Location</h3>
                    
                    <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 mb-6">
                      <h4 className="font-semibold text-orange-800 mb-2 text-sm">Reservation Guidelines</h4>
                      <ul className="text-xs text-orange-700 space-y-1 list-disc list-inside">
                        {selectedBranch ? (
                          <>
                            <li>Reservations must be made at least {selectedBranch.reservationMinLeadHours} hours in advance.</li>
                            <li>Requests are reviewed by our staff during working hours.</li>
                            <li>Once confirmed, you will have {selectedBranch.reservationPaymentWindowMinutes} minutes to pay the reservation fee to lock it in.</li>
                            <li>Cancellations after payment will forfeit the handling fee.</li>
                          </>
                        ) : (
                          <>
                            <li>Reservations must be made in advance.</li>
                            <li>Requests are reviewed by our staff during working hours.</li>
                            <li>Once confirmed, you will have a limited time to pay the reservation fee to lock it in.</li>
                            <li>Cancellations after payment will forfeit the handling fee.</li>
                          </>
                        )}
                      </ul>
                    </div>

                    {loadingBranches ? (
                      <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>
                    ) : branches.length === 0 ? (
                      <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-2xl">
                        No branches are currently accepting reservations.
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {branches.map(branch => (
                          <div 
                            key={branch.id}
                            onClick={() => setSelectedBranch(branch)}
                            className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
                              selectedBranch?.id === branch.id 
                                ? 'border-orange-500 bg-orange-50/30 shadow-md shadow-orange-500/10' 
                                : 'border-slate-100 hover:border-orange-200 hover:bg-slate-50'
                            }`}
                          >
                            <h3 className="font-bold text-base text-slate-900 mb-1.5">{branch.name}</h3>
                            <div className="space-y-1 text-xs text-slate-600">
                              <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> {branch.address}</div>
                              <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {branch.contactNumber}</div>
                            </div>
                            
                            {selectedBranch?.id === branch.id && (
                              <div className="mt-4 lg:hidden rounded-xl overflow-hidden h-40 relative">
                                {branch.latitude && branch.longitude ? (
                                  <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    style={{ border: 0 }}
                                    src={`https://maps.google.com/maps?q=${branch.latitude},${branch.longitude}&z=15&output=embed`}
                                    allowFullScreen
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-100/50">
                                    <MapPin size={20} className="mb-2 opacity-50" />
                                    <p className="font-medium text-xs">No map available</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Reservation Details</h3>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="date" 
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none text-sm"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time</label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                              type="time" 
                              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none text-sm"
                              value={startTime}
                              onChange={e => setStartTime(e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Time</label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                              type="time" 
                              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none text-sm"
                              value={endTime}
                              onChange={e => setEndTime(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Number of Guests</label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="number" 
                            min="1"
                            max="50"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none text-sm"
                            value={guestCount}
                            onChange={e => setGuestCount(Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Special Requests (Optional)</label>
                        <textarea 
                          rows={3}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none text-sm resize-none"
                          placeholder="Any dietary requirements or special occasions?"
                          value={customerNote}
                          onChange={e => setCustomerNote(e.target.value)}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Review & Confirm</h3>
                    
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-orange-500" />
                        {selectedBranch?.name}
                      </h4>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                          <span className="text-slate-500 flex items-center gap-2"><Calendar size={16} /> Date</span>
                          <span className="font-semibold text-slate-900">{date}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                          <span className="text-slate-500 flex items-center gap-2"><Clock size={16} /> Time</span>
                          <span className="font-semibold text-slate-900">{startTime} - {endTime}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                          <span className="text-slate-500 flex items-center gap-2"><Users size={16} /> Guests</span>
                          <span className="font-semibold text-slate-900">{guestCount} People</span>
                        </div>
                      </div>

                      {customerNote && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Note</span>
                          <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-100">{customerNote}</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100 mb-6">
                      <h4 className="font-bold text-orange-900 mb-4 text-sm uppercase tracking-wider">Payment Preview</h4>
                      
                      {chargePreview ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-orange-800">
                            <span>Time Charge (Duration × Guests)</span>
                            <span>LKR {chargePreview.timeCharge?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between text-sm text-orange-800 pb-2 border-b border-orange-200/50">
                            <span>Handling Fee</span>
                            <span>LKR {chargePreview.handlingFee?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between text-base font-bold text-orange-900 pt-1">
                            <span>Total Due Upon Approval</span>
                            <span>LKR {chargePreview.totalCharge?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
              {step > 1 ? (
                <button 
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors text-sm"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : <div />}
              
              {step < 3 ? (
                <button 
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 shadow-md shadow-orange-500/20 transition-all text-sm"
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 shadow-md shadow-green-500/20 transition-all disabled:opacity-70 text-sm"
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Request'} <CheckCircle size={16} />
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
