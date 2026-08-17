import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapPin, Phone, Mail, Calendar, Clock, Users, ArrowRight, ArrowLeft, CheckCircle, X, Plus, Minus, Info, Store, Check, Sparkles, ShieldCheck, MessageSquare, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerDatePicker from './CustomerDatePicker';
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
      const startStr = `${date}T${startTime}:00`;
      const endStr = `${date}T${endTime}:00`;
      if (selectedBranch && date && startTime && endTime && start < end && guestCount > 0) {
        try {
          const res = await previewReservationCharge(selectedBranch.id, guestCount, startStr, endStr);
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
      const startStr = `${date}T${startTime}:00`;
      const endStr = `${date}T${endTime}:00`;
      const res = await createReservationRequest({
        branchId: selectedBranch.id,
        startTime: startStr,
        endTime: endStr,
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
              <div className="relative flex items-center justify-between mb-7 px-4">
                {/* Track Container spanning Step 1 center to Step 3 center */}
                <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200 -translate-y-1/2 z-0 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: step === 1 ? '0%' : step === 2 ? '50%' : '100%'
                    }}
                  />
                </div>

                {[
                  { id: 1, label: 'Location' },
                  { id: 2, label: 'Details' },
                  { id: 3, label: 'Review' }
                ].map(({ id, label }) => {
                  const isCompleted = step > id;
                  const isCurrent = step === id;

                  return (
                    <div key={id} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${isCompleted
                            ? 'bg-orange-500 text-white shadow-sm ring-4 ring-white'
                            : isCurrent
                              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 ring-4 ring-orange-100 scale-105'
                              : 'bg-white border-2 border-slate-200 text-slate-400 ring-4 ring-white'
                          }`}
                      >
                        {isCompleted ? <CheckCircle size={15} strokeWidth={2.5} /> : id}
                      </div>
                      <span
                        className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider transition-colors ${isCurrent
                            ? 'text-orange-600'
                            : isCompleted
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-slate-900">Select a Location</h3>
                      <span className="text-xs text-slate-500 font-medium">
                        {branches.length} {branches.length === 1 ? 'branch' : 'branches'} available
                      </span>
                    </div>

                    {loadingBranches ? (
                      <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>
                    ) : branches.length === 0 ? (
                      <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
                        No branches are currently accepting reservations.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {branches.map(branch => {
                          const isSelected = selectedBranch?.id === branch.id;
                          return (
                            <div
                              key={branch.id}
                              onClick={() => setSelectedBranch(branch)}
                              className={`group relative cursor-pointer rounded-2xl border-2 p-3.5 transition-all duration-200 ${
                                isSelected
                                  ? 'border-orange-500 bg-orange-50/40 shadow-sm shadow-orange-500/10 ring-1 ring-orange-500/20'
                                  : 'border-slate-100 bg-white hover:border-orange-200 hover:bg-slate-50/60'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Store Icon Badge */}
                                <div className={`p-2.5 rounded-xl transition-colors shrink-0 ${
                                  isSelected
                                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                                    : 'bg-slate-100 text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600'
                                }`}>
                                  <Store size={18} />
                                </div>

                                {/* Branch Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className="font-bold text-sm text-slate-900 truncate">{branch.name}</h4>
                                    {/* Selection Radio Circle */}
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0 ${
                                      isSelected
                                        ? 'bg-orange-500 text-white scale-105'
                                        : 'border-2 border-slate-200 bg-white group-hover:border-slate-300'
                                    }`}>
                                      {isSelected && <Check size={12} strokeWidth={3} />}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 truncate">
                                    <MapPin size={13} className="text-slate-400 shrink-0" />
                                    <span className="truncate">{branch.address}</span>
                                  </div>

                                  <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                                      <Phone size={12} className="text-slate-400" />
                                      <span>{branch.contactNumber}</span>
                                    </div>

                                    {branch.reservationMinLeadHours > 0 && (
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/50">
                                        {branch.reservationMinLeadHours}h advance notice
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Mobile Map Preview */}
                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="mt-3 lg:hidden"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="rounded-xl overflow-hidden h-36 relative border border-orange-200/80 shadow-inner bg-slate-100">
                                    {branch.latitude && branch.longitude ? (
                                      <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        style={{ border: 0 }}
                                        src={`https://maps.google.com/maps?q=${branch.latitude},${branch.longitude}&z=15&output=embed`}
                                        allowFullScreen
                                        title={`${branch.name} location map`}
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                        <MapPin size={20} className="mb-1 opacity-50" />
                                        <p className="font-medium text-xs">Map location not available</p>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
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
                    <h3 className="text-base font-bold text-slate-900 mb-4">Reservation Details</h3>

                    <div className="space-y-4">
                      {/* Date */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                        <CustomerDatePicker
                          value={date}
                          onChange={setDate}
                          minLeadHours={selectedBranch?.reservationMinLeadHours || 0}
                          placeholder="Select date"
                        />
                      </div>

                      {/* Time Slots */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Start Time</label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                            <input
                              type="time"
                              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none text-sm font-medium text-slate-800"
                              value={startTime}
                              onChange={e => setStartTime(e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">End Time</label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                            <input
                              type="time"
                              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none text-sm font-medium text-slate-800"
                              value={endTime}
                              onChange={e => setEndTime(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Guest Count */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Number of Guests</label>
                        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                          <button
                            type="button"
                            onClick={() => setGuestCount(prev => Math.max(1, prev - 1))}
                            disabled={guestCount <= 1}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-slate-700 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-30 transition-all shadow-sm border border-slate-100"
                          >
                            <Minus size={14} />
                          </button>

                          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                            <Users size={16} className="text-orange-500" />
                            <span>{guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setGuestCount(prev => Math.min(50, prev + 1))}
                            disabled={guestCount >= 50}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-slate-700 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-30 transition-all shadow-sm border border-slate-100"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Special Requests */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Special Requests (Optional)</label>
                        <textarea
                          rows={2}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none text-sm resize-none"
                          placeholder="Dietary requirements or special notes..."
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
                    className="space-y-3.5"
                  >
                    <h3 className="text-base font-bold text-slate-900 mb-1">Review & Confirm</h3>

                    {/* Booking Overview Card */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
                      {/* Branch Header */}
                      <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                        <div className="p-2 rounded-xl bg-orange-50 text-orange-600 shrink-0">
                          <Store size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{selectedBranch?.name}</h4>
                          <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            {selectedBranch?.address}
                          </p>
                        </div>
                      </div>

                      {/* Grid Specs */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-medium mb-0.5">
                            <Calendar size={12} className="text-orange-500" /> Date
                          </div>
                          <p className="font-bold text-xs text-slate-800 truncate">{date}</p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-medium mb-0.5">
                            <Clock size={12} className="text-orange-500" /> Time
                          </div>
                          <p className="font-bold text-xs text-slate-800 truncate">{startTime} - {endTime}</p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-medium mb-0.5">
                            <Users size={12} className="text-orange-500" /> Guests
                          </div>
                          <p className="font-bold text-xs text-slate-800 truncate">{guestCount} {guestCount === 1 ? 'Person' : 'People'}</p>
                        </div>
                      </div>

                      {/* Customer Note if present */}
                      {customerNote && (
                        <div className="pt-0.5">
                          <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl text-xs">
                            <MessageSquare size={13} className="text-slate-400 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-slate-600 block text-[10px] uppercase tracking-wider mb-0.5">Special Requests</span>
                              <p className="text-slate-700 italic break-words">"{customerNote}"</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Breakdown Card */}
                    <div className="bg-amber-50/40 rounded-2xl p-4 border border-amber-200/60 shadow-sm space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-orange-500 text-white">
                          <Receipt size={14} />
                        </div>
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-800">Payment Estimate</span>
                      </div>

                      {chargePreview ? (
                        <div className="space-y-2 pt-0.5">
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>Time Charge (Duration × Guests)</span>
                            <span className="font-semibold text-slate-900">LKR {chargePreview.timeCharge?.toFixed(2) || '0.00'}</span>
                          </div>

                          <div className="flex justify-between text-xs text-slate-600">
                            <span>Handling Fee</span>
                            <span className="font-semibold text-slate-900">LKR {chargePreview.handlingFee?.toFixed(2) || '0.00'}</span>
                          </div>

                          <div className="border-t border-dashed border-amber-200/80 pt-2 mt-1 flex justify-between items-center">
                            <span className="font-bold text-sm text-slate-900">Total Due Upon Approval</span>
                            <span className="text-lg font-black text-orange-600 tracking-tight">
                              LKR {chargePreview.totalCharge?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
                        </div>
                      )}

                      {/* Reassurance banner */}
                      <div className="flex items-center gap-2 pt-2 border-t border-amber-200/40 text-[11px] text-slate-500">
                        <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                        <span>Payment link is sent only after staff confirms table availability.</span>
                      </div>
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
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 shadow-md shadow-orange-500/20 transition-all text-sm active:scale-[0.98]"
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all disabled:opacity-60 text-sm"
                >
                  {submitMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Request</span>
                      <CheckCircle size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
