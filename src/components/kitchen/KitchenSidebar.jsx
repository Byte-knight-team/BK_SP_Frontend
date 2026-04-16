import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
// Importing Remix Icons
import { 
  RiLayoutMasonryFill, 
  RiClipboardLine, 
  RiUserSettingsLine, 
  RiHandbagLine, 
  RiBookOpenLine, 
  RiShieldCheckLine, 
  RiSettings4Line, 
  RiLogoutBoxRLine,
  RiArrowLeftSLine,
  RiArrowRightSLine
} from '@remixicon/react';
import craveHouseLogo from '../../assets/Crave House logo.png';

export default function KitchenSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if the current route matches the path
  const isActive = (path) => location.pathname === path;

  // Helper function for dynamic class names
  const getLinkClass = (path) => {
    const active = isActive(path);
    return `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
        : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
    }`;
  };

  return (
    <aside className={`relative h-screen flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* --- COLLAPSE BUTTON --- */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 z-50"
      >
        {isCollapsed ? <RiArrowRightSLine size={18} /> : <RiArrowLeftSLine size={18} />}
      </button>

      {/* --- LOGO SECTION --- */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <img src={craveHouseLogo} alt="Logo" className="w-8 h-8 object-contain" />
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 leading-none text-sm">Chief Chef Panel</span>
            <span className="text-[10px] text-orange-600 font-bold uppercase tracking-tighter">Kitchen Operations</span>
          </div>
        )}
      </div>

      {/* --- NAVIGATION LINKS --- */}
      <nav className="flex-1 px-3 space-y-1 mt-4">
        <Link to="/kitchen" className={getLinkClass('/kitchen')}>
          <RiLayoutMasonryFill size={20} />
          {!isCollapsed && <span className="font-medium text-sm">Dashboard Overview</span>}
        </Link>

        <Link to="/kitchen/orders" className={getLinkClass('/kitchen/orders')}>
          <RiClipboardLine size={20} />
          {!isCollapsed && <span className="font-medium text-sm">Orders</span>}
        </Link>

        <Link to="/kitchen/chefs" className={getLinkClass('/kitchen/chefs')}>
          <RiUserSettingsLine size={20} />
          {!isCollapsed && <span className="font-medium text-sm">Chefs</span>}
        </Link>

        <Link to="/kitchen/inventory" className={getLinkClass('/kitchen/inventory')}>
          <RiHandbagLine size={20} />
          {!isCollapsed && <span className="font-medium text-sm">Inventory</span>}
        </Link>

        <Link to="/kitchen/menu" className={getLinkClass('/kitchen/menu')}>
          <RiBookOpenLine size={20} />
          {!isCollapsed && <span className="font-medium text-sm">Menu & Recipes</span>}
        </Link>

        <Link to="/kitchen/approvals" className={getLinkClass('/kitchen/approvals')}>
          <RiShieldCheckLine size={20} />
          {!isCollapsed && <span className="font-medium text-sm">Approvals</span>}
        </Link>
      </nav>

      {/* --- BOTTOM SECTION (Settings & Profile) --- */}
      <div className="p-4 border-t border-gray-50 space-y-4">
        <Link to="/kitchen/settings" className={getLinkClass('/kitchen/settings')}>
          <RiSettings4Line size={20} />
          {!isCollapsed && <span className="font-medium text-sm">Settings</span>}
        </Link>

        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 p-2 bg-gray-50 rounded-2xl'}`}>
          <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0">
            IU
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">Isuru Udara</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Chief Chef</p>
            </div>
          )}
          {!isCollapsed && <RiLogoutBoxRLine size={18} className="text-gray-400 hover:text-red-500 cursor-pointer" />}
        </div>
      </div>
    </aside>
  );
}