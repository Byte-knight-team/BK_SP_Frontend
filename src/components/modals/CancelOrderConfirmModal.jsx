import { useState } from "react";
import { cancelOrder } from "../../api/qrOrdersApi";

export default function CancelOrderConfirmModal({ order, onClose, onCancelled }) {
    const [reason, setReason] = useState("");
    const [cancelling, setCancelling] = useState(false);

    const reasons = [
        "Customer requested cancellation",
        "Out of stock items",
        "Kitchen too busy",
        "Duplicate order",
        "Payment issue",
        "Other",
    ];

    const handleCancel = async () => {
        try {
            setCancelling(true);
            await cancelOrder(order.id, reason || "No reason provided");
            onCancelled();
        } catch (err) {
            console.error("Error cancelling order:", err);
            alert("Failed to cancel order. Please try again.");
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
                {/* Warning Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 text-center">
                    Cancel Order #{order.id}?
                </h2>

                {/* Description */}
                <p className="text-sm text-gray-500 text-center mt-2">
                    This will permanently void the order and release{" "}
                    <span className="font-bold text-gray-700">{order.tableNumber}</span>. This action cannot be undone.
                </p>

                {/* Reason Dropdown */}
                <div className="mt-6">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                        Reason for cancellation
                    </label>
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 appearance-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.75rem center",
                            backgroundSize: "1.25rem",
                        }}
                    >
                        <option value="">Select a reason...</option>
                        {reasons.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg font-semibold text-sm transition-colors"
                    >
                        {cancelling ? "Cancelling..." : "Yes, Cancel Order"}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
                    >
                        No, Keep Order
                    </button>
                </div>
            </div>
        </div>
    );
}
