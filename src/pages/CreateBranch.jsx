// src/pages/CreateBranch.jsx
import { useState } from "react";
import PropTypes from "prop-types";

export default function CreateBranch({ onPageChange }) {
  const [form, setForm] = useState({
    branchName: "",
    location: "",
    contactPhone: "",
    operatingHours: "08:00 AM - 08:00 PM",
    coverUrl: "",
  });

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-auto">
      {/* Back */}
      <button
        onClick={() => onPageChange("branches")}
        className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-gray-400 hover:text-gray-600 uppercase"
      >
        <span className="text-lg leading-none">←</span> Back to Branch Management
      </button>

      {/* Card */}
      <div className="mt-6 flex justify-center">
        <div className="w-full max-w-5xl bg-white rounded-[28px] border border-gray-100 shadow-sm px-10 py-10">
          <h1 className="text-2xl font-bold text-gray-900">Register New Branch</h1>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
            {/* Branch Name */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
                Branch Name
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M6 21V7l6-4 6 4v14M9 21v-6h6v6" />
                  </svg>
                </span>
                <input
                  value={form.branchName}
                  onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                  placeholder="e.g. Maharagama Express"
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
                Location Address
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z" />
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 10a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </span>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Street, City"
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
                Contact Phone
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </span>
                <input
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  placeholder="+94-XXXXXXXXX"
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
                Operating Hours
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <input
                  value={form.operatingHours}
                  onChange={(e) => setForm({ ...form, operatingHours: e.target.value })}
                  placeholder="08:00 AM - 08:00 PM"
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Cover Image URL (full width like screenshot) */}
            <div className="md:col-span-2">
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
                Cover Image URL
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 16l4-4 4 4 4-6 4 6" />
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
                  </svg>
                </span>
                <input
                  value={form.coverUrl}
                  onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => onPageChange("branches")}
              className="flex-1 h-12 rounded-xl border border-gray-200 text-xs font-bold tracking-widest uppercase text-gray-400 hover:bg-gray-50"
            >
              Cancel Registration
            </button>

            <button
              type="button"
              className="flex-1 h-12 rounded-xl bg-gray-900 text-white text-xs font-bold tracking-widest uppercase hover:bg-gray-800 shadow-lg shadow-gray-900/15 inline-flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Register Branch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

CreateBranch.propTypes = {
  onPageChange: PropTypes.func.isRequired,
};
