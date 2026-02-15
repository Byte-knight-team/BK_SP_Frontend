import { useState } from 'react';
import {
    ShieldCheck,
    Check,
    X,
    ChefHat,
    BookOpen,
    AlertCircle,
} from 'lucide-react';
import { approvals as initialApprovals } from '../data/mockData';

const typeIcons = {
    'Add Chef': ChefHat,
    'Menu Change': BookOpen,
    'Recipe Change': BookOpen,
};

const badgeColors = {
    pending: 'bg-amber-50 text-amber-600',
    approved: 'bg-green-50 text-green-600',
    rejected: 'bg-red-50 text-red-600',
};

export default function Approvals() {
    const [list, setList] = useState(initialApprovals);
    const [activeTab, setActiveTab] = useState('pending');
    const [successToast, setSuccessToast] = useState('');

    const filtered = list.filter(a => a.status === activeTab);
    const pendingCount = list.filter(a => a.status === 'pending').length;

    const showToast = (msg) => {
        setSuccessToast(msg);
        setTimeout(() => setSuccessToast(''), 3000);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-[var(--color-primary)]" />
                    Pending Approvals
                </h1>
                <p className="text-sm text-[var(--color-text-muted)]">Items awaiting admin review and approval.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-[var(--color-border)] pb-3">
                {['pending', 'approved', 'rejected'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-sm font-semibold pb-1 border-b-2 -mb-[13px] capitalize transition-colors ${activeTab === tab ? 'text-[var(--color-primary)] border-[var(--color-primary)]' : 'text-[var(--color-text-muted)] border-transparent'
                            }`}
                    >
                        {tab}
                        {tab === 'pending' && pendingCount > 0 && (
                            <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="text-center py-16 text-[var(--color-text-muted)]">
                        <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p className="font-medium">No {activeTab} approvals</p>
                    </div>
                ) : (
                    filtered.map(item => {
                        const Icon = typeIcons[item.type] || AlertCircle;
                        return (
                            <div key={item.id} className="bg-white rounded-2xl border border-[var(--color-border)] p-5 flex items-start justify-between gap-4 hover:shadow-sm transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                                    </div>
                                    <div>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${badgeColors[item.status]}`}>
                                            {item.type}
                                        </span>
                                        <h3 className="text-sm font-bold text-[var(--color-text-main)] mt-1.5">{item.title}</h3>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.details}</p>
                                        <p className="text-xs text-[var(--color-text-light)] mt-1">Submitted {item.submittedAt}</p>
                                    </div>
                                </div>
                                {item.status === 'pending' && (
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => { setList(prev => prev.map(a => a.id === item.id ? { ...a, status: 'approved' } : a)); showToast('Approved!'); }}
                                            className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                                            title="Approve"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => { setList(prev => prev.map(a => a.id === item.id ? { ...a, status: 'rejected' } : a)); showToast('Rejected'); }}
                                            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                            title="Reject"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Toast */}
            {successToast && (
                <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg animate-slide-in text-sm font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4" /> {successToast}
                </div>
            )}
        </div>
    );
}
