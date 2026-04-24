import { useState, useEffect } from "react";
import { PackagePlus, X } from "lucide-react";

const InventoryRequestModal = ({ isOpen, onClose, onSubmit, requestType, initialItemName, initialUnit }) => {
  const [itemName, setItemName] = useState("");
  const [unit, setUnit] = useState("");
  const [requestedQuantity, setRequestedQuantity] = useState("");
  const [chefNote, setChefNote] = useState("");

  // if the requestType is REFILL_STOCK, then it is a refill request
  // otherwise it is a new item request
  const isRefill = requestType === "REFILL_STOCK";

  // reset or pre-fill the form fields whenever the modal opens or the item(name/unit) changes
  // pre fill the hidden data if it's a refill request
  useEffect(() => {
    if (isOpen) {
      setItemName(initialItemName || "");
      setUnit(initialUnit || "");
      setRequestedQuantity("");
      setChefNote("");
    }
  }, [isOpen, initialItemName, initialUnit]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    //basic validation
    if (!itemName || !unit || !requestedQuantity) {
      alert("Please fill in all required fields!");
      return;
    }

    // create an object. it matches exactly what backend CreateStockRefillRequestDTO expects!
    const requestData = {
      itemName: itemName,
      unit: unit,
      requestedQuantity: parseFloat(requestedQuantity),
      chefNote: chefNote,
      requestType: requestType
    };

    // send the validated and formatted data back to the parent component for API submission
    onSubmit(requestData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-4xl shadow-2xl p-8 border border-gray-100">
        
        {/* header icon and close button */}
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
            <PackagePlus size={24} />
          </div>
          {/* trigger the close function from parent to hide the modal when 'X' is clicked */}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* dynamic title based on request type */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-left">
          {isRefill ? `Request Refill: ${initialItemName}` : "Request New Item"}
        </h3>
        <p className="text-gray-400 text-sm mb-6 text-left">
          {isRefill 
            ? `Enter the quantity needed for ${initialItemName} in ${initialUnit}.` 
            : "Submit a request to add a brand new item to the inventory system."}
        </p>

        {/* form fields */}
        <div className="flex flex-col gap-4 mb-8">
          
          {/* only show these if it is a new item */}
          {!isRefill && (
            <>
              <input
                type="text"
                placeholder="Item Name (e.g. Garlic)"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <input
                type="text"
                placeholder="Unit (e.g. kg, Liters, Pcs)"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </>
          )}

          {/* always show quantity and note */}
          <input
            type="number" //when we use the type as number it will display arrows to increase/decrease but it does not validate the input
            placeholder={`Requested Quantity ${isRefill ? `(${initialUnit})` : ""}`}
            value={requestedQuantity}
            onChange={(e) => setRequestedQuantity(e.target.value)}
            className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
          />

          <textarea
            placeholder="Add a reason or note (optional)..."
            value={chefNote}
            onChange={(e) => setChefNote(e.target.value)}
            rows="3"
            className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
          />
        </div>

        {/* action buttons */}
        <div className="flex gap-4">
          {/* trigger the close function from parent to hide the modal when 'Cancel' is clicked */}
          <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-gray-400 hover:bg-gray-50 rounded-2xl transition-all">
            Cancel
          </button>
          {/* send the validated and formatted data back to the parent component for processing */}
          <button
            onClick={handleSubmit}
            className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all"
          >
            Send Request
          </button>
        </div>

      </div>
    </div>
  );
};

export default InventoryRequestModal;
