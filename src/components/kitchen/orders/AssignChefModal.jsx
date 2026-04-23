import { useState } from "react";
import { UserPlus, X } from "lucide-react";

const AssignChefModal = ({ isOpen, onClose, onAssign, mealName }) => {
  const [selectedChef, setSelectedChef] = useState("");
  const chefs = ["Chef Kamal", "Chef Amara", "Chef Nimal"]; // Mock data

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
          className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20 mb-8"
          value={selectedChef}
          onChange={(e) => setSelectedChef(e.target.value)}
        >
          <option value="">Select a chef</option>
          {chefs.map(chef => <option key={chef} value={chef}>{chef}</option>)}
        </select>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-gray-400">Cancel</button>
          <button 
            onClick={() => { onAssign(selectedChef); onClose(); }}
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
