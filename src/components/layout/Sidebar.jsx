import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import clsx from 'clsx'
import { NAV_ITEMS } from '../../constants/navItems'
import logo from '../../assets/logo.png'

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside className="w-72 shrink-0 h-full bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-center gap-2.5">
        <div className="w-10 h-10 bg-brand rounded-full overflow-hidden flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-9 h-9 object-contain" />
        </div>
        <span className="text-xl font-bold">
          <span className="text-brand">CRAVE</span>
          <span className="text-black">HOUSE</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                isActive
                  ? 'bg-brand text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5 shrink-0" />
                {label}
                {isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-white" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card + logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-2">
          <img
            src="https://i.pravatar.cc/40?img=12"
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="text-base font-semibold text-gray-900 truncate">
              Ashen Randira
            </p>
            <p className="text-sm text-brand font-medium">MANAGER</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 px-4 py-2.5 text-base font-medium text-brand hover:bg-orange-50 rounded-lg w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
