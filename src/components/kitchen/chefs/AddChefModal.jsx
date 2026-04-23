import React, { useState } from "react";

const AddChefModal = ({ isOpen, onClose }) => {
  // 1. Form එකේ data තබා ගැනීමට State එකක් (React වලදී මේක අත්‍යවශ්‍යයි)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNo: "",
    specialization: "",
    note: "",
  });

  // Input එකක් වෙනස් වන විට data update කරන ආකාරය
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Modal එක වහලා තියෙනවා නම් මුකුත් පෙන්වන්නේ නැහැ
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md max-h-full">
        {/* Modal content - HTML වල තිබුණු class වෙනුවට className පාවිච්චි කර ඇත */}
        <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl p-6">
          
          {/* Modal header */}
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Request New Chef
            </h3>
            <button 
              onClick={onClose} // Modal එක වැසීම සඳහා React onClick පාවිච්චි කර ඇත
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal body */}
          <form className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                name="name"
                onChange={handleChange} // Data ලබා ගැනීමට handleChange සම්බන්ධ කර ඇත
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500" 
                placeholder="Ex: John Doe" 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  name="email"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl" 
                  placeholder="john@example.com" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact No</label>
                <input 
                  type="text" 
                  name="contactNo"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl" 
                  placeholder="077..." 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <select 
                name="specialization"
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white"
              >
                <option value="">Select Category</option>
                <option value="Indian">Indian</option>
                <option value="Chinese">Chinese</option>
                <option value="Pastry">Pastry</option>
                <option value="Italian">Italian</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea 
                name="note"
                onChange={handleChange}
                rows="3" 
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" 
                placeholder="Brief intro about the chef..."
              ></textarea>                    
            </div>

            {/* Modal footer */}
            <div className="flex items-center space-x-3 pt-4 border-t">
              <button 
                type="submit" 
                className="flex-1 bg-orange-500 text-white font-bold py-2 rounded-xl hover:bg-orange-600 transition-colors"
              >
                Send Request
              </button>
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-2 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddChefModal;
