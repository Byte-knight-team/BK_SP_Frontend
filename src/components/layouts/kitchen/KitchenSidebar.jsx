import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  ChefHat, 
  Package, 
  BookOpen, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import craveHouseLogo from '../../../assets/Crave House logo.png';

export default function KitchenSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isExactActive = (path) => {
    if (location.pathname === path && !location.search) return true;
    return false;
  };

  const getParentLinkClass = (path) => {
    const active = isExactActive(path);
    return active
      ? `flex items-center ${isCollapsed ? 'justify-center border border-orange-200' : 'gap-3 px-4'} py-3.5 bg-orange-500 text-white rounded-2xl font-medium shadow-md shadow-orange-500/20`
      : `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-2xl font-medium transition-colors`;
  };

  // Helper to render badges gracefully depending on active state
  const renderBadge = (count, path) => {
    if (isCollapsed) return null;
    const active = isExactActive(path);
    return (
      <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-white text-orange-500' : 'bg-orange-100 text-orange-600'}`}>
        {count}
      </span>
    );
  };

  return (
    <aside className={`${isCollapsed ? 'w-[90px]' : 'w-[260px]'} bg-[#FAFAFA] flex flex-col justify-between border-r border-gray-100 p-4 transition-all duration-300 flex-shrink-0 z-10 h-screen overflow-y-auto overflow-x-hidden custom-scrollbar relative`}>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white border border-gray-200 shadow-sm rounded-full p-1 z-20 text-gray-500 hover:text-gray-800"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div>
        {/* Logo */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-2'} mb-10 mt-2`}>
          <img src={craveHouseLogo} alt="Crave House Logo" className="w-10 h-10 object-contain flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-bold text-[19px] tracking-tight whitespace-nowrap">
              <span className="text-black">CRAVE</span>
              <span className="text-orange-500">HOUSE</span>
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          
          {!isCollapsed && <div className="text-[10px] tracking-widest uppercase text-gray-400 px-4 pt-2 pb-1">Overview</div>}
          
          <Link to="/kitchen" className={getParentLinkClass('/kitchen')}>
            <LayoutDashboard size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm border-none">Dashboard</span>}
            {!isCollapsed && isExactActive('/kitchen') && <div className="w-1.5 h-1.5 bg-white rounded-full ml-auto"></div>}
          </Link>
          
          {!isCollapsed && <div className="text-[10px] tracking-widest uppercase text-gray-400 px-4 pt-4 pb-1">Operations</div>}

          <Link to="/kitchen/orders" className={getParentLinkClass('/kitchen/orders')}>
            <ClipboardList size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Orders</span>}
            {renderBadge(3, '/kitchen/orders')}
          </Link>

          <Link to="/kitchen/chefs" className={getParentLinkClass('/kitchen/chefs')}>
            <ChefHat size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Chefs</span>}
            {!isCollapsed && isExactActive('/kitchen/chefs') && <div className="w-1.5 h-1.5 bg-white rounded-full ml-auto"></div>}
          </Link>

          <Link to="/kitchen/inventory" className={getParentLinkClass('/kitchen/inventory')}>
            <Package size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Inventory</span>}
            {renderBadge(5, '/kitchen/inventory')}
          </Link>

          {!isCollapsed && <div className="text-[10px] tracking-widest uppercase text-gray-400 px-4 pt-4 pb-1">Kitchen</div>}

          <Link to="/kitchen/menu" className={getParentLinkClass('/kitchen/menu')}>
            <BookOpen size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Menu & Recipes</span>}
            {!isCollapsed && isExactActive('/kitchen/menu') && <div className="w-1.5 h-1.5 bg-white rounded-full ml-auto"></div>}
          </Link>

          <Link to="/kitchen/approvals" className={getParentLinkClass('/kitchen/approvals')}>
            <ShieldCheck size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Approvals</span>}
            {renderBadge(2, '/kitchen/approvals')}
          </Link>

          {!isCollapsed && <div className="text-[10px] tracking-widest uppercase text-gray-400 px-4 pt-4 pb-1">System</div>}

          <Link to="/kitchen/settings" className={getParentLinkClass('/kitchen/settings')}>
            <Settings size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Settings</span>}
            {!isCollapsed && isExactActive('/kitchen/settings') && <div className="w-1.5 h-1.5 bg-white rounded-full ml-auto"></div>}
          </Link>
        </nav>
      </div>

      {/* User Card */}
      <div className="mt-8">
        <div className={`bg-orange-50 rounded-2xl border border-orange-100 ${isCollapsed ? 'p-2 justify-center' : 'p-3'} flex items-center gap-3 mb-4`}>
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-500 flex-shrink-0">
            IU
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-gray-900 truncate">Isuru Udara</div>
              <div className="text-[10px] font-bold text-orange-500 tracking-wider">CHIEF CHEF</div>
            </div>
          )}
        </div>
        <button className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2'} text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors w-full`}>
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
      
    </aside>
  );
}