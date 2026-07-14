import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import MenuItemCard from './MenuItemCard'

// Tab definitions. INACTIVE is not a real backend status — it's an ACTIVE
// item whose category was disabled (see bucketFor below). Being marked
// unavailable (out of stock right now) does NOT move an item out of Active —
// it's still something the restaurant serves, just not orderable this
// moment, so it stays under Active with an availability filter instead.
// PENDING/REJECTED map straight to item.status.
const TABS = [
  { key: 'ACTIVE', label: 'Active' },
  { key: 'INACTIVE', label: 'Inactive' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'REJECTED', label: 'Rejected' },
]

// Availability sub-filter, shown only inside the Active tab
const AVAILABILITY_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'AVAILABLE', label: 'Available' },
  { key: 'UNAVAILABLE', label: 'Unavailable' },
]

// Which tab an item belongs to — purely category-driven now
const bucketFor = (item) => {
  if (item.status !== 'ACTIVE') return item.status // PENDING or REJECTED
  const categoryDisabled = item.categoryStatus && item.categoryStatus !== 'ACTIVE'
  return categoryDisabled ? 'INACTIVE' : 'ACTIVE'
}

// MenuItemsGrid — renders the tab switcher, search bar, and the card grid
// All data fetching and modal state lives in the parent page (MenuItemPage)
const MenuItemsGrid = ({ items = [], isLoading, onAdd, onView }) => {
  const [activeTab, setActiveTab] = useState('ACTIVE')
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const switchTab = (key) => {
    setActiveTab(key)
    setAvailabilityFilter('ALL')
  }

  // Filter items by the selected tab bucket, then (Active tab only) by
  // availability, then by the search query. Active/Inactive (both are
  // approved items) sort by most-recently-approved first, so a just-approved
  // item surfaces at the top. Pending/Rejected sort by id ascending.
  const sortByApproval = activeTab === 'ACTIVE' || activeTab === 'INACTIVE'
  const filtered = items
    .filter((item) => bucketFor(item) === activeTab)
    .filter((item) => {
      if (activeTab !== 'ACTIVE' || availabilityFilter === 'ALL') return true
      return availabilityFilter === 'AVAILABLE' ? item.isAvailable === true : item.isAvailable !== true
    })
    .filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortByApproval
        ? new Date(b.approvedAt || 0) - new Date(a.approvedAt || 0)
        : a.id - b.id
    )

  // Count per tab for the badge numbers
  const counts = TABS.reduce((acc, tab) => {
    acc[tab.key] = items.filter((i) => bucketFor(i) === tab.key).length
    return acc
  }, {})

  // Availability counts, within the Active bucket only
  const activeItems = items.filter((i) => bucketFor(i) === 'ACTIVE')
  const availabilityCounts = {
    ALL: activeItems.length,
    AVAILABLE: activeItems.filter((i) => i.isAvailable === true).length,
    UNAVAILABLE: activeItems.filter((i) => i.isAvailable !== true).length,
  }

  return (
    <div className="space-y-6">

      {/* Top row: tab switcher on the left, Add button on the right */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 rounded-2xl border border-gray-100 bg-white p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => switchTab(tab.key)}
              className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
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
          className="flex cursor-pointer items-center gap-2 rounded-2xl bg-orange-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {/* Availability sub-filter — only inside the Active tab */}
      {activeTab === 'ACTIVE' && (
        <div className="flex flex-wrap items-center gap-2">
          {AVAILABILITY_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setAvailabilityFilter(f.key)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                availabilityFilter === f.key
                  ? 'bg-gray-800 text-white'
                  : 'border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50'
              }`}
            >
              {f.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  availabilityFilter === f.key ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {availabilityCounts[f.key]}
              </span>
            </button>
          ))}
        </div>
      )}

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

      {/* Grid of MenuItemCards — every card opens the same detail modal;
          only an ACTIVE item's modal offers the edit-request form */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-gray-400">Loading menu items...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-gray-400">
          No {activeTab.toLowerCase()} items found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <MenuItemCard key={item.id} item={item} onView={() => onView(item)} />
          ))}
        </div>
      )}

    </div>
  )
}

export default MenuItemsGrid
