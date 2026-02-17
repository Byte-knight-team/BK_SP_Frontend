import { useState } from "react";
import { updateOrder } from "../../api/qrOrdersApi";

export default function EditOrderModal({ order, onClose, onSave }) {
    const [items, setItems] = useState(
        order.items.map((item) => ({
            ...item,
            kitchenNotes: item.kitchenNotes || "",
        }))
    );
    const [saving, setSaving] = useState(false);

    const updateQuantity = (index, delta) => {
        setItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
            )
        );
    };

    const updateNotes = (index, notes) => {
        setItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, kitchenNotes: notes } : item
            )
        );
    };

    const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateOrder(order.id, {
                tableNumber: order.tableNumber,
                items: items.map((item) => ({
                    id: item.id,
                    itemName: item.itemName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    kitchenNotes: item.kitchenNotes || null,
                })),
            });
            onSave();
        } catch (err) {
            console.error("Error updating order:", err);
            alert("Failed to update order. Please try again.");
        } finally {
            setSaving(false);
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
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Edit Order #{order.id}</h2>
                            <p className="text-sm text-gray-400 mt-0.5">Modify items and kitchen notes below</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-red-400 hover:text-red-600 transition-colors text-xl font-bold"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {items.map((item, index) => (
                        <div key={item.id || index}>
                            {/* Item Row */}
                            <div className={`flex items-center gap-4 p-4 rounded-xl ${index === 0 ? "bg-orange-50 border border-orange-100" : "bg-white"}`}>
                                {/* Icon placeholder */}
                                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>

                                {/* Name & Price */}
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">{item.itemName}</p>
                                    <p className="text-sm text-gray-500">
                                        LKR {(item.unitPrice * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </p>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-0.5">
                                    <button
                                        onClick={() => updateQuantity(index, -1)}
                                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-colors"
                                    >
                                        −
                                    </button>
                                    <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold text-gray-800 border border-gray-200 rounded-lg bg-white">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(index, 1)}
                                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Kitchen Notes */}
                            <div className="mt-2 ml-1">
                                <div className="flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Add kitchen notes..."
                                        value={item.kitchenNotes}
                                        onChange={(e) => updateNotes(index, e.target.value)}
                                        className="flex-1 text-sm text-gray-600 placeholder-gray-300 bg-transparent border-b border-gray-200 focus:border-orange-400 focus:outline-none py-1"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 border-2 border-red-300 text-red-500 rounded-lg font-semibold text-sm hover:bg-red-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-500">
                            Total: <span className="font-bold text-gray-800">LKR {total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </p>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg font-semibold text-sm transition-colors"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
