import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  LogOut,
  User,
  Clock,
  Timer,
  X,
  Check,
  ChefHat,
  Package,
  MapPin
} from 'lucide-react';

import { mockOrders, availableChefs } from '../../services/mockData';

export default function KitchenDashboard() {
  const navigate = useNavigate();
  // Initialize state with imported mockOrders
  const [orders, setOrders] = useState(mockOrders);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedChef, setSelectedChef] = useState(null);

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  const filteredOrders = orders.filter(o => o.status === activeTab);

  const handleOrderClick = (order) => {
    if (order.status === 'pending') {
      // Navigate to order details page for pending orders
      navigate(`/kitchen/order/${order.id}`);
    } else {
      // Show modal for preparing/completed orders
      setSelectedOrder(order);
    }
  };

  const handleAssignChef = () => {
    setShowAssignModal(true);
  };

  const confirmAssignChef = () => {
    if (selectedOrder && selectedChef) {
      setOrders(orders.map(order =>
        order.id === selectedOrder.id
          ? { ...order, status: 'preparing', assignedChef: selectedChef.name }
          : order
      ));
      setSelectedOrder({ ...selectedOrder, status: 'preparing', assignedChef: selectedChef.name });
      setShowAssignModal(false);
      setSelectedChef(null);
    }
  };

  const handleMarkReady = (orderId) => {
    setOrders(orders.map(order =>
      order.id === orderId
        ? { ...order, status: 'completed' }
        : order
    ));
    setSelectedOrder(null);
  };

  const tabs = [
    { key: 'pending', label: 'Pending Orders', count: pendingCount },
    { key: 'preparing', label: 'Preparing', count: preparingCount },
    { key: 'completed', label: 'Completed', count: completedCount },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <img src="/logo.png" alt="CraveHouse" className="h-14 w-14 rounded-xl shadow-sm" />
              <div>
                <h1 className="text-xl font-bold text-slate-800">Crave House</h1>
                <p className="text-sm text-slate-500">Kitchen Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/kitchen/chef-management')}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all"
              >
                <Users className="w-4 h-4" />
                <span>Manage Chefs</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
              <div className="ml-2 w-10 h-10 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Page Title */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-800">Order Management</h2>
            <p className="text-slate-500 mt-1">Click on an order to view details and manage</p>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => navigate('/kitchen/chef-management')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
            >
              <Users className="w-4 h-4" />
              <span>Manage Chefs</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
          <nav className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all ${activeTab === tab.key
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                <span>{tab.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                  }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                onClick={() => handleOrderClick(order)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
              >
                {/* Order Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={order.image}
                    alt="Food"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute top-3 left-3">
                    <span className={`text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full tracking-wider ${order.status === 'pending' ? 'bg-primary' :
                        order.status === 'preparing' ? 'bg-amber-500' :
                          'bg-emerald-500'
                      }`}>
                      {order.status === 'pending' ? 'Needs Assignment' :
                        order.status === 'preparing' ? 'In Progress' :
                          'Completed'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {order.tableNumber}
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-slate-800">Order #{order.id}</h3>
                    <span className="text-primary font-bold text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {order.time}
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {order.customerName}
                  </p>

                  {order.assignedChef && (
                    <p className="text-sm text-amber-600 font-semibold mb-3 flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg w-fit">
                      <ChefHat className="w-4 h-4" />
                      {order.assignedChef}
                    </p>
                  )}

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Package className="w-4 h-4" />
                      <span className="font-semibold">{order.items.length} Items</span>
                    </div>
                    <span className="text-xs text-slate-400">Click to view details</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-xl font-bold text-slate-700">No orders found</p>
            <p className="text-slate-500 mt-1">Orders will appear here when received</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Live
          </div>
          {/* Removed Avg. Prep Time */}
        </div>
      </footer>

      {/* Order Details Modal */}
      {selectedOrder && !showAssignModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Image */}
            <div className="relative h-48">
              <img
                src={selectedOrder.image}
                alt="Order"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Order #{selectedOrder.id}</h3>
                    <p className="text-white/80 flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      {selectedOrder.tableNumber} • {selectedOrder.customerName}
                    </p>
                  </div>
                  <span className={`text-white text-xs uppercase font-bold px-3 py-1.5 rounded-full ${selectedOrder.status === 'pending' ? 'bg-primary' :
                      selectedOrder.status === 'preparing' ? 'bg-amber-500' :
                        'bg-emerald-500'
                    }`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="flex-1 overflow-y-auto p-6">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Order Items</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-sm">
                        {item.quantity}x
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        {item.notes && (
                          <p className="text-xs text-slate-500 mt-0.5">Note: {item.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedOrder.assignedChef && (
                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-sm text-amber-800 font-semibold flex items-center gap-2">
                    <ChefHat className="w-4 h-4" />
                    Assigned to: {selectedOrder.assignedChef}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-slate-100 flex gap-3">
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={handleAssignChef}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                >
                  <ChefHat className="w-5 h-5" />
                  Assign Chef
                </button>
              )}
              {selectedOrder.status === 'preparing' && (
                <button
                  onClick={() => handleMarkReady(selectedOrder.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
                >
                  <Check className="w-5 h-5" />
                  Mark as Ready
                </button>
              )}
              {selectedOrder.status === 'completed' && (
                <div className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-50 text-emerald-700 rounded-xl font-semibold">
                  <Check className="w-5 h-5" />
                  Order Completed
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Chef Modal */}
      {showAssignModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowAssignModal(false);
            setSelectedChef(null);
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Assign Chef</h3>
              <p className="text-slate-500 mt-1">Select a chef for Order #{selectedOrder.id}</p>
            </div>

            {/* Chef List */}
            <div className="p-6 space-y-3">
              {availableChefs.map(chef => (
                <label
                  key={chef.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedChef?.id === chef.id
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="chef"
                    checked={selectedChef?.id === chef.id}
                    onChange={() => setSelectedChef(chef)}
                    className="sr-only"
                  />
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedChef?.id === chef.id ? 'bg-primary/10' : 'bg-slate-100'
                    }`}>
                    <ChefHat className={`w-6 h-6 ${selectedChef?.id === chef.id ? 'text-primary' : 'text-slate-500'
                      }`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${selectedChef?.id === chef.id ? 'text-primary' : 'text-slate-700'
                      }`}>{chef.name}</p>
                    <p className="text-sm text-slate-500">{chef.specialty}</p>
                  </div>
                  {selectedChef?.id === chef.id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </label>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedChef(null);
                }}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAssignChef}
                disabled={!selectedChef}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${selectedChef
                    ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
