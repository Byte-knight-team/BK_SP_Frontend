import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search,
    Plus,
    Eye,
    MoreHorizontal,
    X,
    Bell,
    HelpCircle,
    Settings,
} from 'lucide-react';
import './MenuManagement.css';

/* ── Static Data ── */
const categories = ['All', 'Burgers', 'Pizza', 'Pasta', 'Salads', 'Desserts', 'Drinks'];

const menuItems = [
    {
        id: 1,
        name: 'Classic Cheeseburger',
        category: 'BURGERS',
        price: 1290,
        popularity: 95,
        status: 'active',
        statusLabel: 'ACTIVE',
        image: 'https://cdn.prod.website-files.com/65fc1fa2c1e7707c3f051466/69263773f626fe9424210272_750f721e-ad71-4daa-8601-bc3c78b9587d.webp',
    },
    {
        id: 2,
        name: 'Pepperoni Pizza',
        category: 'PIZZA',
        price: 1650,
        popularity: 88,
        status: 'active',
        statusLabel: 'ACTIVE',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVwcGVyb25pJTIwcGl6emF8ZW58MHx8MHx8fDA=',
    },
    {
        id: 3,
        name: 'Iced Caramel Latte',
        category: 'DRINKS',
        price: 550,
        popularity: 80,
        status: 'out-of-stock',
        statusLabel: 'OUT OF STOCK',
        image: 'https://dwellbymichelle.com/wp-content/uploads/2020/06/DWELL-Iced-Cold-Brew-Latte-e1592262551330.jpg',
    },
    {
        id: 4,
        name: 'Caesar Salad',
        category: 'SALADS',
        price: 990,
        popularity: 65,
        status: 'active',
        statusLabel: 'ACTIVE',
        image: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQP33tR43CcQ8drkc9_Ya5BuOwKSwO0nmmy-WjHT9yyy-SSZGDE',
    },
    {
        id: 5,
        name: 'Chocolate Lava Cake',
        category: 'DESSERTS',
        price: 850,
        popularity: 92,
        status: 'draft',
        statusLabel: 'DRAFT',
        image: 'https://karenehman.com/wp-content/uploads/2024/10/Hot-Fudge-Sundae-Cake-Take-two.jpg',
    },
];

export default function MenuManagement() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeCategory, setActiveCategory] = useState('All');

    const statusFilter = searchParams.get('filter'); // 'active' | 'out-of-stock' | 'draft' | null

    const filteredItems = menuItems.filter((item) => {
        const matchesCategory =
            activeCategory === 'All' ||
            item.category.toLowerCase() === activeCategory.toLowerCase();
        const matchesStatus = !statusFilter || item.status === statusFilter;
        return matchesCategory && matchesStatus;
    });

    const filterLabel = statusFilter
        ? statusFilter === 'out-of-stock'
            ? 'Out of Stock'
            : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)
        : null;

    return (
        <div className="menu-mgmt">
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
            <div className="menu-mgmt-header">
                <div className="menu-mgmt-header-left">
                    <h1>Menu Management{filterLabel ? ` — ${filterLabel}` : ''}</h1>
                    <p>{filterLabel ? `Showing ${filterLabel.toLowerCase()} menu items` : 'Create and organize your restaurant menu'}</p>
                </div>
                <div className="menu-mgmt-header-actions">
                    <button className="btn-manage-cat">Manage Categories</button>
                    <button className="btn-add-item" onClick={() => navigate('/menu/add')}>
                        <Plus size={18} />
                        <span>Add New Item</span>
                    </button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="menu-category-tabs">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Search & Filter Bar */}
            <div className="menu-search-bar">
                <div className="menu-search-group">
                    <Search size={16} className="menu-search-icon" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        className="menu-search-input"
                    />
                </div>
            </div>

            {/* Menu Items Grid */}
            <div className="menu-items-grid">
                {filteredItems.map((item) => (
                    <div key={item.id} className="menu-item-card">
                        <div className="menu-item-img-wrapper">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="menu-item-img"
                            />
                            <span className={`menu-item-status ${item.status}`}>
                                {item.statusLabel}
                            </span>
                        </div>
                        <div className="menu-item-body">
                            <p className="menu-item-category">{item.category}</p>
                            <div className="menu-item-info">
                                <span className="menu-item-name">{item.name}</span>
                                <div className="menu-item-price">
                                    <span className="menu-item-price-currency">LKR</span>
                                    <span className="menu-item-price-value">
                                        {item.price.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className="menu-item-footer">
                                <span className="menu-item-popularity">
                                    <Eye className="menu-item-popularity-icon" />
                                    {item.popularity}% Popular
                                </span>
                                <button className="menu-item-more-btn">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
