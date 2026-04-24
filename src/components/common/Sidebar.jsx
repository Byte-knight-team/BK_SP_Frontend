import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { RiArrowLeftSLine, RiArrowRightSLine, RiLogoutBoxRLine } from "@remixicon/react";
import craveHouseLogo from "../../assets/Crave House logo.png";

const Sidebar = ({ topLinks, bottomLinks, panelTitle, user}) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path) => location.pathname === path;

  const getLinkClass = (path) => {
    const active = isActive(path);
    return `flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-4"} py-3 rounded-xl transition-all duration-200 ${
      active
        ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
        : "text-gray-500 hover:bg-orange-50 hover:text-orange-600"
    }`;
  };

  return (
    <aside className={`relative flex h-screen flex-col border-r border-gray-100 bg-white transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
      
      {/* collapse button */}
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute top-10 -right-3 z-50 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
        {isCollapsed ? <RiArrowRightSLine size={18} /> : <RiArrowLeftSLine size={18} />}
      </button>

      {/* logo section */}
      <div className={`flex items-center p-6 ${isCollapsed ? "justify-center" : "gap-3"}`}>
        <img src={craveHouseLogo} alt="Logo" className="h-8 w-8 object-contain" />
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800">{panelTitle}</span>
          </div>
        )}
      </div>

      {/* navigation links dynamic mapping (top links)*/}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {topLinks.map((link) => (
          <Link key={link.path} to={link.path} className={getLinkClass(link.path)}>
            <link.icon size={20} />
            {!isCollapsed && <span className="text-md font-medium">{link.label}</span>}
          </Link>
        ))}
      </nav>

      {/* bottom links */}
      {bottomLinks && (
        <div className="px-3 mb-4 space-y-1">
          {bottomLinks.map((link) => (
            <Link key={link.path} to={link.path} className={getLinkClass(link.path)}>
              <link.icon size={20} />
              {!isCollapsed && <span className="text-md font-medium">{link.label}</span>}
            </Link>
          ))}
        </div>
      )}

      {/* User Section */}
      <div className="border-t border-gray-50 p-4">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 rounded-2xl bg-gray-50 p-2"}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-600 font-bold text-white">
            {user.initials}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-md font-bold text-gray-800">{user.name}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase">{user.role}</p>
            </div>
          )}
          {!isCollapsed && <RiLogoutBoxRLine size={18} className="cursor-pointer text-gray-400 hover:text-red-500" />}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;