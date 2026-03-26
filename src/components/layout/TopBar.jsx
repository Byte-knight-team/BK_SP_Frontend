import { Search, Bell, HelpCircle } from 'lucide-react'

export default function TopBar() {
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 w-80">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Quick search across modules..."
          className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
        />
      </div>

      {/* Right side icons + button */}
      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
        <button className="btn-primary text-xs px-3 py-1.5">
          System Panel
        </button>
      </div>
    </header>
  )
}
