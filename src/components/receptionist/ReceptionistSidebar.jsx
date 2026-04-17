import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
// Importing Remix Icons
import {
  RiLayoutMasonryFill,
  RiClipboardLine,
  RiTableLine,
  RiSettings4Line,
  RiLogoutBoxRLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "@remixicon/react";
import craveHouseLogo from "../../assets/Crave House logo.png";

const ReceptionistSidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if the current route matches the path
  const isActive = (path) => location.pathname === path;

  // Helper function for dynamic class names
  const getLinkClass = (path) => {
    const active = isActive(path);
    return `flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-4"} py-3 rounded-xl transition-all duration-200 ${
      active
        ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
        : "text-gray-500 hover:bg-orange-50 hover:text-orange-600"
    }`;
  };

  return (
    <aside
      className={`relative flex h-screen flex-col border-r border-gray-100 bg-white transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}
    >
      {/* --- COLLAPSE BUTTON --- */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-10 -right-3 z-50 rounded-full border border-gray-200 bg-white p-1 shadow-sm hover:bg-gray-50"
      >
        {isCollapsed ? <RiArrowRightSLine size={18} /> : <RiArrowLeftSLine size={18} />}
      </button>

      {/* --- LOGO SECTION --- */}
      <div
        className={`flex items-center p-6 ${isCollapsed ? "justify-center" : "gap-3"}`}
      >
        <img
          src={craveHouseLogo}
          alt="Logo"
          className="h-8 w-8 object-contain"
        />
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-sm leading-none font-bold text-gray-800">
              Receptionist Panel
            </span>
            <span className="text-[10px] font-bold tracking-tighter text-orange-600 uppercase">
              Front Desk Operations
            </span>
          </div>
        )}
      </div>

      {/* --- NAVIGATION LINKS --- */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        <Link to="/receptionist" className={getLinkClass("/receptionist")}>
          <RiLayoutMasonryFill size={20} />
          {!isCollapsed && (
            <span className="text-sm font-medium">Dashboard Overview</span>
          )}
        </Link>

        <Link to="/receptionist/orders" className={getLinkClass("/receptionist/orders")}>
          <RiClipboardLine size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Orders</span>}
        </Link>

        <Link to="/receptionist/tables" className={getLinkClass("/receptionist/tables")}>
          <RiTableLine size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Table Management</span>}
        </Link>
      </nav>

      {/* --- BOTTOM SECTION (Settings & Profile) --- */}
      <div className="space-y-4 border-t border-gray-50 p-4">
        <Link
          to="/receptionist/settings"
          className={getLinkClass("/receptionist/settings")}
        >
          <RiSettings4Line size={20} />
          {!isCollapsed && (
            <span className="text-sm font-medium">Settings</span>
          )}
        </Link>

        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 rounded-2xl bg-gray-50 p-2"}`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-600 font-bold text-white">
            IU
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray-800">
                Isuru Udara
              </p>
              <p className="text-[10px] font-bold text-gray-500 uppercase">
                Receptionist
              </p>
            </div>
          )}
          {!isCollapsed && (
            <RiLogoutBoxRLine
              size={18}
              className="cursor-pointer text-gray-400 hover:text-red-500"
            />
          )}
        </div>
      </div>
    </aside>
  );
}

export default ReceptionistSidebar;
