import React, { useState } from 'react';
import { 
  Flame, LayoutDashboard, Users, Utensils, LayoutGrid, Settings, LogOut, ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevronRightSmall
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import craveHouseLogo from '../assets/Crave House logo.png';

export default function AdminSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(location.pathname.startsWith('/admin/menu'));

  const isExactActive = (path) => {
    // Treat base path and no query params as exactly active
    if (location.pathname === path && !location.search) return true;
    return false;
  };
  
  const isStartsWith = (path) => location.pathname.startsWith(path);

  const getParentLinkClass = (path, hasDropdown = false) => {
    const active = hasDropdown ? isStartsWith(path) : isExactActive(path);
    return active
      ? `flex items-center ${isCollapsed ? 'justify-center border border-orange-200' : 'gap-3 px-4'} py-3.5 bg-orange-500 text-white rounded-2xl font-medium shadow-md shadow-orange-500/20`
      : `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-2xl font-medium transition-colors`;
  };

  const getSubLinkClass = (path) => {
    const isActiveSubLink = location.pathname + location.search === path;
    return isActiveSubLink
      ? "flex items-center gap-3 px-4 py-2 text-orange-500 font-medium text-sm transition-colors relative"
      : "flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors relative";
  };

  return (
    <aside className={`${isCollapsed ? 'w-[90px]' : 'w-[260px]'} bg-[#FAFAFA] flex flex-col justify-between border-r border-gray-100 p-4 transition-all duration-300 flex-shrink-0 z-10 h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative`}>
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
          <Link to="/admin" className={getParentLinkClass('/admin')}>
            <LayoutDashboard size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm border-none">Dashboard</span>}
            {!isCollapsed && isExactActive('/admin') && <div className="w-1.5 h-1.5 bg-white rounded-full ml-auto"></div>}
          </Link>
          
          <Link to="/admin/users" className={getParentLinkClass('/admin/users')}>
            <Users size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">User Management</span>}
            {!isCollapsed && isExactActive('/admin/users') && <div className="w-1.5 h-1.5 bg-white rounded-full ml-auto"></div>}
          </Link>

          {/* Menu Management - Dropdown Parent */}
          <div className="flex flex-col">
            <Link 
              to="/admin/menu"
              onClick={(e) => {
                if (isCollapsed) {
                  setIsCollapsed(false);
                }
                setIsMenuDropdownOpen(!isMenuDropdownOpen);
              }}
              className={getParentLinkClass('/admin/menu', true) + " w-full text-left"}
            >
              <Utensils size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="text-sm flex-1">Menu Management</span>}
              {!isCollapsed && (
                isMenuDropdownOpen ? <ChevronDown size={16} /> : <ChevronRightSmall size={16} />
              )}
            </Link>
            
            {/* Dropdown Options */}
            {!isCollapsed && isMenuDropdownOpen && (
              <div className="mt-2 ml-4 flex flex-col gap-1 border-l-2 border-gray-100 pl-2">
                <Link to="/admin/menu?status=active" className={getSubLinkClass('/admin/menu?status=active')}>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></div>
                  Active
                </Link>
                <Link to="/admin/menu?status=out_of_stock" className={getSubLinkClass('/admin/menu?status=out_of_stock')}>
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1"></div>
                  Out of Stock
                </Link>
                <Link to="/admin/menu?status=draft" className={getSubLinkClass('/admin/menu?status=draft')}>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1"></div>
                  Draft
                </Link>
              </div>
            )}
          </div>

          <Link to="/admin/tables" className={getParentLinkClass('/admin/tables')}>
            <LayoutGrid size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Table Management</span>}
            {!isCollapsed && isExactActive('/admin/tables') && <div className="w-1.5 h-1.5 bg-white rounded-full ml-auto"></div>}
          </Link>

          <Link to="#" className={getParentLinkClass('/admin/settings')}>
            <Settings size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">System Settings</span>}
            {!isCollapsed && isExactActive('/admin/settings') && <div className="w-1.5 h-1.5 bg-white rounded-full ml-auto"></div>}
          </Link>
        </nav>
      </div>

      {/* User Card */}
      <div className="mt-8">
        <div className={`bg-gray-100/80 rounded-2xl ${isCollapsed ? 'p-2 justify-center' : 'p-3'} flex items-center gap-3 mb-4`}>
          <img src="https://ui-avatars.com/api/?name=Vibhath+Kalsara&background=E5E7EB&color=374151" alt="Vibhath Kalsara" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
          {!isCollapsed && (
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-gray-900 truncate">Vibhath Kalsara</div>
              <div className="text-[10px] font-bold text-orange-500 tracking-wider">ADMIN</div>
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
