import { Outlet, NavLink, useLocation } from "react-router-dom";

export default function ReceptionLayout() {
    const location = useLocation();

    const navLinks = [
        {
            to: "/reception/dashboard",
            label: "Dashboard",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            ),
        },
        {
            to: "/reception/orders",
            label: "Orders",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
        },
        {
            to: "/reception/tables",
            label: "Tables",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M3 14h18M3 6h18M3 18h18" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 6v12M16 6v12" />
                </svg>
            ),
        },
        {
            to: "/reception/statistics",
            label: "Statistics",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="flex h-screen bg-[#f5f5f5] overflow-hidden">
            {/* ─── Side Navigation Bar ─── */}
            <aside className="w-[250px] min-w-[250px] bg-white flex flex-col border-r border-gray-100 shadow-sm h-full">
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-6 py-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center overflow-hidden shadow-md">
                        <img
                            src="/images/Purple Blue Gradient Daily Motivation Instagram Post (1).png"
                            alt="CRAVEHOUSE Logo"
                            className="w-8 h-8 object-contain"
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        <span className="text-gray-800">CRAVE</span>
                        <span className="text-orange-500">HOUSE</span>
                    </span>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 flex flex-col gap-1 px-4 mt-4">
                    {navLinks.map((link) => {
                        const isActive = location.pathname.startsWith(link.to);
                        return (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={`
                                    group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                                    transition-all duration-200 relative
                                    ${isActive
                                        ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                                        : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                                    }
                                `}
                            >
                                <span className={`transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-orange-500"}`}>
                                    {link.icon}
                                </span>
                                {link.label}
                                {isActive && (
                                    <span className="absolute right-3 w-2 h-2 bg-white rounded-full" />
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            {/* ─── Main Content Area ─── */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Header Bar */}
                <header className="bg-white border-b border-gray-100 px-8 py-0 shadow-sm shrink-0">
                    <div className="flex items-center justify-between h-16">
                        {/* Search Bar */}
                        <div className="flex-1 max-w-xl">
                            <div className="relative">
                                <svg
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Quick search across modules..."
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
                                />
                            </div>
                        </div>

                        {/* Right Side: Icons + User + Logout */}
                        <div className="flex items-center gap-4">
                            {/* Notification Bell */}
                            <button className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>

                            {/* Help Icon */}
                            <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>

                            {/* Divider */}
                            <div className="w-px h-8 bg-gray-200" />

                            {/* User Info */}
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                    SJ
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-800 leading-tight">Sarah J.</p>
                                    <p className="text-xs text-gray-400">Receptionist</p>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors shadow-sm">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="max-w-[1200px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
