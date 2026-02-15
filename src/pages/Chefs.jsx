import { useState } from 'react';
import {
    ChefHat,
    UserPlus,
    Check,
    Users,
    Clock,
    Activity,
    X,
    Eye,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { chefs as initialChefs } from '../data/mockData';

const statusStyles = {
    available: { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500', label: 'Available' },
    busy: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500', label: 'Busy' },
    offline: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', label: 'Offline' },
};

export default function Chefs() {
    const [chefList, setChefList] = useState(initialChefs);
    const [activeTab, setActiveTab] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedChef, setSelectedChef] = useState(null);
    const [newChef, setNewChef] = useState({ name: '', role: '', phone: '', email: '', shift: 'Morning' });
    const [successToast, setSuccessToast] = useState('');

    const totalChefs = chefList.length;
    const availableCount = chefList.filter(c => c.status === 'available').length;
    const avgPrepTime = '12.4m';
    const mealsServed = chefList.reduce((acc, c) => acc + c.mealsAssigned, 0);

    const filteredChefs = activeTab === 'all' ? chefList :
        activeTab === 'onshift' ? chefList.filter(c => c.status !== 'offline') :
            chefList.filter(c => c.role === 'Line Cook' || c.role === 'Trainee');

    const kpis = [
        { label: 'Total Chefs', value: totalChefs, icon: Users, badge: '+2 New', badgeColor: 'text-blue-600', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
        { label: 'Available Now', value: availableCount, icon: Check, badge: 'Live', badgeColor: 'text-green-600', iconBg: 'bg-green-50', iconColor: 'text-green-600' },
        { label: 'Avg. Prep Time', value: avgPrepTime, icon: Clock, badge: 'On Duty', badgeColor: 'text-[var(--color-primary)]', iconBg: 'bg-orange-50', iconColor: 'text-[var(--color-primary)]' },
        { label: 'Meals Served', value: mealsServed, icon: Activity, badge: 'Today', badgeColor: 'text-purple-600', iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
    ];

    const handleAddChef = () => {
        if (!newChef.name.trim() || !newChef.role.trim()) return;
        // Simulates sending to admin for approval
        setSuccessToast('Chef request submitted — Pending Admin Approval');
        setTimeout(() => setSuccessToast(''), 3000);
        setShowAddModal(false);
        setNewChef({ name: '', role: '', phone: '', email: '', shift: 'Morning' });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Chefs Management</h1>
                    <p className="text-sm text-[var(--color-text-muted)]">Monitor kitchen staff performance and daily availability.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--color-primary-dark)] transition-colors shadow-lg shadow-[var(--color-primary)]/20"
                >
                    <UserPlus className="w-4 h-4" /> Add New Chef
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-[var(--color-border)]">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-11 h-11 ${kpi.iconBg} rounded-xl flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${kpi.iconColor}`} />
                                </div>
                                <span className={`text-xs font-semibold ${kpi.badgeColor}`}>{kpi.badge}</span>
                            </div>
                            <p className="text-sm text-[var(--color-text-muted)]">{kpi.label}</p>
                            <p className="text-3xl font-bold text-[var(--color-text-main)]">{kpi.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Tabs + Table */}
            <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                    <div className="flex gap-6">
                        {[{ key: 'all', label: 'All Staff' }, { key: 'onshift', label: 'On Shift' }, { key: 'trainees', label: 'Trainees' }].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${activeTab === tab.key ? 'text-[var(--color-primary)] border-[var(--color-primary)]' : 'text-[var(--color-text-muted)] border-transparent'
                                    }`}
                            >{tab.label}</button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[var(--color-bg-light)]">
                                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Chef Name</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Status</th>
                                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Meals Assigned</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Avg Prep Time</th>
                                <th className="text-right px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredChefs.map(chef => {
                                const style = statusStyles[chef.status];
                                return (
                                    <tr key={chef.id} className="border-t border-[var(--color-border)] hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <ChefHat className="w-5 h-5 text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[var(--color-text-main)]">{chef.name}</p>
                                                    <p className="text-xs text-[var(--color-text-muted)]">{chef.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                                {style.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center font-bold text-[var(--color-text-main)]">{chef.mealsAssigned}</td>
                                        <td className="px-4 py-4">
                                            <span className="text-[var(--color-text-main)]">{chef.avgPrepTime}</span>
                                            {chef.avgPrepChange !== 0 && (
                                                <span className={`ml-1.5 text-xs font-semibold ${chef.avgPrepChange < 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {chef.avgPrepChange > 0 ? '+' : ''}{chef.avgPrepChange}%
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedChef(chef)}
                                                className="text-[var(--color-primary)] text-sm font-semibold hover:underline"
                                            >View Details</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-muted)]">Showing {filteredChefs.length} of {totalChefs} chefs</p>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 text-xs border border-[var(--color-border)] rounded-lg hover:bg-slate-50">Previous</button>
                        <button className="px-3 py-1 text-xs border border-[var(--color-border)] rounded-lg hover:bg-slate-50">Next</button>
                    </div>
                </div>
            </div>

            {/* Add Chef Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAddModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold">Add New Chef</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3">
                            <input value={newChef.name} onChange={e => setNewChef({ ...newChef, name: e.target.value })} placeholder="Chef Name" className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" />
                            <input value={newChef.role} onChange={e => setNewChef({ ...newChef, role: e.target.value })} placeholder="Role (e.g., Line Cook)" className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" />
                            <input value={newChef.phone} onChange={e => setNewChef({ ...newChef, phone: e.target.value })} placeholder="Phone" className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" />
                            <input value={newChef.email} onChange={e => setNewChef({ ...newChef, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" />
                            <select value={newChef.shift} onChange={e => setNewChef({ ...newChef, shift: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none">
                                <option>Morning</option>
                                <option>Evening</option>
                                <option>Night</option>
                            </select>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-3">⚠️ This request will be sent to admin for approval.</p>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-slate-100 rounded-xl font-semibold text-sm">Cancel</button>
                            <button onClick={handleAddChef} className="flex-1 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--color-primary-dark)] transition-colors">Submit Request</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chef Detail Drawer */}
            {selectedChef && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setSelectedChef(null)}>
                    <div className="w-full max-w-md bg-white h-full shadow-2xl animate-slide-in overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
                            <h3 className="text-lg font-bold">Chef Details</h3>
                            <button onClick={() => setSelectedChef(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center">
                                    <ChefHat className="w-8 h-8 text-slate-500" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold">{selectedChef.name}</h4>
                                    <p className="text-sm text-[var(--color-text-muted)]">{selectedChef.role}</p>
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${statusStyles[selectedChef.status].bg} ${statusStyles[selectedChef.status].text}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyles[selectedChef.status].dot}`} />
                                        {statusStyles[selectedChef.status].label}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[var(--color-bg-light)] rounded-xl p-4">
                                    <p className="text-xs text-[var(--color-text-muted)]">Meals Today</p>
                                    <p className="text-2xl font-bold">{selectedChef.mealsAssigned}</p>
                                </div>
                                <div className="bg-[var(--color-bg-light)] rounded-xl p-4">
                                    <p className="text-xs text-[var(--color-text-muted)]">Avg Prep Time</p>
                                    <p className="text-2xl font-bold">{selectedChef.avgPrepTime}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm"><span className="text-[var(--color-text-muted)]">Phone:</span> <span className="font-medium">{selectedChef.phone}</span></p>
                                <p className="text-sm"><span className="text-[var(--color-text-muted)]">Email:</span> <span className="font-medium">{selectedChef.email}</span></p>
                                <p className="text-sm"><span className="text-[var(--color-text-muted)]">Shift:</span> <span className="font-medium">{selectedChef.shift}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {successToast && (
                <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg animate-slide-in text-sm font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4" /> {successToast}
                </div>
            )}
        </div>
    );
}
