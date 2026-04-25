import React, { useMemo, useState } from 'react';
import {
  Settings,
  Search,
  Bell,
  HelpCircle,
  Plus,
  SlidersHorizontal,
  EllipsisVertical,
  Clock3,
  Pencil,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const categoryData = [
  { name: 'Beverages', count: 24, icon: '☕' },
  { name: 'Main Course', count: 42, icon: '🍲' },
  { name: 'Appetizers', count: 18, icon: '🍤' },
  { name: 'Desserts', count: 16, icon: '🍰' },
  { name: 'Salads', count: 12, icon: '🥗' },
  { name: 'Rice & Noodles', count: 20, icon: '🍜' },
  { name: 'Sides', count: 10, icon: '🍟' },
  { name: 'Combo Meals', count: 8, icon: '🍱' },
];

const subCategoryData = {
  Beverages: [
    { name: 'All Sub Categories', count: 24 },
    { name: 'Hot Drinks', count: 8 },
    { name: 'Cold Drinks', count: 10 },
    { name: 'Fresh Juices', count: 6 },
  ],
  'Main Course': [
    { name: 'All Sub Categories', count: 42 },
    { name: 'Rice Dishes', count: 18 },
    { name: 'Curry Plates', count: 12 },
    { name: 'Grills', count: 12 },
  ],
  Appetizers: [
    { name: 'All Sub Categories', count: 18 },
    { name: 'Starters', count: 8 },
    { name: 'Finger Foods', count: 10 },
  ],
  Desserts: [
    { name: 'All Sub Categories', count: 16 },
    { name: 'Cakes', count: 7 },
    { name: 'Ice Cream', count: 5 },
    { name: 'Pastries', count: 4 },
  ],
  Salads: [
    { name: 'All Sub Categories', count: 12 },
    { name: 'Fresh Salads', count: 7 },
    { name: 'Fruit Salads', count: 5 },
  ],
  'Rice & Noodles': [
    { name: 'All Sub Categories', count: 20 },
    { name: 'Fried Rice', count: 10 },
    { name: 'Noodles', count: 10 },
  ],
  Sides: [
    { name: 'All Sub Categories', count: 10 },
    { name: 'Add-ons', count: 6 },
    { name: 'Sauces', count: 4 },
  ],
  'Combo Meals': [
    { name: 'All Sub Categories', count: 8 },
    { name: 'Family Combos', count: 5 },
    { name: 'Lunch Combos', count: 3 },
  ],
};

const menuItemsData = [
  {
    id: 1,
    name: 'Cappuccino',
    category: 'Beverages',
    subCategory: 'Hot Drinks',
    price: 'Rs. 450.00',
    time: '5 min',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?fm=jpg&q=60&w=1200&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Caffe Latte',
    category: 'Beverages',
    subCategory: 'Hot Drinks',
    price: 'Rs. 400.00',
    time: '5 min',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?fm=jpg&q=60&w=1200&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Americano',
    category: 'Beverages',
    subCategory: 'Hot Drinks',
    price: 'Rs. 350.00',
    time: '3 min',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?fm=jpg&q=60&w=1200&auto=format&fit=crop',
  },
  {
    id: 4,
    name: 'Espresso',
    category: 'Beverages',
    subCategory: 'Hot Drinks',
    price: 'Rs. 300.00',
    time: '2 min',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?fm=jpg&q=60&w=1200&auto=format&fit=crop',
  },
  {
    id: 5,
    name: 'Masala Tea',
    category: 'Beverages',
    subCategory: 'Hot Drinks',
    price: 'Rs. 250.00',
    time: '4 min',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1567201867112-3b6bd4f52a11?fm=jpg&q=60&w=1200&auto=format&fit=crop',
  },
  {
    id: 6,
    name: 'Hot Chocolate',
    category: 'Beverages',
    subCategory: 'Hot Drinks',
    price: 'Rs. 380.00',
    time: '6 min',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1517578239113-b03992dcdd25?fm=jpg&q=60&w=1200&auto=format&fit=crop',
  },
  {
    id: 7,
    name: 'Mocha',
    category: 'Beverages',
    subCategory: 'Hot Drinks',
    price: 'Rs. 450.00',
    time: '5 min',
    status: 'Unavailable',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?fm=jpg&q=60&w=1200&auto=format&fit=crop',
  },
  {
    id: 8,
    name: 'Green Tea',
    category: 'Beverages',
    subCategory: 'Hot Drinks',
    price: 'Rs. 250.00',
    time: '3 min',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?fm=jpg&q=60&w=1200&auto=format&fit=crop',
  },
];

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState(menuItemsData);
  const [activeCategory, setActiveCategory] = useState('Beverages');
  const [activeSubCategory, setActiveSubCategory] = useState('Hot Drinks');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const activeSubCategories = subCategoryData[activeCategory] || [];

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = item.category === activeCategory;
      const matchesSubCategory =
        activeSubCategory === 'All Sub Categories' || item.subCategory === activeSubCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' || item.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesCategory && matchesSubCategory && matchesSearch && matchesStatus;
    });
  }, [menuItems, activeCategory, activeSubCategory, searchText, statusFilter]);

  const handleToggleAvailability = (itemId) => {
    setMenuItems((previousItems) =>
      previousItems.map((item) =>
        item.id === itemId
          ? { ...item, status: item.status === 'Available' ? 'Unavailable' : 'Available' }
          : item,
      ),
    );
  };

  const summaryCards = [
    {
      label: 'Categories',
      value: '8',
      tone: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Sub Categories',
      value: '24',
      tone: 'bg-orange-100 text-orange-700',
    },
    {
      label: 'Menu Items',
      value: String(menuItems.length),
      tone: 'bg-orange-50 text-orange-600',
    },
    {
      label: 'Available Items',
      value: String(menuItems.filter((item) => item.status === 'Available').length),
      tone: 'bg-emerald-50 text-emerald-600',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-[#d8f5e4] text-[#118a45]';
      case 'Unavailable':
        return 'bg-[#ffe2d1] text-[#c85b1d]';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const menuItemActions = [
    {
      icon: Pencil,
      label: 'Edit',
      tone: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    },
    {
      icon: Trash2,
      label: 'Delete',
      tone: 'text-red-500 hover:text-red-700 hover:bg-red-50',
    },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
        {/* Header */}
        <header className="px-10 py-6 flex items-center justify-between sticky top-0 z-20 bg-[#FAFAFA]">
          <div className="flex items-center bg-white border border-gray-100 rounded-2xl px-4 py-2.5 w-full max-w-md shadow-sm">
            <Search size={18} className="text-gray-400 mr-3 hidden sm:block" />
            <input type="text" placeholder="Quick search across modules..." className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400" />
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
              <Bell size={22} />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-400 rounded-full border-2 border-[#FAFAFA]"></div>
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <HelpCircle size={22} />
            </button>
            <button className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
              <Settings size={16} />
              System Panel
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-10">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[220px_220px_minmax(0,1fr)]">
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Categories</h2>
                <button className="grid size-8 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-2">
                {categoryData.map((category) => {
                  const isActive = activeCategory === category.name;

                  return (
                    <button
                      key={category.name}
                      type="button"
                      onClick={() => {
                        setActiveCategory(category.name);
                        const firstSubCategory = subCategoryData[category.name]?.[1]?.name || 'All Sub Categories';
                        setActiveSubCategory(firstSubCategory);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors ${
                        isActive ? 'bg-orange-50 text-orange-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-3 text-sm font-medium">
                        <span className="grid size-7 place-items-center rounded-lg bg-white text-sm shadow-sm">
                          {category.icon}
                        </span>
                        {category.name}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isActive ? 'bg-white text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                        {category.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 px-4 py-3 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50">
                <Plus size={16} />
                Add Category
              </button>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Sub Categories</h2>
              </div>

              <div className="space-y-2">
                {(activeSubCategories.length ? activeSubCategories : [{ name: 'All Sub Categories', count: 0 }]).map((subCategory) => {
                  const isActive = activeSubCategory === subCategory.name;

                  return (
                    <button
                      key={subCategory.name}
                      type="button"
                      onClick={() => setActiveSubCategory(subCategory.name)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors ${
                        isActive ? 'bg-orange-50 text-orange-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-3 text-sm font-medium">
                        <span className="grid size-5 place-items-center text-gray-300">⋮⋮</span>
                        {subCategory.name}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isActive ? 'bg-white text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                        {subCategory.count}
                      </span>
                    </button>
                  );
                })}
              </div>

            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Menu Items</h2>
                <div className="flex items-center gap-2">
                  <Link
                    to="/admin/menu/add"
                    className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                    <Plus size={14} />
                    Add Menu Item
                  </Link>

                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
                    <Search size={16} className="text-gray-400" />
                    <input
                      value={searchText}
                      onChange={(event) => setSearchText(event.target.value)}
                      placeholder="Search menu items..."
                      className="w-full min-w-[170px] border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
                    />
                  </div>

                  <label className="relative">
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm text-gray-700 outline-none"
                    >
                      <option value="ALL">All Status</option>
                      <option value="AVAILABLE">Available</option>
                      <option value="UNAVAILABLE">Unavailable</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchText('');
                      setStatusFilter('ALL');
                    }}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <SlidersHorizontal size={14} />
                    Filter
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filteredMenuItems.map((item) => (
                  <article key={item.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                    <div className="relative h-40 overflow-hidden">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      <div className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(item.status)}`}>
                        {item.status}
                      </div>
                      <button type="button" className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-gray-700 shadow-sm">
                        <EllipsisVertical size={14} />
                      </button>
                    </div>

                    <div className="flex flex-1 flex-col p-3">
                      <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                      <div className="mt-1 text-sm font-semibold text-orange-500">{item.price}</div>

                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <Clock3 size={12} />
                        <span>{item.time}</span>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(item.id)}
                          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${item.status === 'Available' ? 'bg-orange-500' : 'bg-gray-300'}`}
                          aria-label={`${item.name} availability toggle`}
                          aria-pressed={item.status === 'Available'}
                        >
                          <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${item.status === 'Available' ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>

                        <div className="flex items-center gap-2">
                          {menuItemActions.map(({ icon: Icon, label, tone }) => (
                            <button
                              key={label}
                              type="button"
                              className={`grid size-8 place-items-center rounded-lg border border-gray-200 bg-white text-sm transition-colors ${tone}`}
                              aria-label={label}
                            >
                              <Icon size={14} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>Showing 1 to {filteredMenuItems.length} of {filteredMenuItems.length} items</span>
                <div className="flex items-center gap-2">
                  <button className="grid size-8 place-items-center rounded-lg border border-gray-200 text-gray-400">‹</button>
                  <button className="grid size-8 place-items-center rounded-lg bg-orange-500 text-white">1</button>
                  <button className="grid size-8 place-items-center rounded-lg border border-gray-200 text-gray-400">›</button>
                </div>
              </div>
            </section>
          </div>

          <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className={`inline-flex rounded-xl px-4 py-3 text-center ${card.tone}`}>
                  <div>
                    <div className="text-2xl font-bold leading-none">{card.value}</div>
                    <div className="mt-1 text-xs font-medium opacity-80">{card.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
