import { useState } from "react";

// ── Mock table data matching the design ──
const initialTables = [
    {
        id: 1,
        name: "Main Dining Area",
        status: "OCCUPIED",
        guests: 4,
        capacity: 4,
        activeOrders: 2,
        reservation: null,
    },
    {
        id: 2,
        name: "Window Side",
        status: "AVAILABLE",
        guests: 0,
        capacity: 2,
        activeOrders: 0,
        reservation: null,
    },
    {
        id: 3,
        name: "Booth Area",
        status: "RESERVED",
        guests: 0,
        capacity: 6,
        activeOrders: 0,
        reservation: "6:30 PM Reservation",
    },
    {
        id: 4,
        name: "Terrace",
        status: "OCCUPIED",
        guests: 2,
        capacity: 4,
        activeOrders: 1,
        reservation: null,
    },
    {
        id: 5,
        name: "Main Dining Area",
        status: "AVAILABLE",
        guests: 0,
        capacity: 4,
        activeOrders: 0,
        reservation: null,
    },
    {
        id: 6,
        name: "Private Booth",
        status: "OCCUPIED",
        guests: 3,
        capacity: 6,
        activeOrders: 3,
        reservation: null,
    },
    {
        id: 7,
        name: "Bar Table",
        status: "AVAILABLE",
        guests: 0,
        capacity: 2,
        activeOrders: 0,
        reservation: null,
    },
    {
        id: 8,
        name: "Bar Table",
        status: "OCCUPIED",
        guests: 2,
        capacity: 2,
        activeOrders: 1,
        reservation: null,
    },
];

// ── Status color config ──
const statusConfig = {
    AVAILABLE: {
        badge: "bg-green-50 text-green-600 border border-green-200",
        circle: "bg-green-500",
        border: "border-l-green-500",
        statBorder: "border-l-green-500",
    },
    OCCUPIED: {
        badge: "bg-red-50 text-red-500 border border-red-200",
        circle: "bg-red-500",
        border: "border-l-red-500",
        statBorder: "border-l-orange-500",
    },
    RESERVED: {
        badge: "bg-blue-50 text-blue-600 border border-blue-200",
        circle: "bg-blue-500",
        border: "border-l-blue-500",
        statBorder: "border-l-blue-500",
    },
};

export default function TableManagementPage() {
    const [tables] = useState(initialTables);
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

    // ── Computed stats ──
    const available = tables.filter((t) => t.status === "AVAILABLE").length;
    const occupied = tables.filter((t) => t.status === "OCCUPIED").length;
    const reserved = tables.filter((t) => t.status === "RESERVED").length;

    const statCards = [
        { label: "AVAILABLE", value: available, change: "+0%", changeColor: "text-green-500", ...statusConfig.AVAILABLE },
        { label: "OCCUPIED", value: occupied, change: "+12%", changeColor: "text-orange-500", ...statusConfig.OCCUPIED },
        { label: "RESERVED", value: reserved, change: "-5%", changeColor: "text-red-500", ...statusConfig.RESERVED },
    ];

    return (
        <div className="flex flex-col h-full min-h-0 max-w-[1200px] mx-auto w-full">
            {/* ─── Page Header ─── */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
                        <p className="text-sm text-gray-500">
                            {tables.length} tables • {occupied} occupied
                        </p>
                    </div>
                </div>

                {/* Grid / List Toggle */}
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "grid"
                            ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Grid
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "list"
                            ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        List
                    </button>
                </div>
            </div>

            {/* ─── Summary Stat Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className={`bg-white rounded-xl border border-gray-200 border-l-4 ${card.statBorder} px-6 py-5 hover:shadow-md transition-shadow`}
                    >
                        <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">
                            {card.label}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-900">{card.value}</span>
                            <span className={`text-sm font-medium ${card.changeColor}`}>{card.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ─── Table Cards Grid ─── */}
            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 flex-1">
                    {tables.map((table) => {
                        const config = statusConfig[table.status] || statusConfig.AVAILABLE;
                        return (
                            <div
                                key={table.id}
                                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                            >
                                {/* Top Row: Number badge + Status badge */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`w-11 h-11 rounded-xl ${config.circle} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                                        #{table.id}
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${config.badge}`}>
                                        {table.status}
                                    </span>
                                </div>

                                {/* Table Name + Guest count */}
                                <div className="mb-3">
                                    <h3 className="text-sm font-semibold text-gray-800 leading-tight">
                                        {table.name}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {table.guests} / {table.capacity} Guests
                                    </p>
                                </div>

                                {/* Bottom: Status-specific info */}
                                {table.status === "AVAILABLE" && (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                        Ready for guests
                                    </div>
                                )}
                                {table.status === "OCCUPIED" && table.activeOrders > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-100">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            {table.activeOrders} Active Order{table.activeOrders > 1 ? "s" : ""}
                                        </span>
                                    </div>
                                )}
                                {table.status === "RESERVED" && table.reservation && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-100">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {table.reservation}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ─── List View ─── */
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8 flex-1">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-6 py-3">Table</th>
                                <th className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-6 py-3">Name</th>
                                <th className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-6 py-3">Status</th>
                                <th className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-6 py-3">Guests</th>
                                <th className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-6 py-3">Info</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tables.map((table) => {
                                const config = statusConfig[table.status] || statusConfig.AVAILABLE;
                                return (
                                    <tr key={table.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className={`w-9 h-9 rounded-lg ${config.circle} flex items-center justify-center text-white font-bold text-xs`}>
                                                #{table.id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">{table.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${config.badge}`}>
                                                {table.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{table.guests} / {table.capacity}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {table.status === "AVAILABLE" && "Ready for guests"}
                                            {table.status === "OCCUPIED" && `${table.activeOrders} Active Order${table.activeOrders > 1 ? "s" : ""}`}
                                            {table.status === "RESERVED" && table.reservation}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}


        </div>
    );
}
