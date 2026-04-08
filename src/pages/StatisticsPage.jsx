import { useState } from "react";

export default function StatisticsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    // ── Hardcoded Shift Context ──
    const shiftInfo = {
        label: "Morning Shift",
        date: "Feb 15, 2026",
        lastSync: "01:38 PM",
    };

    // ── KPI Cards ──
    const kpiCards = [
        {
            label: "TOTAL REVENUE",
            value: "LKR 48,750.00",
            subtitle: "Collected this shift",
            icon: (
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            iconBg: "bg-green-50",
        },
        {
            label: "PENDING PAYMENTS",
            value: "LKR 12,300.00",
            subtitle: "Open bills unpaid",
            icon: (
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            iconBg: "bg-orange-50",
        },
        {
            label: "BILLS GENERATED",
            value: "34",
            subtitle: "Processed today",
            icon: (
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            iconBg: "bg-blue-50",
        },
    ];

    // ── Payment Method Breakdown ──
    const paymentBreakdown = {
        cash: 28450.0,
        card: 20300.0,
    };
    const paymentTotal = paymentBreakdown.cash + paymentBreakdown.card;

    // ── Order Source Split ──
    const orderSources = {
        dineIn: { count: 22, label: "Dine-In Orders" },
        online: { count: 12, label: "Online / QR Orders" },
    };
    const totalOrders = orderSources.dineIn.count + orderSources.online.count;
    const dineInPct = Math.round((orderSources.dineIn.count / totalOrders) * 100);
    const onlinePct = 100 - dineInPct;

    // ── Transaction Log ──
    const transactions = [
        { billId: "BILL-0034", type: "Dine-in · Table 12", amount: 2850.0, status: "Paid" },
        { billId: "BILL-0033", type: "Online · QR", amount: 1200.0, status: "Paid" },
        { billId: "BILL-0032", type: "Dine-in · Table 05", amount: 4500.0, status: "Pending" },
        { billId: "BILL-0031", type: "Dine-in · Table 08", amount: 3200.0, status: "Paid" },
        { billId: "BILL-0030", type: "Online · QR", amount: 980.0, status: "Paid" },
        { billId: "BILL-0029", type: "Dine-in · Table 03", amount: 5600.0, status: "Pending" },
        { billId: "BILL-0028", type: "Online · QR", amount: 1450.0, status: "Paid" },
        { billId: "BILL-0027", type: "Dine-in · Table 10", amount: 2100.0, status: "Paid" },
        { billId: "BILL-0026", type: "Dine-in · Table 01", amount: 6800.0, status: "Pending" },
        { billId: "BILL-0025", type: "Online · QR", amount: 750.0, status: "Paid" },
    ];

    const filteredTransactions = transactions.filter((t) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            t.billId.toLowerCase().includes(term) ||
            t.type.toLowerCase().includes(term) ||
            t.status.toLowerCase().includes(term)
        );
    });

    const statusConfig = {
        Paid: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
        Pending: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
    };

    return (
        <div>
            {/* ── Page Header ── */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shift Statistics</h1>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {shiftInfo.label} — {shiftInfo.date}
                        <span className="text-gray-300 mx-1">·</span>
                        <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M9.172 15.828a4 4 0 010-5.656m5.656 0a4 4 0 010 5.656M12 12h.01" />
                        </svg>
                        <span className="text-green-500 text-xs font-medium">Last synced {shiftInfo.lastSync}</span>
                    </div>
                </div>
                <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Z-Report / End Shift
                </button>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {kpiCards.map((card, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                                {card.icon}
                            </div>
                            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                {card.label}
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                        <p className="text-sm text-gray-400 mt-1">{card.subtitle}</p>
                    </div>
                ))}
            </div>

            {/* ── Two Column: Payment Breakdown + Order Source Split ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Payment Method Breakdown (Till Summary) */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-gray-900">Till Summary</h2>
                        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Payment Methods</span>
                    </div>

                    {/* Cash */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Cash in Drawer</p>
                                <p className="text-xs text-gray-400">Cash On Delivery + Dine-in</p>
                            </div>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                            LKR {paymentBreakdown.cash.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                    </div>

                    {/* Card/Online */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Card / Online</p>
                                <p className="text-xs text-gray-400">Payment Gateway</p>
                            </div>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                            LKR {paymentBreakdown.card.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between pt-4">
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total Collected</p>
                        <p className="text-xl font-bold text-orange-500">
                            LKR {paymentTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Order Source Split */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-gray-900">Order Sources</h2>
                        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Volume Tracking</span>
                    </div>

                    {/* Dine-In */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{orderSources.dineIn.label}</p>
                                <p className="text-xs text-gray-400">Active & completed tables</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{orderSources.dineIn.count}</p>
                            <p className="text-xs text-gray-400">{dineInPct}%</p>
                        </div>
                    </div>

                    {/* Online/QR */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{orderSources.online.label}</p>
                                <p className="text-xs text-gray-400">Digital orders processed</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{orderSources.online.count}</p>
                            <p className="text-xs text-gray-400">{onlinePct}%</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                            <span>Dine-in ({dineInPct}%)</span>
                            <span>Online ({onlinePct}%)</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden flex">
                            <div
                                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-l-full transition-all"
                                style={{ width: `${dineInPct}%` }}
                            />
                            <div
                                className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-r-full transition-all"
                                style={{ width: `${onlinePct}%` }}
                            />
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-2">
                            Total: <span className="font-semibold text-gray-600">{totalOrders} orders</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Live Transaction Log ── */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Table Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4">
                    <h2 className="text-lg font-bold text-gray-900">Live Transaction Log</h2>
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 w-52"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-t border-gray-100">
                                <th className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-6 py-3">Bill ID</th>
                                <th className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-6 py-3">Order Type</th>
                                <th className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-6 py-3">Amount</th>
                                <th className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-6 py-3">Status</th>
                                <th className="text-right text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((t) => {
                                const sc = statusConfig[t.status];
                                return (
                                    <tr key={t.billId} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">{t.billId}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{t.type}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                            LKR {t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-sm font-semibold text-orange-500 hover:text-orange-600 hover:underline transition-colors">
                                                Reprint Bill
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <p className="text-xs text-blue-400">
                        Showing {filteredTransactions.length} of {transactions.length} transactions
                    </p>
                    <p className="text-xs text-gray-400">
                        Auto-refreshes every 30 seconds
                    </p>
                </div>
            </div>
        </div>
    );
}
