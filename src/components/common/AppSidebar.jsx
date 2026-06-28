import { useState } from "react";
import craveHouseLogo from "../../assets/Crave House logo.png";
import { Link, useLocation } from "react-router-dom";
import { RiLogoutBoxRLine } from "@remixicon/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AppSidebar({
  navItems = [],
  branchName = "Global Access",
  userName = "User",
  roleLabel = "STAFF",
  profilePath = "/staff/profile",
  onLogout,
}) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const isProfileActive = location.pathname === profilePath;

  const displayUserName =
    userName && userName.includes("@") ? userName.split("@")[0] : userName;

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-67.5"
      } relative flex h-screen flex-col justify-between border-r border-gray-100 bg-white transition-all duration-300 ease-in-out`}
    >
      <div>
        {/* Logo and branch */}
        <div
          className={`flex items-center border-b border-gray-100 px-4 py-6 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <img
            src={craveHouseLogo}
            alt="Crave House Logo"
            className="h-10 w-10 shrink-0 object-contain"
          />
          {!collapsed && (
            <div>
              <div className="text-lg font-bold tracking-tight">
                <span className="text-black">CRAVE</span>
                <span className="text-orange-500">HOUSE</span>
              </div>
              <div className="text-xs text-gray-500">
                {branchName || "Global Access"}
              </div>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className={`space-y-1 py-4 ${collapsed ? "px-3" : "px-4"}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-2xl py-3 transition-all ${
                  collapsed ? "justify-center px-2" : "gap-3 px-4"
                } ${
                  active
                    ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                <Icon size={20} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium">
                      {item.label}
                    </span>
                    {active && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile + logout */}
      <div className="border-t border-gray-100 p-4">
        {collapsed ? (
          <div className="flex flex-col items-center gap-3">
            <Link to={profilePath} title={displayUserName}>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black transition-all ${
                  isProfileActive
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-500"
                }`}
              >
                {displayUserName?.[0]?.toUpperCase()}
              </div>
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="text-gray-400 transition-all hover:text-red-500"
              title="Logout"
              aria-label="Logout"
            >
              <RiLogoutBoxRLine size={18} />
            </button>
          </div>
        ) : (
          <div
            className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${
              isProfileActive
                ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                : "bg-gray-50 text-gray-900"
            }`}
          >
            <Link to={profilePath} className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold">{displayUserName}</div>
              <div
                className={`text-[10px] font-bold tracking-wider ${
                  isProfileActive ? "text-white/90" : "text-orange-500"
                }`}
              >
                {roleLabel}
              </div>
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className={`shrink-0 ${
                isProfileActive
                  ? "text-white"
                  : "text-gray-500 hover:text-red-500"
              }`}
              title="Logout"
              aria-label="Logout"
            >
              <RiLogoutBoxRLine size={18} />
            </button>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-3 flex w-full items-center justify-center rounded-2xl py-2 text-gray-400 transition-all hover:bg-orange-50 hover:text-orange-500"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
