import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { RiLogoutBoxRLine } from "@remixicon/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import craveHouseLogo from "../../assets/Crave House logo.png";
import LogoutConfirmModal from "./LogoutConfirmModal";

/*
  AppSidebar

  Purpose:
  - Common sidebar UI used by all staff role panels.
  - Shows the Crave House logo and branch name.
  - Displays navigation links.
  - Displays the logged-in user's profile.
  - Opens a confirmation modal before logout.
  - Supports collapsing and expanding the sidebar.
*/
export default function AppSidebar({
  navItems = [],
  branchName = "Global Access",
  userName = "User",
  roleLabel = "STAFF",
  profilePath = "/staff/profile",
  onLogout,
}) {
  const location = useLocation();

  /*
    collapsed:
    - false = full sidebar
    - true = compact sidebar

    showLogoutConfirm:
    - controls the logout confirmation modal
  */
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /*
    Checks whether a navigation item matches
    the current browser route.
  */
  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }

    return location.pathname.startsWith(item.path);
  };

  /*
    Checks whether the profile page is currently active.
  */
  const isProfileActive = location.pathname === profilePath;

  /*
    If the username is an email address,
    only show the part before the @ symbol.
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
    Opens the logout confirmation modal.
  */
  const handleOpenLogoutConfirm = () => {
    setShowLogoutConfirm(true);
  };

  /*
    Closes the logout confirmation modal.
  */
  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  /*
    Confirms logout.

    First closes the modal.
    Then calls the logout function supplied by the parent.
  */
  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);

    if (typeof onLogout === "function") {
      onLogout();
    }
  };

  /*
    Toggles sidebar between expanded and collapsed mode.
  */
  const handleToggleSidebar = () => {
    setCollapsed((previousValue) => !previousValue);
  };

  return (
    <>
      <aside
        className={`${
          collapsed ? "w-20" : "w-67.5"
        } relative flex h-screen flex-col justify-between border-r border-gray-100 bg-white transition-all duration-300 ease-in-out`}
      >
        {/* Top section */}
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
              <div className="min-w-0">
                <div className="text-lg font-bold tracking-tight">
                  <span className="text-black">CRAVE</span>
                  <span className="text-orange-500">HOUSE</span>
                </div>

                <div className="truncate text-xs text-gray-500">
                  {branchName || "Global Access"}
                </div>
              </div>
            )}
          </div>

          {/* Navigation links */}
          <nav
            className={`space-y-1 py-4 ${
              collapsed ? "px-3" : "px-4"
            }`}
          >
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

        {/* Bottom section */}
        <div className="border-t border-gray-100 p-4">
          {/* Collapsed profile and logout */}
          {collapsed ? (
            <div className="flex flex-col items-center gap-3">
              <Link
                to={profilePath}
                title={displayUserName}
                aria-label="Open profile"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black transition-all ${
                    isProfileActive
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-500"
                  }`}
                >
                  {displayUserName?.[0]?.toUpperCase() || "U"}
                </div>
              </Link>

              <button
                type="button"
                onClick={handleOpenLogoutConfirm}
                className="text-gray-400 transition-all hover:text-red-500"
                title="Logout"
                aria-label="Logout"
              >
                <RiLogoutBoxRLine size={18} />
              </button>
            </div>
          ) : (
            /* Expanded profile and logout */
            <div
              className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${
                isProfileActive
                  ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                  : "bg-gray-50 text-gray-900"
              }`}
            >
              <Link
                to={profilePath}
                className="min-w-0 flex-1"
                aria-label="Open profile"
              >
                <div className="truncate text-sm font-bold">
                  {displayUserName}
                </div>

                <div
                  className={`text-[10px] font-bold tracking-wider ${
                    isProfileActive
                      ? "text-white/90"
                      : "text-orange-500"
                  }`}
                >
                  {formattedRoleLabel}
                </div>
              </Link>

              <button
                type="button"
                onClick={handleOpenLogoutConfirm}
                className={`shrink-0 transition-all ${
                  isProfileActive
                    ? "text-white hover:text-red-100"
                    : "text-gray-500 hover:text-red-500"
                }`}
                title="Logout"
                aria-label="Logout"
              >
                <RiLogoutBoxRLine size={18} />
              </button>
            </div>
          )}

          {/* Sidebar collapse / expand button */}
          <button
            type="button"
            onClick={handleToggleSidebar}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[13px] font-semibold text-gray-600 transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={17} />
            ) : (
              <ChevronLeft size={17} />
            )}

            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <LogoutConfirmModal
          onCancel={handleCancelLogout}
          onConfirm={handleConfirmLogout}
        />
      )}
    </>
  );
}