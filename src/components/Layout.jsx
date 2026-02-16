import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    ChefHat,
    Package,
    BookOpen,
    ShieldCheck,
    Settings,
    LogOut,
    Bell,
    ChevronLeft,
    ChevronRight,
    User,
    Menu,
} from 'lucide-react';

const navItems = [
    { path: '/', label: 'Dashboard Overview', icon: LayoutDashboard },
    { path: '/orders', label: 'Orders', icon: ClipboardList },
    { path: '/chefs', label: 'Chefs', icon: ChefHat },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/menu-recipes', label: 'Menu & Recipes', icon: BookOpen },
    { path: '/approvals', label: 'Approvals', icon: ShieldCheck },
];

const bottomNav = [
    { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const handleNav = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-bg-light)]">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-[var(--color-sidebar)] text-[var(--color-text-main)] border-r border-[var(--color-border)]
          flex flex-col
          transition-all duration-300
          ${collapsed ? 'w-[72px]' : 'w-[250px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                {/* Logo */}
                <div className={`flex items-center gap-3 px-5 py-5 border-b border-[var(--color-border)] ${collapsed ? 'justify-center px-3' : ''}`}>
                    <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-xl object-contain flex-shrink-0" />
                    {!collapsed && (
                        <div className="min-w-0">
                            <h1 className="text-sm font-bold truncate">Chief Chef Panel</h1>
                            <p className="text-[10px] text-[var(--color-primary)] font-semibold uppercase tracking-wider">Kitchen Operations</p>
                        </div>
                    )}
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNav(item.path)}
                                title={collapsed ? item.label : ''}
                                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                                        ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30'
                                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-primary)]'
                                    }
                  ${collapsed ? 'justify-center px-2' : ''}
                `}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && <span className="truncate">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom Nav */}
                <div className="px-3 pb-3 space-y-1">
                    {bottomNav.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNav(item.path)}
                                title={collapsed ? item.label : ''}
                                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                                        ? 'bg-[var(--color-primary)] text-white'
                                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-primary)]'
                                    }
                  ${collapsed ? 'justify-center px-2' : ''}
                `}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </button>
                        );
                    })}
                </div>

                {/* User info */}
                <div className={`mx-3 mb-3 p-3 bg-slate-50 border border-[var(--color-border)] rounded-2xl flex items-center gap-3 ${collapsed ? 'justify-center p-2' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                        IU
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-[var(--color-text-main)] truncate">Isuru Udara</h4>
                            <p className="text-xs text-[var(--color-text-muted)] truncate">Chief Chef</p>
                        </div>
                    )}
                    {!collapsed && (
                        <button
                            onClick={() => { console.log('Logout clicked'); }}
                            title="Logout"
                            className="p-1.5 text-slate-400 hover:text-[var(--color-primary)] transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-[var(--color-border)] rounded-full items-center justify-center shadow-sm hover:bg-slate-50 transition-colors text-[var(--color-text-muted)]"
                >
                    {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
            </aside>

            {/* Main area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-[var(--color-border)] px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden text-[var(--color-text-muted)]"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 hover:bg-[var(--color-bg-light)] rounded-xl transition-colors">
                            <Bell className="w-5 h-5 text-[var(--color-text-muted)]" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-primary)] rounded-full" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
