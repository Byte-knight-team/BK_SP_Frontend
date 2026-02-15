import React from 'react';
import {
    Search,
    QrCode,
    Plus,
    MoreHorizontal,
    MapPin,
    Users,
    Pencil,
    LayoutGrid,
    List,
    SlidersHorizontal,
    X,
    Bell,
    HelpCircle,
    Settings,
} from 'lucide-react';
import './TableManagement.css';

/* ── Static Data ── */
const summaryData = [
    { label: 'TOTAL TABLES', value: 8, colorClass: 'total' },
    { label: 'AVAILABLE', value: 4, colorClass: 'available' },
    { label: 'OCCUPIED', value: 2, colorClass: 'occupied' },
    { label: 'RESERVED', value: 1, colorClass: 'reserved' },
];

const tablesData = [
    {
        id: 'T-01',
        number: '01',
        location: 'Indoor - Main',
        seats: 2,
        status: 'available',
        statusLabel: 'AVAILABLE',
    },
    {
        id: 'T-02',
        number: '02',
        location: 'Indoor - Main',
        seats: 4,
        status: 'occupied',
        statusLabel: 'OCCUPIED',
    },
    {
        id: 'T-03',
        number: '03',
        location: 'Indoor - Main',
        seats: 4,
        status: 'reserved',
        statusLabel: 'RESERVED',
    },
    {
        id: 'T-04',
        number: '04',
        location: 'Outdoor - Terrace',
        seats: 6,
        status: 'available',
        statusLabel: 'AVAILABLE',
    },
    {
        id: 'T-05',
        number: '05',
        location: 'Outdoor - Terrace',
        seats: 2,
        status: 'cleaning',
        statusLabel: 'CLEANING',
    },
    {
        id: 'T-06',
        number: '06',
        location: 'VIP Lounge',
        seats: 8,
        status: 'available',
        statusLabel: 'AVAILABLE',
    },
    {
        id: 'T-07',
        number: '07',
        location: 'Indoor - Window',
        seats: 4,
        status: 'occupied',
        statusLabel: 'OCCUPIED',
    },
    {
        id: 'T-08',
        number: '08',
        location: 'Indoor - Window',
        seats: 2,
        status: 'available',
        statusLabel: 'AVAILABLE',
    },
];

export default function TableManagement() {
    return (
        <div className="table-mgmt">
            {/* Top Bar */}
            <div className="top-bar">
                <button className="top-bar-close">
                    <X size={18} />
                </button>
                <div className="top-bar-search">
                    <Search size={16} className="top-bar-search-icon" />
                    <input
                        type="text"
                        placeholder="Quick search across modules..."
                        className="top-bar-search-input"
                    />
                </div>
                <div className="top-bar-actions">
                    <button className="top-bar-icon-btn">
                        <Bell size={20} />
                        <span className="top-bar-notification-dot" />
                    </button>
                    <button className="top-bar-icon-btn">
                        <HelpCircle size={20} />
                    </button>
                    <div className="top-bar-divider" />
                    <button className="top-bar-system-btn">
                        <Settings size={16} />
                        <span>System Panel</span>
                    </button>
                </div>
            </div>

            {/* Header */}
            <div className="table-mgmt-header">
                <div className="table-mgmt-header-left">
                    <h1>Table Management</h1>
                    <p>Configure floor plans and QR code ordering tables</p>
                </div>
                <div className="table-mgmt-header-actions">
                    <button className="btn-print-qr">
                        <QrCode size={18} />
                        <span>Print All QR</span>
                    </button>
                    <button className="btn-add-table">
                        <Plus size={18} />
                        <span>Add Table</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="table-summary-row">
                {summaryData.map((item) => (
                    <div key={item.label} className="table-summary-card">
                        <p className={`table-summary-label ${item.colorClass}`}>
                            {item.label}
                        </p>
                        <p className="table-summary-value">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Search & View Controls */}
            <div className="table-controls">
                <div className="table-search">
                    <Search size={16} className="table-search-icon" />
                    <input
                        type="text"
                        placeholder="Search tables or zones..."
                        className="table-search-input"
                    />
                </div>
                <div className="table-view-controls">
                    <button className="view-btn active">
                        <LayoutGrid size={18} />
                    </button>
                    <button className="view-btn">
                        <List size={18} />
                    </button>
                    <button className="view-btn">
                        <SlidersHorizontal size={18} />
                    </button>
                </div>
            </div>

            {/* Table Grid */}
            <div className="table-grid">
                {tablesData.map((table) => (
                    <div key={table.id} className="table-card">
                        <div className="table-card-top">
                            <div className={`table-number-badge ${table.status}`}>
                                {table.number}
                            </div>
                            <button className="table-card-menu-btn">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>
                        <p className="table-card-name">{table.id}</p>
                        <div className="table-card-location">
                            <MapPin className="table-card-location-icon" />
                            <span>{table.location}</span>
                        </div>
                        <div className="table-card-info">
                            <span className="table-card-seats">
                                <Users className="table-card-seats-icon" />
                                {table.seats} Seats
                            </span>
                            <span className={`table-card-status ${table.status}`}>
                                <span className={`status-dot ${table.status}`} />
                                {table.statusLabel}
                            </span>
                        </div>
                        <div className="table-card-actions">
                            <button className="table-action-btn">
                                <Pencil className="action-icon" />
                                Edit
                            </button>
                            <button className="table-action-qr">
                                <QrCode className="action-icon" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add New Table Card */}
                <div className="add-table-card">
                    <div className="add-table-icon">
                        <Plus size={22} />
                    </div>
                    <span className="add-table-text">Add New Table</span>
                    <span className="add-table-sub">Expansion mode</span>
                </div>
            </div>
        </div>
    );
}
