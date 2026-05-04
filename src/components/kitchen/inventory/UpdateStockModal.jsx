import { useState, useEffect } from "react";
import { RefreshCcw, X } from "lucide-react";
import { toast } from "react-toastify";

const UpdateStockModal = ({ isOpen, onClose, onSubmit, itemName, unit, currentQuantity, maxStock }) => {
  const [newQuantity, setNewQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  // synchronize the input field with the current stock value
  // runs when the modal opens or if the backend data changes while the modal is active
  useEffect(() => {
    if (isOpen) {
      setNewQuantity(currentQuantity || "");
    }
  }, [isOpen, currentQuantity]);

  // if the modal is not open, return null to prevent rendering anything to the DOM
  if (!isOpen) return null;

  // validate if the input is not empty before submitting
  const handleSubmit = async () => {
    if (newQuantity === "") {
      toast.warning("Please enter a valid quantity!");
      return;
    }
    
    // convert input to a number
    const numericQuantity = parseFloat(newQuantity);

    // check if it's greater than max stock
    if (numericQuantity > maxStock) {
      toast.error(`Error: Quantity cannot exceed the maximum stock limit of ${maxStock} ${unit}!`);
      return;
    }
    
    // check for negative numbers
    if (numericQuantity < 0) {
      toast.error("Error: Quantity cannot be negative!");
      return;
    }
    
    // send the validated and formatted data back to the parent component(InventoryTable) for processing
    setLoading(true);
    await onSubmit({
      itemName: itemName,
      newQuantity: numericQuantity,
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-4xl border border-gray-100 bg-white p-8 shadow-2xl">
        {/* header icon and close button */}
        <div className="mb-6 flex items-start justify-between">
          <div className="rounded-2xl bg-blue-100 p-3 text-blue-600">
            <RefreshCcw size={24} />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <h3 className="mb-2 text-left text-xl font-bold text-gray-900">
          Update Stock: {itemName}
        </h3>
        <p className="mb-6 text-left text-sm text-gray-400">
          Enter the physical count of this item currently available in the kitchen.
        </p>

        {/* input field */}
        <div className="mb-8">
          <label className="mb-2 block text-xs font-bold text-gray-400 uppercase">
            New Quantity ({unit})
          </label>
          <input
            type="number"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            className="w-full rounded-2xl border-none bg-gray-50 p-4 text-lg font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* action buttons */}
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
            className="flex-1 rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 disabled:bg-gray-300"
          >
            {loading ? "Updating..." : "Update Stock"}
          </button>
        </div>
      </div>
    </div>
  );
};;

export default UpdateStockModal;
