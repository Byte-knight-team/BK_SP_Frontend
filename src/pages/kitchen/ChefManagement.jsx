import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  X, 
  User,
  ChefHat,
  Clock,
  Users
} from 'lucide-react';

const initialChefs = [
  { id: 1, name: 'Chef Suneera', avatar: null, status: 'available', specialty: 'Sri Lankan Cuisine', ordersToday: 12 },
  { id: 2, name: 'Chef Kamal', avatar: null, status: 'preparing', specialty: 'Chinese Cuisine', ordersToday: 8 },
  { id: 3, name: 'Chef Nimal', avatar: null, status: 'available', specialty: 'Western Cuisine', ordersToday: 15 },
  { id: 4, name: 'Chef Isuru', avatar: null, status: 'available', specialty: 'Fusion Cuisine', ordersToday: 7 },
  { id: 5, name: 'Chef Aravinda', avatar: null, status: 'available', specialty: 'Desserts', ordersToday: 5 },
];

const statusOptions = [
  { value: 'available', label: 'Available', description: 'Ready to receive new orders', color: 'bg-emerald-500', bgLight: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
  { value: 'preparing', label: 'Preparing', description: 'Currently working on an order', color: 'bg-amber-500', bgLight: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  { value: 'absent', label: 'Absent', description: 'Not available today', color: 'bg-slate-400', bgLight: 'bg-slate-50', textColor: 'text-slate-600', borderColor: 'border-slate-200' },
];

export default function ChefManagement() {
  const navigate = useNavigate();
  const [chefs, setChefs] = useState(initialChefs);
  const [editingChef, setEditingChef] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  const availableCount = chefs.filter(c => c.status === 'available').length;
  const preparingCount = chefs.filter(c => c.status === 'preparing').length;
  const absentCount = chefs.filter(c => c.status === 'absent').length;

  const handleEditChef = (chef) => {
    setEditingChef(chef);
    setSelectedStatus(chef.status);
  };

  const handleConfirm = () => {
    if (editingChef) {
      setChefs(chefs.map(chef => 
        chef.id === editingChef.id 
          ? { ...chef, status: selectedStatus }
          : chef
      ));
      setEditingChef(null);
      setSelectedStatus('');
    }
  };

  const handleCancel = () => {
    setEditingChef(null);
    setSelectedStatus('');
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <img src="/logo.png" alt="CraveHouse" className="h-14 w-14 rounded-xl shadow-sm" />
              <div>
                <h1 className="text-xl font-bold text-slate-800">Crave House</h1>
                <p className="text-sm text-slate-500">Chef Management</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/kitchen')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Available</p>
                <p className="text-4xl font-black text-emerald-600 mt-1">{availableCount}</p>
              </div>
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                <ChefHat className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">Ready to take orders</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Preparing</p>
                <p className="text-4xl font-black text-amber-600 mt-1">{preparingCount}</p>
              </div>
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">Currently cooking</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Chefs</p>
                <p className="text-4xl font-black text-slate-700 mt-1">{chefs.length}</p>
              </div>
              <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-slate-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">{absentCount} absent today</p>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Team Status</h2>
          <p className="text-slate-500 mt-1">Click on a chef to update their availability</p>
        </div>

        {/* Chef Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chefs.map(chef => {
            const statusInfo = getStatusInfo(chef.status);

            return (
              <div 
                key={chef.id}
                onClick={() => handleEditChef(chef)}
                className={`bg-white rounded-2xl border-2 p-5 flex items-center gap-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] ${statusInfo.borderColor}`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${statusInfo.bgLight}`}>
                  <User className={`w-7 h-7 ${statusInfo.textColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-slate-800 truncate">{chef.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{chef.specialty}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusInfo.bgLight} ${statusInfo.textColor}`}>
                    <span className={`w-2 h-2 rounded-full ${statusInfo.color}`}></span>
                    {statusInfo.label}
                  </span>
                  <span className="text-xs text-slate-400">{chef.ordersToday} orders today</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Updates
          </div>
          <p>Click on any chef card to update their status</p>
        </div>
      </footer>

      {/* Edit Status Modal */}
      {editingChef && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCancel}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-800">{editingChef.name}</h3>
                  <p className="text-slate-500">{editingChef.specialty}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-sm font-semibold text-slate-700 mb-4">Update Status</p>
              <div className="space-y-3">
                {statusOptions.map(option => (
                  <label 
                    key={option.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedStatus === option.value
                        ? `${option.borderColor} ${option.bgLight}`
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={selectedStatus === option.value}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="sr-only"
                    />
                    <span className={`w-4 h-4 rounded-full ${option.color}`}></span>
                    <div className="flex-1">
                      <span className={`font-semibold ${selectedStatus === option.value ? option.textColor : 'text-slate-700'}`}>
                        {option.label}
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
                    </div>
                    {selectedStatus === option.value && (
                      <Check className={`w-5 h-5 ${option.textColor}`} />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                <Check className="w-4 h-4" />
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
