import { useState } from 'react';
import {
    Package,
    AlertTriangle,
    Download,
    SlidersHorizontal,
    X,
    Check,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    AlertCircle,
    MessageSquare,
    Zap,
} from 'lucide-react';
import { inventoryItems as initialItems } from '../data/mockData';

const statusStyles = {
    critical: { bg: 'bg-red-50', text: 'text-red-600', label: 'CRITICAL' },
    low: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'LOW' },
    ok: { bg: 'bg-green-50', text: 'text-green-600', label: 'OK' },
};

export default function Inventory() {
    const [items, setItems] = useState(initialItems);
    const [filterLow, setFilterLow] = useState(false);
    const [updateModal, setUpdateModal] = useState({ open: false, item: null });
    const [requestModal, setRequestModal] = useState({ open: false, item: null });
    const [newItemModal, setNewItemModal] = useState(false);
    const [bulkModal, setBulkModal] = useState(false);
    const [updateQty, setUpdateQty] = useState('');
    const [newItemData, setNewItemData] = useState({ name: '', unit: 'kg', threshold: '', reason: '' });
    const [requestQty, setRequestQty] = useState('');
    const [requestUrgency, setRequestUrgency] = useState('normal');
    const [requestNotes, setRequestNotes] = useState('');
    const [successToast, setSuccessToast] = useState('');

    const lowItems = items.filter(i => i.status === 'critical' || i.status === 'low');
    const filtered = filterLow ? lowItems : items;
    const totalAssets = items.reduce((acc, i) => acc + i.currentQty * 1050, 0).toLocaleString();
    const itemsOut = lowItems.length;

    const showToast = (msg) => {
        setSuccessToast(msg);
        setTimeout(() => setSuccessToast(''), 3000);
    };

    const handleUpdate = () => {
        if (!updateQty || isNaN(updateQty)) return;
        const qty = parseFloat(updateQty);
        setItems(prev => prev.map(i => {
            if (i.id !== updateModal.item.id) return i;
            const newQty = qty;
            let newStatus = 'ok';
            if (newQty <= i.threshold * 0.3) newStatus = 'critical';
            else if (newQty <= i.threshold) newStatus = 'low';
            return { ...i, currentQty: newQty, status: newStatus };
        }));
        showToast(`${updateModal.item.name} updated to ${qty} ${updateModal.item.unit}`);
        setUpdateModal({ open: false, item: null });
        setUpdateQty('');
    };

    const handleRequestNewItem = () => {
        if (!newItemData.name || !newItemData.reason) return;

        console.log('New Item Request:', newItemData);
        showToast(`Request sent for new item: ${newItemData.name}`);
        setNewItemModal(false);
        setNewItemData({ name: '', unit: 'kg', threshold: '', reason: '' });
    };

    const handleRequestStock = () => {
        if (!requestQty || isNaN(requestQty)) return;
        // In a real app, this would call an API to create a request
        console.log('Restock Request:', {
            item: requestModal.item.name,
            qty: requestQty,
            urgency: requestUrgency,
            notes: requestNotes
        });

        showToast(`Request sent: ${requestModal.item.name} (${requestQty} ${requestModal.item.unit})`);
        setRequestModal({ open: false, item: null });
        setRequestQty('');
        setRequestNotes('');
        setRequestUrgency('normal');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Inventory Management</h1>
                <div className="flex items-center gap-2">
                    <button className="p-2 border border-[var(--color-border)] rounded-lg hover:bg-slate-50 cursor-default"><SlidersHorizontal className="w-4 h-4 text-[var(--color-text-muted)]" /></button>
                    <button className="p-2 border border-[var(--color-border)] rounded-lg hover:bg-slate-50 cursor-default"><Download className="w-4 h-4 text-[var(--color-text-muted)]" /></button>
                </div>
            </div>

            {/* Alert Banner */}
            {lowItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <div>
                            <p className="text-sm font-bold text-amber-800">Low Inventory: {lowItems.length} items need attention</p>
                            <p className="text-xs text-amber-600">Urgent procurement required for {lowItems.map(i => i.name).join(', ')}.</p>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-xs font-semibold hover:bg-[var(--color-primary-dark)] transition-colors">View Details</button>
                </div>
            )}



            {/* Filter + Bulk Update (Static) */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <label className="text-sm text-[var(--color-text-muted)]">Filter by Low Status</label>
                    <div className="w-10 h-6 rounded-full bg-slate-300 relative cursor-default">
                        <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-white border border-[var(--color-primary)] text-[var(--color-primary)] rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors cursor-default">
                        + Request New Item
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--color-primary-dark)] transition-colors shadow-lg shadow-[var(--color-primary)]/20 cursor-default">
                        <Zap className="w-4 h-4" /> Start-of-day Update
                    </button>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[var(--color-bg-light)]">
                                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Item Name</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Unit</th>
                                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Current Qty</th>
                                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Threshold</th>
                                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Status</th>
                                <th className="text-right px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.slice(0, 6).map(item => {
                                const style = statusStyles[item.status];
                                return (
                                    <tr key={item.id} className="border-t border-[var(--color-border)] hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{item.image}</span>
                                                <span className="font-semibold text-[var(--color-text-main)]">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-[var(--color-text-muted)]">{item.unit}</td>
                                        <td className={`px-4 py-4 text-center font-bold ${item.status === 'critical' ? 'text-red-600' : item.status === 'low' ? 'text-amber-600' : 'text-blue-600'
                                            }`}>
                                            {item.currentQty}
                                        </td>
                                        <td className="px-4 py-4 text-center text-[var(--color-text-main)]">{item.threshold}</td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${style.bg} ${style.text}`}>
                                                {style.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-[var(--color-primary)] text-sm font-semibold hover:underline cursor-default">Update</button>
                                            <button className="ml-3 text-amber-600 text-sm font-semibold hover:underline cursor-default">Request</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-muted)]">Showing {Math.min(filtered.length, 6)} of {items.length} items</p>
                    <div className="flex items-center gap-1">
                        <button className="px-2 py-1 text-xs border border-[var(--color-border)] rounded-lg hover:bg-slate-50 cursor-default"><ChevronLeft className="w-3 h-3" /></button>
                        <button className="px-2.5 py-1 text-xs bg-[var(--color-primary)] text-white rounded-lg font-semibold cursor-default">1</button>
                        <button className="px-2.5 py-1 text-xs border border-[var(--color-border)] rounded-lg hover:bg-slate-50 cursor-default">2</button>
                        <button className="px-2.5 py-1 text-xs border border-[var(--color-border)] rounded-lg hover:bg-slate-50 cursor-default">3</button>
                        <button className="px-2 py-1 text-xs border border-[var(--color-border)] rounded-lg hover:bg-slate-50 cursor-default"><ChevronRight className="w-3 h-3" /></button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)]">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Total Assets</p>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-text-main)]">LKR {totalAssets}</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> 3.2% from last week
                    </p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)]">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Items Out</p>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-text-main)]">{itemsOut}</p>
                    <p className="text-xs text-red-600 mt-1">! Requires urgent attention</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)]">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Pending Orders</p>
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-text-main)]">08</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        <span>3 expected today</span>
                    </div>
                </div>
            </div>

            {/* Update Qty Modal */}
            {
                updateModal.open && updateModal.item && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setUpdateModal({ open: false, item: null })}>
                        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">Update: {updateModal.item.name}</h3>
                                <button onClick={() => setUpdateModal({ open: false, item: null })} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
                            </div>
                            <p className="text-sm text-[var(--color-text-muted)] mb-3">Current: {updateModal.item.currentQty} {updateModal.item.unit}</p>
                            <input
                                type="number"
                                value={updateQty}
                                onChange={e => setUpdateQty(e.target.value)}
                                className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                placeholder="New quantity"
                            />
                            <div className="flex gap-3 mt-5">
                                <button onClick={() => setUpdateModal({ open: false, item: null })} className="flex-1 py-2.5 bg-slate-100 rounded-xl font-semibold text-sm">Cancel</button>
                                <button onClick={handleUpdate} className="flex-1 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--color-primary-dark)] transition-colors">Update</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Bulk Update Modal */}
            {
                bulkModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setBulkModal(false)}>
                        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg animate-slide-up max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-bold">Start-of-Day Bulk Update</h3>
                                <button onClick={() => setBulkModal(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-3">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 bg-[var(--color-bg-light)] rounded-xl">
                                        <span className="text-xl">{item.image}</span>
                                        <span className="flex-1 text-sm font-medium">{item.name}</span>
                                        <input
                                            type="number"
                                            defaultValue={item.currentQty}
                                            className="w-20 px-2 py-1.5 border border-[var(--color-border)] rounded-lg text-sm text-center focus:outline-none"
                                        />
                                        <span className="text-xs text-[var(--color-text-muted)]">{item.unit}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 mt-5">
                                <button onClick={() => setBulkModal(false)} className="flex-1 py-2.5 bg-slate-100 rounded-xl font-semibold text-sm">Cancel</button>
                                <button onClick={() => { setBulkModal(false); showToast('Bulk update saved!'); }} className="flex-1 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm">Save All</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Request Stock Modal */}
            {requestModal.open && requestModal.item && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setRequestModal({ open: false, item: null })}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Request Restock</h3>
                            <button onClick={() => setRequestModal({ open: false, item: null })} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-sm font-semibold text-[var(--color-text-main)]">{requestModal.item.name}</p>
                            <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-1">
                                <span>Current: {requestModal.item.currentQty} {requestModal.item.unit}</span>
                                <span>Threshold: {requestModal.item.threshold}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Quantity Needed ({requestModal.item.unit})</label>
                                <input
                                    type="number"
                                    value={requestQty}
                                    onChange={e => setRequestQty(e.target.value)}
                                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    placeholder="e.g. 5"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Urgency</label>
                                <select
                                    value={requestUrgency}
                                    onChange={e => setRequestUrgency(e.target.value)}
                                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Notes</label>
                                <textarea
                                    value={requestNotes}
                                    onChange={e => setRequestNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-xl text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    placeholder="Any specific instructions..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setRequestModal({ open: false, item: null })} className="flex-1 py-2.5 bg-slate-100 rounded-xl font-semibold text-sm">Cancel</button>
                            <button onClick={handleRequestStock} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-semibold text-sm hover:bg-amber-600 transition-colors">Send Request</button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Item Modal */}
            {newItemModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setNewItemModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Request New Item</h3>
                            <button onClick={() => setNewItemModal(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Item Name</label>
                                <input
                                    type="text"
                                    value={newItemData.name}
                                    onChange={e => setNewItemData({ ...newItemData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    placeholder="e.g. Saffron"
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Unit</label>
                                    <select
                                        value={newItemData.unit}
                                        onChange={e => setNewItemData({ ...newItemData, unit: e.target.value })}
                                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    >
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                        <option value="liters">liters</option>
                                        <option value="ml">ml</option>
                                        <option value="pcs">pcs</option>
                                        <option value="packs">packs</option>
                                        <option value="cans">cans</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Threshold</label>
                                    <input
                                        type="number"
                                        value={newItemData.threshold}
                                        onChange={e => setNewItemData({ ...newItemData, threshold: e.target.value })}
                                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                        placeholder="Min Qty"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Reason for Request</label>
                                <textarea
                                    value={newItemData.reason}
                                    onChange={e => setNewItemData({ ...newItemData, reason: e.target.value })}
                                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-xl text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    placeholder="Why do we need this item?"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setNewItemModal(false)} className="flex-1 py-2.5 bg-slate-100 rounded-xl font-semibold text-sm">Cancel</button>
                            <button onClick={handleRequestNewItem} className="flex-1 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--color-primary-dark)] transition-colors">Submit Request</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {
                successToast && (
                    <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg animate-slide-in text-sm font-semibold flex items-center gap-2">
                        <Check className="w-4 h-4" /> {successToast}
                    </div>
                )
            }
        </div >
    );
}
