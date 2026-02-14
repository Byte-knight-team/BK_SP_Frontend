import { Outlet, NavLink, useLocation } from "react-router-dom";

export default function ReceptionLayout() {
    const location = useLocation();

    const navLinks = [
        { to: "/reception/dashboard", label: "Dashboard" },
        { to: "/reception/orders", label: "Orders" },
    ];

    return (
        <div className="min-h-screen bg-[#f5f5f5]">
            {/* ─── Top Navbar ─── */}
            <header className="bg-white border-b border-gray-200 px-8 py-0 sticky top-0 z-50 shadow-sm">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            <span className="text-gray-800">CRAVE</span>
                            <span className="text-orange-500">HOUSE</span>
                        </span>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex items-center gap-8">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    `text-sm font-medium transition-colors pb-[1.15rem] pt-[1.25rem] border-b-2 ${isActive
                                        ? "text-orange-500 border-orange-500"
                                        : "text-gray-500 border-transparent hover:text-gray-800"
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Info + Logout */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-white font-semibold text-sm">
                                SJ
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-800 leading-tight">Sarah J.</p>
                                <p className="text-xs text-gray-400">Receptionist</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* ─── Page Content ─── */}
            <main className="px-8 py-6 max-w-[1200px] mx-auto">
                <Outlet />
            </main>
        </div>
    );
}
