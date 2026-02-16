// src/pages/CreateUser.jsx
import { useState } from "react";
import PropTypes from "prop-types";

const roles = ["Admin", "Manager", "Receptionist", "Chief Chef", "Delivery Driver"];

export default function CreateUser({ onPageChange }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Admin",
    status: "ACTIVE",
  });

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-auto">
      {/* Back */}
      <button
        onClick={() => onPageChange("users")}
        className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-gray-400 hover:text-gray-600 uppercase"
      >
        <span className="text-lg leading-none">←</span> Back to User Management
      </button>

      {/* Card */}
      <div className="mt-6 flex justify-center">
        <div className="w-full max-w-5xl bg-white rounded-[28px] border border-gray-100 shadow-sm px-10 py-10">
          <h1 className="text-3xl font-extrabold text-gray-900">Register New Staff</h1>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
            {/* Full Name */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
                Full Name
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Ashen Randira"
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
                Email Address
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" />
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. ashen@cravehouse.com"
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
                Phone Number
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
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +94 77 123 4567"
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Account Status */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
                Account Status
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "ACTIVE" })}
                  className={`flex-1 h-12 rounded-xl border text-xs font-bold tracking-widest uppercase transition-colors ${
                    form.status === "ACTIVE"
                      ? "bg-green-50 border-green-100 text-green-700"
                      : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${form.status === "ACTIVE" ? "bg-green-500" : "bg-gray-300"}`} />
                    Active
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "INACTIVE" })}
                  className={`flex-1 h-12 rounded-xl border text-xs font-bold tracking-widest uppercase transition-colors ${
                    form.status === "INACTIVE"
                      ? "bg-gray-100 border-gray-200 text-gray-700"
                      : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${form.status === "INACTIVE" ? "bg-gray-500" : "bg-gray-300"}`} />
                    Inactive
                  </span>
                </button>
              </div>
            </div>

            {/* Role (Full width like your screenshot) */}
            <div className="md:col-span-2 max-w-xl">
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
                Designated Role
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z" />
                  </svg>
                </span>

                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full h-12 pl-12 pr-10 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => onPageChange("users")}
              className="flex-1 h-12 rounded-xl border border-gray-200 text-xs font-bold tracking-widest uppercase text-gray-400 hover:bg-gray-50"
            >
              Cancel Registration
            </button>

            <button
              type="button"
              className="flex-1 h-12 rounded-xl bg-orange-500 text-white text-xs font-bold tracking-widest uppercase hover:bg-orange-600 shadow-lg shadow-orange-500/25 inline-flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 7h8M8 11h8M8 15h6M6 3h12a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V5a2 2 0 012-2z" />
              </svg>
              Save User Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

CreateUser.propTypes = {
  onPageChange: PropTypes.func.isRequired,
};
