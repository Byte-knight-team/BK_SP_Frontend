import { useState, useEffect } from "react";
import { UserPlus, X } from "lucide-react";
import { getAvailableChefsAPI } from "../../../apis/kitchen/chefs";

const AssignChefModal = ({ isOpen, onClose, onAssign, mealName }) => {
  const [selectedChefId, setSelectedChefId] = useState("");

  // State to hold the real chefs from the database
  const [availableChefs, setAvailableChefs] = useState([]);

  // Fetch available chefs from the backend whenever the modal is opened
  useEffect(() => {
    const fetchChefs = async () => {
      if (isOpen) {
        const { data, error } = await getAvailableChefsAPI();
        if (data) {
          setAvailableChefs(data);
        } else {
          console.error("Failed to load chefs", error);
        }
      }
    };
    fetchChefs();
  }, [isOpen]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-4xl shadow-2xl p-8 border border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
            <UserPlus size={24} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 text-left">Assign Chef</h3>
        <p className="text-gray-400 text-sm mb-6 text-left">Select a chef for <span className="text-gray-900 font-bold">"{mealName}"</span></p>

        <select 
          className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 outline-none  mb-8"
          value={selectedChefId} // value = chef.id in each option tag
          onChange={(e) => setSelectedChefId(e.target.value)} //that value set as the selectedChefId state
        >
          {/* default option */}
          {availableChefs.length > 0 ? (
            <option value="">Select a chef</option>
          ) : (
            <option value="">No chefs available</option>
          )}
          {/* map all available chefs. Loop through the chefs array to create dropdown options */}
          {availableChefs.map((chef) => (
            <option key={chef.staffId} value={chef.staffId}>
              {chef.chefName} - ({chef.workStatus})
            </option>
          ))}
        </select>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-gray-400">Cancel</button>
          <button 
            // Trigger the assignment (save to backend) and close the modal simultaneously
            onClick={() => { onAssign(selectedChefId); onClose(); }} 
            className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignChefModal;
