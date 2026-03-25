import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import clsx from 'clsx'
import { NAV_ITEMS } from '../../constants/navItems'

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside className="w-60 shrink-0 h-full bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="text-xl font-bold">
          <span className="text-brand">CRAVE</span>HOUSE
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User card + logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl mb-2">
          <img
            src="https://i.pravatar.cc/32?img=12"
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              Ashen Randira
            </p>
            <p className="text-xs text-brand font-medium">MANAGER</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand hover:bg-orange-50 rounded-lg w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
