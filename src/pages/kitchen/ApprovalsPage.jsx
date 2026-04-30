import { useEffect, useState } from 'react';
import {
    approveMenuItemAPI,
    getPendingMenuItemsAPI,
    rejectMenuItemAPI,
} from '../../apis/admin/menu';

const ApprovalsPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rejectReasonById, setRejectReasonById] = useState({});
    const [busyById, setBusyById] = useState({});

    const loadPending = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getPendingMenuItemsAPI();
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message || 'Unable to load pending menu items.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPending();
    }, []);

    const setBusy = (id, value) => {
        setBusyById((prev) => ({ ...prev, [id]: value }));
    };

    const handleApprove = async (id) => {
        setBusy(id, true);
        setError('');
        try {
            await approveMenuItemAPI(id, {});
            setItems((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            setError(err?.message || 'Unable to approve item.');
        } finally {
            setBusy(id, false);
        }
    };

    const handleReject = async (id) => {
        const reason = (rejectReasonById[id] || '').trim();
        if (!reason) {
            setError('Rejection reason is required.');
            return;
        }

        setBusy(id, true);
        setError('');
        try {
            await rejectMenuItemAPI(id, reason);
            setItems((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            setError(err?.message || 'Unable to reject item.');
        } finally {
            setBusy(id, false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">Pending Menu Approvals</h1>

            {error && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <p className="text-sm text-gray-500">Loading pending items...</p>
            ) : items.length === 0 ? (
                <p className="text-sm text-gray-500">No pending menu items for your branch.</p>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => {
                        const isBusy = !!busyById[item.id];
                        return (
                            <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="mb-2 flex items-center justify-between">
                                    <h2 className="text-base font-semibold text-gray-900">{item.name}</h2>
                                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                                        PENDING
                                    </span>
                                </div>
                                <p className="mb-1 text-sm text-gray-600">Category: {item.categoryName || '-'}</p>
                                <p className="mb-1 text-sm text-gray-600">Subcategory: {item.subCategory || '-'}</p>
                                <p className="mb-1 text-sm text-gray-600">Price: LKR {item.price ?? '-'}</p>
                                <p className="mb-3 text-sm text-gray-600">Preparation: {item.preparationTime ?? '-'} min</p>

                                <textarea
                                    value={rejectReasonById[item.id] || ''}
                                    onChange={(e) =>
                                        setRejectReasonById((prev) => ({
                                            ...prev,
                                            [item.id]: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter rejection reason"
                                    rows={2}
                                    className="mb-3 w-full rounded-lg border border-gray-300 p-2 text-sm"
                                />

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        disabled={isBusy}
                                        onClick={() => handleApprove(item.id)}
                                        className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isBusy}
                                        onClick={() => handleReject(item.id)}
                                        className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ApprovalsPage;