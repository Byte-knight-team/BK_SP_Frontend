import { useState, useEffect } from "react";
import { Target, X } from "lucide-react";
import { toast } from "react-toastify";

const UpdateDailyRequiredStockModal = ({ isOpen, onClose, onSubmit, itemName, unit, currentDailyRequiredStock }) => {
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewValue(currentDailyRequiredStock ?? "");
    }
  }, [isOpen, currentDailyRequiredStock]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (newValue === "") {
      toast.warning("Please enter a valid amount!");
      return;
    }

    const numericValue = parseFloat(newValue);

    if (numericValue < 0) {
      toast.error("Error: Daily required stock cannot be negative!");
      return;
    }

    setLoading(true);
    await onSubmit({
      itemName: itemName,
      newDailyRequiredStock: numericValue,
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-4xl border border-gray-100 bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
            <Target size={24} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <h3 className="mb-2 text-left text-xl font-bold text-gray-900">
          Daily Required Stock: {itemName}
        </h3>
        <p className="mb-6 text-left text-sm text-gray-400">
          The minimum amount of this item needed on hand to run a full day of kitchen operations.
        </p>

        <div className="mb-8">
          <label className="mb-2 block text-xs font-bold text-gray-400 uppercase">
            New Daily Required Amount ({unit})
          </label>
          <input
            type="number"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="w-full rounded-2xl border-none bg-gray-50 p-4 text-lg font-bold text-gray-900 outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl py-4 text-sm font-bold text-gray-400 transition-all hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 rounded-2xl ${loading ? "cursor-not-allowed" : "cursor-pointer"} bg-orange-600 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-orange-700 disabled:bg-gray-300`}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateDailyRequiredStockModal;
