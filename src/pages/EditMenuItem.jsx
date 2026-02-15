import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Info,
    X,
    Search,
    Bell,
    HelpCircle,
    Settings,
} from 'lucide-react';
import './AddMenuItem.css';
import './EditMenuItem.css';

const visibilityOptions = [
    { id: 'active', label: 'Active' },
    { id: 'out-of-stock', label: 'Out of_stock' },
    { id: 'draft', label: 'Draft' },
];

export default function EditMenuItem() {
    const navigate = useNavigate();
    const [visibility, setVisibility] = useState('active');

    return (
        <div className="edit-menu-item">
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
            <div className="edit-menu-header">
                <div className="edit-menu-header-left">
                    <button
                        className="edit-menu-back-btn"
                        onClick={() => navigate('/menu')}
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div className="edit-menu-header-text">
                        <h1>Edit Menu Item</h1>
                        <p>Configure item details, variants, and availability</p>
                    </div>
                </div>
                <div className="edit-menu-header-actions">
                    <button
                        className="btn-cancel"
                        onClick={() => navigate('/menu')}
                    >
                        Cancel
                    </button>
                    <button className="btn-save-changes">Save Changes</button>
                </div>
            </div>

            {/* Content */}
            <div className="edit-menu-content">
                {/* Left: General Information */}
                <div className="general-info-card">
                    <div className="general-info-title">
                        <Info className="general-info-title-icon" />
                        <span>General Information</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Item Name</label>
                        <input
                            type="text"
                            className="form-input"
                            defaultValue="Pepperoni Pizza"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-select" defaultValue="pizza">
                                <option value="">Select category</option>
                                <option value="burgers">Burgers</option>
                                <option value="pizza">Pizza</option>
                                <option value="pasta">Pasta</option>
                                <option value="salads">Salads</option>
                                <option value="desserts">Desserts</option>
                                <option value="drinks">Drinks</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Base Price (LKR)</label>
                            <input
                                type="number"
                                className="form-input"
                                defaultValue={1650}
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Describe your dish..."
                        />
                    </div>
                </div>

                {/* Right Column */}
                <div className="edit-menu-right">
                    {/* Item Image Preview */}
                    <div className="image-preview-card">
                        <h3>Item Image</h3>
                        <img
                            src="https://images.unsplash.com/photo-1628840042765-356cda07504e?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVwcGVyb25pJTIwcGl6emF8ZW58MHx8MHx8fDA="
                            alt="Pepperoni Pizza"
                            className="image-preview-img"
                        />
                    </div>

                    {/* Visibility */}
                    <div className="visibility-card">
                        <h3>Visibility</h3>
                        <div className="visibility-options">
                            {visibilityOptions.map((opt) => (
                                <div
                                    key={opt.id}
                                    className={`visibility-option ${visibility === opt.id ? 'selected' : ''
                                        }`}
                                    onClick={() => setVisibility(opt.id)}
                                >
                                    <span className="visibility-option-label">
                                        {opt.label}
                                    </span>
                                    <div className="visibility-radio">
                                        <div className="visibility-radio-inner" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
