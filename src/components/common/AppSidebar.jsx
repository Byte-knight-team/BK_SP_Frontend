import craveHouseLogo from "../../assets/Crave House logo.png";
import { Link, useLocation } from "react-router-dom";
import { RiUser3Line, RiLogoutBoxRLine } from "@remixicon/react";

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

  return (
    <aside className="flex h-screen w-[192px] flex-col justify-between border-r border-gray-100 bg-white">
      <div>
        {/* Logo and branch section */}
        <div className="border-b border-gray-100 px-3 py-3">
          <div className="flex items-center gap-2.5">
            <img
              src={craveHouseLogo}
              alt="Crave House Logo"
              className="h-8 w-8 object-contain"
            />

            <div className="min-w-0">
              <div className="text-[15px] font-bold leading-tight tracking-tight">
                <span className="text-black">CRAVE</span>
                <span className="text-orange-500">HOUSE</span>
              </div>

              <div className="truncate text-[11px] text-gray-500">
                {branchName || "Global Access"}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar navigation links */}
        <nav className="space-y-1 px-2.5 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all ${
                  active
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                <Icon size={17} />

                <span className="flex-1 text-[13px] font-medium leading-snug">
                  {item.label}
                </span>

                {active && (
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
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
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              isProfileActive
                ? "bg-white/20 text-white"
                : "bg-white text-orange-500 ring-1 ring-orange-100"
            }`}
          >
            <RiUser3Line size={16} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold leading-tight">
              {displayUserName}
            </span>

            <span
              className={`block truncate text-[11px] font-bold uppercase tracking-wide ${
                isProfileActive ? "text-white/90" : "text-gray-500"
              }`}
            >
              {formattedRoleLabel}
            </span>
          </span>
        </Link>

        <button
          type="button"
          onClick={onLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-[13px] font-semibold text-red-600 transition-all hover:border-red-200 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200"
          title="Logout"
          aria-label="Logout"
        >
          <RiLogoutBoxRLine size={17} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}