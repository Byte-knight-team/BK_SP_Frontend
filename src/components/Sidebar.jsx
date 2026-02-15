import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UtensilsCrossed,
    Grid3X3,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Circle,
} from 'lucide-react';
import logo from '../assets/logox.png';
import './Sidebar.css';

const COLLAPSED_WIDTH = 72;
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'users', label: 'User Management', icon: Users, path: '/users' },
    {
        id: 'menu',
        label: 'Menu Management',
        icon: UtensilsCrossed,
        path: '/menu',
        subItems: [
            { id: 'menu-active', label: 'Active', filter: 'active' },
            { id: 'menu-oos', label: 'Out of Stock', filter: 'out-of-stock' },
            { id: 'menu-draft', label: 'Draft', filter: 'draft' },
        ],
    },
    { id: 'tables', label: 'Table Management', icon: Grid3X3, path: '/tables' },
    { id: 'settings', label: 'System Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar({ onWidthChange }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [collapsed, setCollapsed] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
    const [menuExpanded, setMenuExpanded] = useState(
        location.pathname.startsWith('/menu')
    );

    const sidebarRef = useRef(null);
    const isResizing = useRef(false);

    // Report width changes to parent layout
    useEffect(() => {
        const w = collapsed ? COLLAPSED_WIDTH : sidebarWidth;
        onWidthChange?.(w);
    }, [collapsed, sidebarWidth, onWidthChange]);

    // Auto-expand menu sub-items when navigating to /menu
    useEffect(() => {
        if (location.pathname.startsWith('/menu')) {
            setMenuExpanded(true);
        }
    }, [location.pathname]);

    /* ── Drag-resize logic ── */
    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const handleMouseMove = (e) => {
            if (!isResizing.current) return;
            const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
            setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, []);

    const toggleCollapse = () => setCollapsed((prev) => !prev);

    const currentFilter = searchParams.get('filter');

    const isItemActive = (item) => {
        if (item.id === 'menu') {
            return location.pathname.startsWith('/menu') && !currentFilter;
        }
        return location.pathname === item.path;
    };

    const isSubItemActive = (filter) => {
        return location.pathname === '/menu' && currentFilter === filter;
    };

    const handleNavClick = (item) => {
        if (item.subItems) {
            if (collapsed) {
                // If collapsed, expand sidebar first
                setCollapsed(false);
                setMenuExpanded(true);
                navigate(item.path);
            } else {
                setMenuExpanded((prev) => !prev);
                navigate(item.path);
            }
        } else {
            navigate(item.path);
        }
    };

    const handleSubItemClick = (filter) => {
        navigate(`/menu?filter=${filter}`);
    };

    const actualWidth = collapsed ? COLLAPSED_WIDTH : sidebarWidth;

    return (
        <aside
            ref={sidebarRef}
            className={`sidebar ${collapsed ? 'collapsed' : ''}`}
            style={{ width: actualWidth, minWidth: actualWidth }}
        >
            {/* Logo */}
            <div className="sidebar-logo">
                <img src={logo} alt="Crave House" className="sidebar-logo-img" />
                {!collapsed && (
                    <span className="sidebar-logo-text">
                        <span className="sidebar-logo-crave">CRAVE</span>HOUSE
                    </span>
                )}
            </div>

            {/* Toggle Button */}
            <button className="sidebar-toggle" onClick={toggleCollapse} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const isActive = isItemActive(item);
                    const hasSubItems = item.subItems && !collapsed;
                    const isMenuSection = item.id === 'menu';
                    const showSubMenu = hasSubItems && menuExpanded;

                    return (
                        <div key={item.id} className="nav-item-group">
                            <button
                                className={`sidebar-nav-item ${isActive ? 'active' : ''} ${isMenuSection && location.pathname.startsWith('/menu') && !isActive ? 'parent-active' : ''}`}
                                onClick={() => handleNavClick(item)}
                                title={collapsed ? item.label : undefined}
                            >
                                <item.icon className="nav-icon" />
                                {!collapsed && <span>{item.label}</span>}
                                {!collapsed && isActive && !hasSubItems && (
                                    <span className="active-dot" />
                                )}
                                {hasSubItems && (
                                    <ChevronDown
                                        className={`sub-menu-chevron ${menuExpanded ? 'rotated' : ''}`}
                                        size={16}
                                    />
                                )}
                            </button>

                            {/* Sub-menu items */}
                            {hasSubItems && (
                                <div className={`sub-menu ${showSubMenu ? 'expanded' : ''}`}>
                                    {item.subItems.map((sub) => (
                                        <button
                                            key={sub.id}
                                            className={`sub-menu-item ${isSubItemActive(sub.filter) ? 'active' : ''}`}
                                            onClick={() => handleSubItemClick(sub.filter)}
                                        >
                                            <Circle className="sub-menu-dot" size={8} />
                                            <span>{sub.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="sidebar-user">
                <div className="sidebar-user-info">
                    <div className="sidebar-avatar">VK</div>
                    {!collapsed && (
                        <div className="sidebar-user-details">
                            <span className="sidebar-user-name">Vibhath Kalsara</span>
                            <span className="sidebar-user-role">ADMIN</span>
                        </div>
                    )}
                </div>
                <button className="sidebar-logout" title={collapsed ? 'Logout' : undefined}>
                    <LogOut className="logout-icon" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>

            {/* Resize Handle (only when expanded) */}
            {!collapsed && (
                <div className="sidebar-resize-handle" onMouseDown={handleMouseDown} />
            )}
        </aside>
    );
}
