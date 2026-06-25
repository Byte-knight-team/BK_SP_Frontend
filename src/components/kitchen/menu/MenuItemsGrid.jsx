import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import MenuItemCard from './MenuItemCard'

// Tab definitions — chef sees Active items (all), and their own Pending/Rejected submissions
const TABS = [
  { key: 'ACTIVE', label: 'Active' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'REJECTED', label: 'Rejected' },
]

// MenuItemsGrid — renders the tab switcher, search bar, and the card grid
// All data fetching and modal state lives in the parent page (MenuAndRecipesPage)
const MenuItemsGrid = ({ items = [], isLoading, onAdd, onEdit }) => {
  const [activeTab, setActiveTab] = useState('ACTIVE')
  const [search, setSearch] = useState('')

  // Filter items by the selected tab status, then by the search query
  const filtered = items
    .filter((item) => item.status === activeTab)
    .filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )

  // Count per tab for the badge numbers
  const counts = {
    ACTIVE: items.filter((i) => i.status === 'ACTIVE').length,
    PENDING: items.filter((i) => i.status === 'PENDING').length,
    REJECTED: items.filter((i) => i.status === 'REJECTED').length,
  }

  return (
    <div className="space-y-6">

      {/* Top row: tab switcher on the left, Add button on the right */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 rounded-2xl border border-gray-100 bg-white p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-orange-500 text-white shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {/* Badge showing count per tab */}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-black ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Add Item button — opens AddMenuItemModal in the parent */}
        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-2xl bg-orange-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      {/* Grid of MenuItemCards */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-gray-400">Loading menu items...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-gray-400">
          No {activeTab.toLowerCase()} items found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              {/* Only pass onEdit for PENDING and REJECTED — ACTIVE items can't be edited by chef */}
              onEdit={activeTab !== 'ACTIVE' ? () => onEdit(item) : undefined}
            />
          ))}
        </div>
      )}

    </div>
  )
}

export default MenuItemsGrid
