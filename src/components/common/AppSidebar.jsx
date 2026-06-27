import { useState } from "react";
import craveHouseLogo from "../../assets/Crave House logo.png";
import { Link, useLocation } from "react-router-dom";
import { RiUser3Line, RiLogoutBoxRLine } from "@remixicon/react";
import LogoutConfirmModal from "./LogoutConfirmModal";

/*
  AppSidebar
  - Common sidebar UI used by all staff role panels.
  - Shows logo, branch name, navigation links, profile card, and logout button.
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }

    return location.pathname.startsWith(item.path);
  };

  const isProfileActive = location.pathname === profilePath;

  const displayUserName =
    userName && userName.includes("@") ? userName.split("@")[0] : userName;

  const formattedRoleLabel = roleLabel.replace(/_/g, " ");

  const handleOpenLogoutConfirm = () => {
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);

    if (typeof onLogout === "function") {
      onLogout();
    }
  };

  return (
    <>
      <aside className="flex h-screen w-[270px] shrink-0 flex-col justify-between border-r border-gray-100 bg-white">
        <div className="min-h-0 flex-1">
          {/* Logo and branch section */}
          <div className="border-b border-gray-100 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50">
                <img
                  src={craveHouseLogo}
                  alt="Crave House Logo"
                  className="h-8 w-8 object-contain"
                />
              </div>

              <div className="min-w-0">
                <div className="text-[15px] font-black leading-tight tracking-tight">
                  <span className="text-black">CRAVE</span>
                  <span className="text-orange-500">HOUSE</span>
                </div>

                <div className="mt-0.5 truncate text-[11px] font-medium text-gray-500">
                  {branchName || "Global Access"}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar navigation links */}
          <nav className="custom-scrollbar max-h-[calc(100vh-190px)] space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all ${
                    active
                      ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      active
                        ? "bg-white/15 text-white"
                        : "text-gray-500 group-hover:bg-white group-hover:text-orange-600"
                    }`}
                  >
                    <Icon size={17} />
                  </span>

                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold leading-snug">
                    {item.label}
                  </span>

                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom profile and logout section */}
        <div className="border-t border-gray-100 p-3">
          <Link
            to={profilePath}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all ${
              isProfileActive
                ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                : "bg-gray-50 text-gray-900 hover:bg-orange-50 hover:text-orange-600"
            }`}
            aria-label="Open profile"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                isProfileActive
                  ? "bg-white/20 text-white"
                  : "bg-white text-orange-500 ring-1 ring-orange-100"
              }`}
            >
              <RiUser3Line size={17} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold leading-tight">
                {displayUserName}
              </span>

              <span
                className={`mt-0.5 block truncate text-[11px] font-bold uppercase tracking-wide ${
                  isProfileActive ? "text-white/90" : "text-gray-500"
                }`}
              >
                {formattedRoleLabel}
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={handleOpenLogoutConfirm}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-[13px] font-semibold text-red-600 transition-all hover:border-red-200 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200"
            title="Logout"
            aria-label="Logout"
          >
            <RiLogoutBoxRLine size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {showLogoutConfirm && (
        <LogoutConfirmModal
          onCancel={handleCancelLogout}
          onConfirm={handleConfirmLogout}
        />
      )}
    </>
  );
}