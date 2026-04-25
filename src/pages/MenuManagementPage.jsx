import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  ImageOff,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import {
  getMenuItemsAPI,
  getMenuCategoriesAPI,
  getMenuSubcategoriesAPI,
  deleteMenuItemAPI,
} from '../apis/admin/menu';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzliOWJhMyI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';

export default function MenuManagementPage() {
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeSubCategory, setActiveSubCategory] = useState('All Sub Categories');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load categories on mount
  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const categories = await getMenuCategoriesAPI();
        if (isMounted && categories.length > 0) {
          setCategoryOptions(categories);
          setActiveCategory(categories[0].name);
        }
      } catch (error) {
        if (isMounted) {
          setApiError(error.message || 'Unable to load categories.');
        }
      }
    };

    loadCategories();
    return () => { isMounted = false; };
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    let isMounted = true;

    const loadSubCategories = async () => {
      if (!activeCategory) return;

      const selectedCategory = categoryOptions.find((c) => c.name === activeCategory);

      try {
        const data = await getMenuSubcategoriesAPI({
          categoryId: selectedCategory?.id || '',
          categoryName: activeCategory,
        });

        if (isMounted) {
          setSubCategoryOptions(data);
          setActiveSubCategory('All Sub Categories');
        }
      } catch {
        if (isMounted) {
          setSubCategoryOptions([]);
        }
      }
    };

    loadSubCategories();
    return () => { isMounted = false; };
  }, [activeCategory, categoryOptions]);

  // Load menu items
  const loadMenuItems = useCallback(async () => {
    setIsLoading(true);
    setApiError('');

    try {
      const items = await getMenuItemsAPI();
      setMenuItems(items);
    } catch (error) {
      setApiError(error.message || 'Unable to load menu items.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const itemCategory = item.categoryName || item.category || '';
      const itemSubCategory = item.subCategory || '';
      const itemStatus = item.status || '';
      const itemName = item.name || '';

      const matchesCategory = !activeCategory || itemCategory === activeCategory;
      const matchesSubCategory =
        activeSubCategory === 'All Sub Categories' || itemSubCategory === activeSubCategory;
      const matchesSearch = itemName.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' ||
        itemStatus.toUpperCase() === statusFilter.toUpperCase();

      return matchesCategory && matchesSubCategory && matchesSearch && matchesStatus;
    });
  }, [menuItems, activeCategory, activeSubCategory, searchText, statusFilter]);

  // Count items per category from actual data
  const categoryCounts = useMemo(() => {
    const counts = {};
    menuItems.forEach((item) => {
      const cat = item.categoryName || item.category || '';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [menuItems]);

  // Count items per subcategory from actual data
  const subCategoryCounts = useMemo(() => {
    const counts = { 'All Sub Categories': 0 };
    menuItems.forEach((item) => {
      const cat = item.categoryName || item.category || '';
      if (cat !== activeCategory) return;
      counts['All Sub Categories'] = (counts['All Sub Categories'] || 0) + 1;
      const sub = item.subCategory || '';
      if (sub) {
        counts[sub] = (counts[sub] || 0) + 1;
      }
    });
    return counts;
  }, [menuItems, activeCategory]);

  const handleDelete = async (itemId) => {
    setIsDeleting(true);

    try {
      await deleteMenuItemAPI(itemId);
      setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
      setDeleteConfirm(null);
    } catch (error) {
      setApiError(error.message || 'Unable to delete menu item.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusDisplay = (status) => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE':
        return 'Available';
      case 'UNAVAILABLE':
        return 'Unavailable';
      default:
        return status || 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE':
        return 'bg-[#d8f5e4] text-[#118a45]';
      case 'UNAVAILABLE':
        return 'bg-[#ffe2d1] text-[#c85b1d]';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleImageError = (event) => {
    event.target.src = PLACEHOLDER_IMAGE;
  };

  const summaryCards = [
    {
      label: 'Categories',
      value: String(categoryOptions.length),
      tone: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Sub Categories',
      value: String(subCategoryOptions.length),
      tone: 'bg-orange-100 text-orange-700',
    },
    {
      label: 'Menu Items',
      value: String(menuItems.length),
      tone: 'bg-orange-50 text-orange-600',
    },
    {
      label: 'Available Items',
      value: String(menuItems.filter((item) => item.status?.toUpperCase() === 'AVAILABLE').length),
      tone: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
        {/* Header */}
        <AdminHeader />

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-10">
          <div className="mb-4 mt-1 flex justify-end">
            <Link
              to="/admin/menu/add"
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              <Plus size={14} />
              Add Menu Item
            </Link>
          </div>

          {apiError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiError}
              <button
                onClick={() => setApiError('')}
                className="ml-2 font-semibold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Menu Item</h3>
                <p className="text-sm text-gray-600 mb-5">
                  Are you sure you want to delete <span className="font-semibold">"{deleteConfirm.name}"</span>? This action cannot be undone.
                </p>
                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    disabled={isDeleting}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm.id)}
                    disabled={isDeleting}
                    className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-70"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[220px_220px_minmax(0,1fr)]">
            {/* Categories Panel */}
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Categories</h2>
                <button className="grid size-8 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-2">
                {categoryOptions.map((category) => {
                  const isActive = activeCategory === category.name;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setActiveCategory(category.name)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors ${isActive ? 'bg-orange-50 text-orange-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <span className="flex items-center gap-3 text-sm font-medium">
                        {category.name}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isActive ? 'bg-white text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                        {categoryCounts[category.name] || 0}
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

            {/* Sub Categories Panel */}
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Sub Categories</h2>
              </div>

              <div className="space-y-2">
                {['All Sub Categories', ...subCategoryOptions].map((subCat) => {
                  const isActive = activeSubCategory === subCat;

                  return (
                    <button
                      key={subCat}
                      type="button"
                      onClick={() => setActiveSubCategory(subCat)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors ${isActive ? 'bg-orange-50 text-orange-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <span className="flex items-center gap-3 text-sm font-medium">
                        <span className="grid size-5 place-items-center text-gray-300">⋮⋮</span>
                        {subCat}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isActive ? 'bg-white text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                        {subCategoryCounts[subCat] || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Menu Items Panel */}
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Menu Items</h2>
                <div className="flex items-center gap-2">
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

              {isLoading ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center text-gray-500">
                  Loading menu items...
                </div>
              ) : filteredMenuItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center text-gray-500">
                  No menu items found.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {filteredMenuItems.map((item) => (
                    <article key={item.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                      <div className="relative h-40 overflow-hidden bg-gray-100">
                        <img
                          src={item.imageUrl || PLACEHOLDER_IMAGE}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={handleImageError}
                        />
                        <div className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(item.status)}`}>
                          {getStatusDisplay(item.status)}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-3">
                        <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                        <div className="mt-1 text-sm font-semibold text-orange-500">
                          Rs. {Number(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>

                        {item.subCategory && (
                          <div className="mt-1 text-xs text-gray-400">
                            {item.subCategory}
                          </div>
                        )}

                        <div className="mt-auto flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/menu/edit/${item.id}`)}
                            className="grid size-8 place-items-center rounded-lg border border-gray-200 bg-white text-sm transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            aria-label="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(item)}
                            className="grid size-8 place-items-center rounded-lg border border-gray-200 bg-white text-sm transition-colors text-red-500 hover:text-red-700 hover:bg-red-50"
                            aria-label="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>Showing {filteredMenuItems.length} of {menuItems.length} items</span>
              </div>
            </section>
          </div>

          <section className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Menu Summary</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <div key={card.label} className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className={`inline-flex rounded-xl px-4 py-3 text-center ${card.tone}`}>
                    <div>
                      <div className="text-2xl font-bold leading-none">{card.value}</div>
                      <div className="mt-1 text-xs font-medium opacity-80">{card.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
