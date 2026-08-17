import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Sparkles, X } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Helper to format Date to 'YYYY-MM-DD'
const formatDateString = (d) => {
  if (!d || isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to parse 'YYYY-MM-DD' to local Date
const parseDateString = (str) => {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length !== 3) return null;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  d.setHours(0, 0, 0, 0);
  return isNaN(d.getTime()) ? null : d;
};

// Format for input display (e.g. "Wed, Aug 19, 2026")
const formatDisplayLabel = (dateStr) => {
  const d = parseDateString(dateStr);
  if (!d) return '';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatted = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (d.getTime() === today.getTime()) {
    return `Today (${formatted})`;
  }
  if (d.getTime() === tomorrow.getTime()) {
    return `Tomorrow (${formatted})`;
  }
  return formatted;
};

export default function CustomerDatePicker({
  value,
  onChange,
  minDate = new Date(),
  placeholder = 'Select reservation date',
  minLeadHours = 0
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Effective min date based on lead hours or default
  const effectiveMinDate = new Date(minDate);
  if (minLeadHours > 0) {
    const leadTime = new Date(Date.now() + minLeadHours * 60 * 60 * 1000);
    leadTime.setHours(0, 0, 0, 0);
    if (leadTime > effectiveMinDate) {
      effectiveMinDate.setTime(leadTime.getTime());
    }
  }
  effectiveMinDate.setHours(0, 0, 0, 0);

  const selectedDate = parseDateString(value);

  // Current calendar view year & month
  const [viewYear, setViewYear] = useState(
    selectedDate ? selectedDate.getFullYear() : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    selectedDate ? selectedDate.getMonth() : today.getMonth()
  );

  // Sync calendar view when value changes externally
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  // Generate calendar days for current view
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Previous month trailing days
  const prevMonthDays = getDaysInMonth(
    viewMonth === 0 ? viewYear - 1 : viewYear,
    viewMonth === 0 ? 11 : viewMonth - 1
  );

  const days = [];

  // Fill preceding blanks
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: prevMonthDays - i,
      month: viewMonth === 0 ? 11 : viewMonth - 1,
      year: viewMonth === 0 ? viewYear - 1 : viewYear,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true
    });
  }

  // Trailing next month days to complete 6 rows (42 cells) or 5 rows
  const remaining = 42 - days.length;
  for (let i = 1; i <= (remaining > 7 ? remaining - 7 : remaining); i++) {
    days.push({
      day: i,
      month: viewMonth === 11 ? 0 : viewMonth + 1,
      year: viewMonth === 11 ? viewYear + 1 : viewYear,
      isCurrentMonth: false
    });
  }

  const handleSelectDay = (cell) => {
    const d = new Date(cell.year, cell.month, cell.day);
    d.setHours(0, 0, 0, 0);

    if (d < effectiveMinDate) return; // disabled

    onChange(formatDateString(d));
    setIsOpen(false);
  };

  // Quick preset handlers
  const handleQuickSelect = (offsetDays) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    target.setHours(0, 0, 0, 0);

    if (target < effectiveMinDate) return;

    onChange(formatDateString(target));
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
    setIsOpen(false);
  };

  const handleNextWeekend = () => {
    const target = new Date();
    const dayOfWeek = target.getDay(); // 0 is Sun, 6 is Sat
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    target.setDate(target.getDate() + daysUntilSaturday);
    target.setHours(0, 0, 0, 0);

    if (target < effectiveMinDate) return;

    onChange(formatDateString(target));
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
    setIsOpen(false);
  };

  // Check if we can navigate back
  const canGoPrev = new Date(viewYear, viewMonth, 1) > new Date(effectiveMinDate.getFullYear(), effectiveMinDate.getMonth(), 1);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Date Trigger Input */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border rounded-xl text-left transition-all duration-200 outline-none group ${
          isOpen
            ? 'border-orange-500 ring-2 ring-orange-500/20 bg-white shadow-sm'
            : 'border-slate-200 hover:border-orange-300 hover:bg-white'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon size={16} className={value ? 'text-orange-500' : 'text-slate-400 group-hover:text-orange-500'} />
          <span className={`text-sm font-medium truncate ${value ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
            {value ? formatDisplayLabel(value) : placeholder}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 ml-2">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear date"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-orange-500' : ''}`} />
        </div>
      </button>

      {/* Calendar Dropdown Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 top-full mt-2.5 z-50 w-full max-w-[360px] bg-white rounded-3xl p-4 shadow-2xl border border-slate-100 ring-1 ring-slate-900/5 backdrop-blur-xl"
          >
            {/* Quick Preset Chips */}
            <div className="flex items-center gap-1.5 pb-3 mb-3 border-b border-slate-100 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => handleQuickSelect(0)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors shrink-0"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect(1)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors shrink-0"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={handleNextWeekend}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors shrink-0 flex items-center gap-1"
              >
                <Sparkles size={12} className="text-amber-500" />
                This Weekend
              </button>
            </div>

            {/* Month & Year Navigation Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  {MONTH_NAMES[viewMonth]} <span className="text-slate-400 font-medium">{viewYear}</span>
                </h4>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  disabled={!canGoPrev}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Day of week headers */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAYS_OF_WEEK.map((d, i) => (
                <div key={d} className={`text-[11px] font-bold py-1 ${i === 0 || i === 6 ? 'text-orange-500' : 'text-slate-400'}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((cell, idx) => {
                const cellDate = new Date(cell.year, cell.month, cell.day);
                cellDate.setHours(0, 0, 0, 0);

                const isPast = cellDate < effectiveMinDate;
                const isSelected = selectedDate && cellDate.getTime() === selectedDate.getTime();
                const isToday = cellDate.getTime() === today.getTime();

                return (
                  <button
                    key={`${cell.year}-${cell.month}-${cell.day}-${idx}`}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleSelectDay(cell)}
                    className={`relative h-9 w-full rounded-xl flex items-center justify-center text-xs font-semibold transition-all duration-150 ${
                      !cell.isCurrentMonth
                        ? 'text-slate-300 opacity-40 hover:opacity-100'
                        : isPast
                        ? 'text-slate-300 cursor-not-allowed line-through opacity-40'
                        : isSelected
                        ? 'bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-bold shadow-md shadow-orange-500/30 scale-105 z-10'
                        : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'
                    } ${isToday && !isSelected ? 'ring-2 ring-orange-500/30 font-bold text-orange-600 bg-orange-50/50' : ''}`}
                  >
                    {cell.day}
                    {isToday && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 bg-orange-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer notice */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>* Past dates are unavailable</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="font-bold text-orange-600 hover:text-orange-700 hover:underline"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
