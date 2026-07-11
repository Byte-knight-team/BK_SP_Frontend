import craveHouseLogo from "../../assets/Crave House logo.png";
import { Link, useLocation } from "react-router-dom";
import { RiLogoutBoxRLine } from "@remixicon/react";

/*
  AppSidebar

  Purpose:
  - Common sidebar UI used by all staff role panels.
  - Shows logo, branch name, navigation links, profile card, and logout button.

  Important:
  - This component does not decide the logged-in user.
  - Role sidebars pass userName, branchName, roleLabel, and profilePath into this component.
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
    Checks whether a sidebar navigation item is active.

    If item.exact is true:
    - route must match exactly.

    Otherwise:
    - route can start with item.path.
    - Example: /staff/staff/create should keep Staff Management active.
  */
  const isActive = (item) => {
    const [itemPath, itemSearch] = (item.path || "").split("?");
    
    let matchPath = false;
    if (item.exact) {
      matchPath = location.pathname === itemPath;
    } else {
      matchPath = location.pathname.startsWith(itemPath);
    }

    if (itemSearch) {
      const currentParams = new URLSearchParams(location.search);
      const itemParams = new URLSearchParams(itemSearch);
      for (const [key, value] of itemParams.entries()) {
        if (currentParams.get(key) !== value) return false;
      }
      return matchPath;
    }

    if (item.exactSearch) {
      return matchPath && !location.search;
    }

    return matchPath;
  };

  /*
    Checks whether the bottom profile card is active.
  */
  const isProfileActive = location.pathname === profilePath;

  /*
    Display name cleanup.

    Because JWT currently does not contain real username/fullName for every role,
    some sidebars may pass email as userName.

    We do not want the sidebar profile card to show full email.
    So if userName is an email, show only the part before @.

    Example:
    o1xohxevet@yzcalo.com -> o1xohxevet
  */
  const displayUserName =
    userName && userName.includes("@") ? userName.split("@")[0] : userName;

  return (
    <aside className="w-[270px] bg-white border-r border-gray-100 flex flex-col justify-between h-screen">
      <div>
        {/* Logo and branch section */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src={craveHouseLogo}
              alt="Crave House Logo"
              className="h-10 w-10 object-contain"
            />

            <div>
              <div className="text-lg font-bold tracking-tight">
                <span className="text-black">CRAVE</span>
                <span className="text-orange-500">HOUSE</span>
              </div>

              <div className="text-xs text-gray-500">
                {branchName || "Global Access"}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar navigation links */}
        <nav className="px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            // The parent is active if it matches the criteria (note: we check subItems if needed)
            const active = isActive(item);

            return (
              <div key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    active && !item.subItems
                      ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                      : active && item.subItems
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  <Icon size={20} />

                  <span className="text-sm font-medium flex-1">
                    {item.label}
                  </span>

                  {active && !item.subItems && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </Link>

                {item.subItems && (
                  <div className="ml-9 mt-1 space-y-1">
                    {item.subItems.map((sub) => {
                      const subActive = isActive(sub);
                      return (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className={`flex items-center justify-between px-4 py-2 text-sm rounded-xl transition-all ${
                            subActive
                              ? "text-orange-600 bg-orange-100 font-medium"
                              : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
                          }`}
                        >
                          <span>{sub.label}</span>
                          {sub.count !== undefined && (
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${subActive ? 'bg-orange-200 text-orange-700' : 'bg-gray-200 text-gray-600'}`}>
                              {sub.count}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom profile and logout section */}
      <div className="p-4 border-t border-gray-100">
        <div
          className={`rounded-2xl px-4 py-3 flex items-center justify-between gap-3 ${
            isProfileActive
              ? "bg-orange-500 text-white shadow-md shadow-orange-200"
              : "bg-gray-50 text-gray-900"
          }`}
        >
          {/* Profile link */}
          <Link to={profilePath} className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate">{displayUserName}</div>

            <div
              className={`text-[10px] font-bold tracking-wider ${
                isProfileActive ? "text-white/90" : "text-orange-500"
              }`}
            >
              {roleLabel}
            </div>
          </Link>

          {/* Logout button */}
          <button
            type="button"
            onClick={onLogout}
            className={`shrink-0 ${
              isProfileActive ? "text-white" : "text-gray-500 hover:text-red-500"
            }`}
            title="Logout"
            aria-label="Logout"
          >
            <RiLogoutBoxRLine size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}