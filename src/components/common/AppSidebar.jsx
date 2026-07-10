import { useState } from "react";
import craveHouseLogo from "../../assets/Crave House logo.png";
import { Link, useLocation } from "react-router-dom";
import {
  RiLogoutBoxRLine,
  RiUser3Line,
} from "@remixicon/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LogoutConfirmModal from "./LogoutConfirmModal";

export default function AppSidebar({
  navItems = [],
  branchName = 'Global Access',
  userName = 'User',
  roleLabel = 'STAFF',
  profilePath = '/staff/profile',
  onLogout,
}) {
  const location = useLocation()

  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /*
    Checks whether a navigation item
    matches the current route.
  */
  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path
    }

    return location.pathname.startsWith(item.path)
  }

  /*
    Clean displayed username.

    Example:
    john@gmail.com -> john
  */
  const displayUserName =
    userName && userName.includes("@")
      ? userName.split("@")[0]
      : userName;

  /*
    Example:
    SUPER_ADMIN -> SUPER ADMIN
  */
  const formattedRoleLabel = roleLabel.replace(/_/g, " ");

  /*
    Confirms logout and calls the logout
    function supplied by the parent layout.
  */
  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);

    if (typeof onLogout === "function") {
      onLogout();
    }
  };

  return (
    <>
      <aside
        className={`${collapsed ? "w-20" : "w-67.5"
          } relative z-40 flex h-screen flex-col justify-between border-r border-gray-100 bg-white transition-all duration-300 ease-in-out`}
      >
        {/* Top area */}
        <div>
          {/* Logo, branch and collapse controls */}
          <div
            className={`flex items-center border-b border-gray-100 px-4 py-5 ${collapsed ? "flex-col gap-3" : "gap-3"
              }`}
          >
            {/* Expanded sidebar button */}
            {collapsed && (
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all duration-200 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-500"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ChevronRight size={21} />
              </button>
            )}

            {/* Logo */}
            <img
              src={craveHouseLogo}
              alt="Crave House Logo"
              className="h-10 w-10 shrink-0 object-contain"
            />

            {/* Expanded header content */}
            {!collapsed && (
              <>
                <div className="min-w-0">
                  <div className="text-lg font-bold tracking-tight">
                    <span className="text-black">CRAVE</span>
                    <span className="text-orange-500">HOUSE</span>
                  </div>

                  <div className="truncate text-xs text-gray-500">
                    {branchName || "Global Access"}
                  </div>
                </div>

                {/* Collapse sidebar button */}
                <button
                  type="button"
                  onClick={() => setCollapsed(true)}
                  className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 transition-all duration-200 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-500"
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft size={20} />
                </button>
              </>
            )}
          </div>

          {/* Navigation */}
          <nav
            className={`space-y-1 py-4 ${collapsed ? "px-3" : "px-4"
              }`}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center rounded-2xl py-3 transition-all ${collapsed
                      ? "justify-center px-2"
                      : "gap-3 px-4"
                    } ${active
                      ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                >
                  {/* Navigation icon */}
                  <Icon size={20} />

                  {/* Expanded label */}
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

                  {/* Collapsed floating label */}
                  {collapsed && (
                    <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile + logout */}
        <div className="border-t border-gray-100 p-4">
          {collapsed ? (
            /*
              Collapsed sidebar:
              - Profile icon
              - Logout icon
              - Floating labels on hover
            */
            <div className="flex flex-col items-center gap-3">
              {/* Collapsed profile */}
              <Link
                to={profilePath}
                className="group relative flex h-10 w-10 items-center justify-center"
                aria-label="Open profile"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-orange-500 transition-all duration-200 hover:border-orange-300 hover:bg-orange-50">
                  <RiUser3Line size={18} />
                </div>

                {/* Profile floating label */}
                <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                  Profile
                </div>
              </Link>

              {/* Collapsed logout */}
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500"
                aria-label="Logout"
              >
                <RiLogoutBoxRLine size={18} />

                {/* Logout floating label */}
                <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                  Logout
                </div>
              </button>
            </div>
          ) : (
            /*
              Expanded sidebar:
              - Profile card
              - Separate logout button
            */
            <div className="space-y-3">
              {/* Profile card */}
              <Link
                to={profilePath}
                className="group flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 transition-all duration-200 hover:border-orange-300 hover:bg-orange-50"
              >
                {/* Profile icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-orange-500 shadow-sm transition-all duration-200 group-hover:border-orange-200">
                  <RiUser3Line size={19} />
                </div>

                {/* User details */}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-gray-900 transition-colors duration-200 group-hover:text-orange-600">
                    {displayUserName}
                  </div>

                  <div className="mt-0.5 text-[10px] font-semibold tracking-wide text-gray-500 transition-colors duration-200 group-hover:text-orange-500">
                    {formattedRoleLabel}
                  </div>
                </div>
              </Link>

              {/* Logout button */}
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-[13px] font-semibold text-red-600 transition-all hover:border-red-200 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200"
                title="Logout"
                aria-label="Logout"
              >
                <RiLogoutBoxRLine size={17} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <LogoutConfirmModal
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={handleConfirmLogout}
        />
      )}
    </>
  );
}
