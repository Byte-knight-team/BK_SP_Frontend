import React, { useState } from "react";

const settingsCards = [
  { icon: "🌐", title: "General Settings", description: "Company details, localization, and branding" },
  { icon: "💳", title: "Payment Gateway", description: "Configure payment gateway settings" },
  { icon: "🔒", title: "Security & Auth", description: "Session management, and audit logs" },
  { icon: "🔗", title: "External APIs", description: "Manage Maps, and SMS keys" },
];

export default function SystemSettings() {
  const [config, setConfig] = useState({
    serviceTax: "8",
    defaultCurrency: "LKR",
    qrTableOrdering: true,
    loyaltyProgram: true,
  });

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-auto">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
          <p className="text-sm text-gray-500">Fine-tune Crave House instance performance and integrations</p>
        </div>

        {/* Settings Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {settingsCards.map((card, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 cursor-pointer hover:border-gray-200 transition-colors">
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-2xl">
                {card.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{card.title}</h3>
                <p className="text-sm text-gray-500">{card.description}</p>
              </div>
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>

        {/* Core Configuration */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Core Configuration</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Service Tax (%)
              </label>
              <input
                type="text"
                value={config.serviceTax}
                onChange={(e) => setConfig({ ...config, serviceTax: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Default Currency
              </label>
              <input
                type="text"
                value={config.defaultCurrency}
                onChange={(e) => setConfig({ ...config, defaultCurrency: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Feature Toggles</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Online Ordering</h3>
                <p className="text-sm text-gray-500">Allow customers to order from website</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, qrTableOrdering: !config.qrTableOrdering })}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${config.qrTableOrdering ? "bg-orange-500" : "bg-gray-200"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${config.qrTableOrdering ? "translate-x-5" : ""}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-500">Loyalty Program</h3>
                <p className="text-sm text-gray-400">Enable points and rewards system</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, loyaltyProgram: !config.loyaltyProgram })}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${config.loyaltyProgram ? "bg-orange-500" : "bg-gray-200"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${config.loyaltyProgram ? "translate-x-5" : ""}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
            Reset Defaults
          </button>
          <button className="px-8 py-3 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

