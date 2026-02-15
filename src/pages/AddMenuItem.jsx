import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Upload,
    Info,
    X,
    Search,
    Bell,
    HelpCircle,
    Settings,
} from 'lucide-react';
import './AddMenuItem.css';

const visibilityOptions = [
    { id: 'active', label: 'Active' },
    { id: 'out-of-stock', label: 'Out of Stock' },
    { id: 'draft', label: 'Draft' },
];

export default function AddMenuItem() {
    const navigate = useNavigate();
    const [visibility, setVisibility] = useState('draft');

    return (
        <div className="add-menu-item">
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
            <div className="add-menu-header">
                <div className="add-menu-header-left">
                    <button
                        className="add-menu-back-btn"
                        onClick={() => navigate('/menu')}
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div className="add-menu-header-text">
                        <h1>Add New Menu Item</h1>
                        <p>Configure item details, variants, and availability</p>
                    </div>
                </div>
                <div className="add-menu-header-actions">
                    <button
                        className="btn-cancel"
                        onClick={() => navigate('/menu')}
                    >
                        Cancel
                    </button>
                    <button className="btn-create-item" onClick={() => navigate('/menu/edit')}>Create Item</button>
                </div>
            </div>

            {/* Content */}
            <div className="add-menu-content">
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
                            placeholder="e.g. Classic Cheeseburger"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-select">
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
                                placeholder="0"
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
                <div className="add-menu-right">
                    {/* Item Image */}
                    <div className="image-upload-card">
                        <h3>Item Image</h3>
                        <div className="image-upload-area">
                            <div className="image-upload-icon">
                                <Upload size={22} />
                            </div>
                            <span className="image-upload-text">
                                Upload high-res PNG/JPG
                            </span>
                            <span className="image-upload-sub">
                                Min. 600x600px suggested
                            </span>
                        </div>
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
