import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, DollarSign, ChevronDown } from 'lucide-react';
import BrandLogo from '../components/Customer/BrandLogo';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Mock order data
  const orders = {
    active: [
      {
        id: '#ORD001',
        date: 'Today, 6:30 PM',
        status: 'preparing',
        items: [
          { name: 'Spicy Biryani', qty: 2, price: 450 },
          { name: 'Garlic Naan', qty: 1, price: 80 },
        ],
        subtotal: 980,
        tax: 118,
        delivery: 50,
        total: 1148,
        deliveryType: 'delivery',
        eta: '25 mins',
      },
      {
        id: '#ORD002',
        date: 'Today, 4:15 PM',
        status: 'out_for_delivery',
        items: [
          { name: 'Butter Chicken', qty: 1, price: 520 },
          { name: 'Rice', qty: 1, price: 120 },
        ],
        subtotal: 640,
        tax: 77,
        delivery: 50,
        total: 767,
        deliveryType: 'delivery',
        eta: '10 mins',
      },
    ],
    previous: [
      {
        id: '#ORD-2024-089',
        date: 'April 10, 2024 at 7:45 PM',
        status: 'delivered',
        items: [
          { name: 'Chicken Tikka Masala', qty: 1, price: 580 },
          { name: 'Basmati Rice', qty: 1, price: 120 },
          { name: 'Lassi', qty: 2, price: 120 },
        ],
        subtotal: 820,
        tax: 98,
        delivery: 50,
        total: 968,
        deliveryType: 'delivery',
        rating: 4.5,
      },
      {
        id: '#ORD-2024-088',
        date: 'April 8, 2024 at 1:30 PM',
        status: 'delivered',
        items: [
          { name: 'Paneer Butter Masala', qty: 1, price: 420 },
          { name: 'Garlic Naan', qty: 2, price: 160 },
        ],
        subtotal: 580,
        tax: 70,
        delivery: 0,
        total: 650,
        deliveryType: 'pickup',
        rating: 5,
      },
    ],
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-700', icon: Clock },
      out_for_delivery: { label: 'Out for Delivery', color: 'bg-amber-100 text-amber-700', icon: Truck },
      delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    };
    return statusConfig[status] || statusConfig.preparing;
  };

  const OrderCard = ({ order, isActive }) => {
    const config = getStatusBadge(order.status);
    const StatusIcon = config.icon;
    const isExpanded = expandedOrder === order.id;

    return (
      <div className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
        <div
          className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 cursor-pointer"
          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-bold text-slate-900">{order.id}</p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${config.color}`}>
                  <StatusIcon size={14} />
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-slate-500">{order.date}</p>
              {isActive && <p className="text-xs font-medium text-orange-600 mt-1">Est. arrival: {order.eta}</p>}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">LKR {order.total}</p>
              <ChevronDown
                size={18}
                className={`ml-auto text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-slate-200 p-4 space-y-4">
            {/* Items List */}
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 tracking-wide mb-2">Items</p>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-700">
                      {item.name} <span className="text-slate-500">×{item.qty}</span>
                    </span>
                    <span className="font-medium text-slate-900">LKR {item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>LKR {order.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax</span>
                <span>LKR {order.tax}</span>
              </div>
              {order.deliveryType === 'delivery' && (
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span>LKR {order.delivery}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 pt-1">
                <span>Total</span>
                <span>LKR {order.total}</span>
              </div>
            </div>

            {/* Order Details */}
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-slate-400" />
                <span className="text-slate-600">
                  {order.deliveryType === 'delivery' ? 'Delivery to your address' : 'Pickup'}
                </span>
              </div>
              {!isActive && order.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-slate-600">Rating:</span>
                  <span className="text-sm font-bold text-amber-500">★ {order.rating}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {isActive ? (
                <button className="flex-1 rounded-lg bg-orange-500 text-white text-sm font-medium py-2 transition-colors hover:bg-orange-600">
                  Track Order
                </button>
              ) : (
                <button className="flex-1 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium py-2 transition-colors hover:bg-slate-50">
                  Reorder
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const currentOrders = activeTab === 'active' ? orders.active : orders.previous;

  return (
    <div className="min-h-screen bg-[#f3f1ee] px-4 py-6">
      <div className="mx-auto w-full max-w-[700px]">
        {/* Header */}
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-700 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Menu
        </button>

        {/* Title Card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_14px_30px_rgba(15,23,42,0.12)] mb-6">
          <div className="bg-orange-500 px-6 py-8 text-center text-white flex flex-col items-center">
            <BrandLogo />
            <h1 className="mt-3 text-3xl font-bold">My Orders</h1>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'active'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Package size={16} />
                <span>Active</span>
                {orders.active.length > 0 && (
                  <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                    {orders.active.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('previous')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'previous'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle size={16} />
                <span>Previous</span>
                {orders.previous.length > 0 && (
                  <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                    {orders.previous.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {currentOrders.length > 0 ? (
            currentOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                isActive={activeTab === 'active'}
              />
            ))
          ) : (
            <div className="rounded-2xl bg-white p-12 text-center border border-slate-200">
              <Package size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="text-lg font-semibold text-slate-900 mb-2">
                {activeTab === 'active' ? 'No Active Orders' : 'No Previous Orders'}
              </p>
              <p className="text-sm text-slate-500">
                {activeTab === 'active'
                  ? 'You have no orders being prepared or delivered.'
                  : 'You haven\'t placed any orders yet.'}
              </p>
              {activeTab === 'previous' && (
                <button
                  onClick={() => navigate('/menu')}
                  className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                >
                  Start Ordering
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
