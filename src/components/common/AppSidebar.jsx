import craveHouseLogo from '../../assets/Crave House logo.png'
import { Link, useLocation } from 'react-router-dom'
import { RiLogoutBoxRLine } from '@remixicon/react'

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
  branchName = 'Global Access',
  userName = 'User',
  roleLabel = 'STAFF',
  profilePath = '/staff/profile',
  onLogout,
}) {
  const location = useLocation()

  /*
    Checks whether a sidebar navigation item is active.

    If item.exact is true:
    - route must match exactly.

    Otherwise:
    - route can start with item.path.
    - Example: /staff/staff/create should keep Staff Management active.
  */
  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path
    }

    return location.pathname.startsWith(item.path)
  }

  /*
    Checks whether the bottom profile card is active.
  */
  const isProfileActive = location.pathname === profilePath

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
    userName && userName.includes('@') ? userName.split('@')[0] : userName

  return (
    <aside className="flex h-screen w-[270px] flex-col justify-between border-r border-gray-100 bg-white">
      <div>
        {/* Logo and branch section */}
        <div className="border-b border-gray-100 px-6 py-6">
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
                {branchName || 'Global Access'}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar navigation links */}
        <nav className="space-y-2 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
                  active
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <Icon size={20} />

                <span className="flex-1 text-sm font-medium">{item.label}</span>

                {active && (
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom profile and logout section */}
      <div className="border-t border-gray-100 p-4">
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${
            isProfileActive
              ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
              : 'bg-gray-50 text-gray-900'
          }`}
        >
          {/* Profile link */}
          <Link to={profilePath} className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{displayUserName}</div>

            <div
              className={`text-[10px] font-bold tracking-wider ${
                isProfileActive ? 'text-white/90' : 'text-orange-500'
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
              isProfileActive
                ? 'text-white'
                : 'text-gray-500 hover:text-red-500'
            }`}
            title="Logout"
            aria-label="Logout"
          >
            <RiLogoutBoxRLine size={18} />
          </button>
        </div>
      </div>
    </aside>
  )
}
