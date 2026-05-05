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
  ChevronDown,
  ImageOff,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import {
  getMenuItemsAPI,
  getMenuCategoriesAPI,
  getMenuSubcategoriesAPI,
  getMenuCategoriesCountAPI,
  getMenuSubcategoriesCountAPI,
  getMenuItemsCountAPI,
  getAvailableItemsCountAPI,
  updateMenuItemAPI,
  approveMenuItemAPI,
  rejectMenuItemAPI,
} from '../../apis/admin/menu';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzliOWJhMyI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';

const normalizeStatus = (status) => {
  const normalized = status?.toUpperCase();

  if (normalized === 'AVAILABLE') return 'ACTIVE';
  if (normalized === 'UNAVAILABLE') return 'INACTIVE';

  return normalized || '';
};

// Admin page for managing menu categories, filters, and item actions.
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
  const [togglingItemId, setTogglingItemId] = useState(null);
  const [decisionItemId, setDecisionItemId] = useState(null);
  const [totalCategoriesCount, setTotalCategoriesCount] = useState(0);
  const [totalSubCategoriesCount, setTotalSubCategoriesCount] = useState(0);
  const [totalMenuItemsCount, setTotalMenuItemsCount] = useState(0);
  const [totalAvailableItemsCount, setTotalAvailableItemsCount] = useState(0);

  // Fetch counts whenever menu items or categories change
  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      try {
        const [catCount, subCatCount, itemsCount, availCount] = await Promise.all([
          getMenuCategoriesCountAPI(),
          getMenuSubcategoriesCountAPI(),
          getMenuItemsCountAPI(),
          getAvailableItemsCountAPI(),
        ]);
        if (isMounted) {
          setTotalCategoriesCount(catCount);
          setTotalSubCategoriesCount(subCatCount);
          setTotalMenuItemsCount(itemsCount);
          setTotalAvailableItemsCount(availCount);
        }
      } catch (error) {
        console.error('Failed to fetch counts:', error);
      }
    };
    fetchCounts();
    return () => { isMounted = false; };
  }, [categoryOptions, menuItems]);

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
      const itemStatus = normalizeStatus(item.status);
      const itemName = item.name || '';

      const matchesCategory = !activeCategory || itemCategory === activeCategory;
      const matchesSubCategory =
        activeSubCategory === 'All Sub Categories' || itemSubCategory === activeSubCategory;
      const matchesSearch = itemName.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' ||
        itemStatus === statusFilter.toUpperCase();

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

  const handleToggleAvailability = async (item) => {
    const currentStatus = normalizeStatus(item.status);
    if (currentStatus !== 'ACTIVE' && currentStatus !== 'INACTIVE') {
      return;
    }

    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setTogglingItemId(item.id);

    try {
      const updatedItem = await updateMenuItemAPI(item.id, {
        ...item,
        status: nextStatus,
      });

      setMenuItems((prev) =>
        prev.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                ...(updatedItem || {}),
                status: (updatedItem?.status || nextStatus).toUpperCase(),
              }
            : entry,
        ),
      );
    } catch (error) {
      setApiError(error.message || 'Unable to update item status.');
    } finally {
      setTogglingItemId(null);
    }
  };

  const handleApprovePendingItem = async (item) => {
    setDecisionItemId(item.id);
    setApiError('');

    try {
      const action = await approveMenuItemAPI(item.id, {});
      const nextStatus = normalizeStatus(action?.type) || 'ACTIVE';

      setMenuItems((prev) =>
        prev.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: nextStatus, isAvailable: nextStatus === 'ACTIVE' }
            : entry,
        ),
      );
    } catch (error) {
      setApiError(error.message || 'Unable to approve item.');
    } finally {
      setDecisionItemId(null);
    }
  };

  const handleRejectPendingItem = async (item) => {
    const reason = window.prompt('Enter rejection reason for chef:');

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      setApiError('Rejection reason is required.');
      return;
    }

    setDecisionItemId(item.id);
    setApiError('');

    try {
      const action = await rejectMenuItemAPI(item.id, reason.trim());
      const nextStatus = normalizeStatus(action?.type) || 'REJECTED';

      setMenuItems((prev) =>
        prev.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: nextStatus, isAvailable: false }
            : entry,
        ),
      );
    } catch (error) {
      setApiError(error.message || 'Unable to reject item.');
    } finally {
      setDecisionItemId(null);
    }
  };

  // Compact visual toggle switch (orange when on, gray when off)
  const ToggleSwitch = ({ checked, onChange, disabled, loading }) => {
    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onChange?.(event);
        }}
        disabled={disabled || loading}
        aria-pressed={checked}
        className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors focus:outline-none ${
          checked ? 'bg-orange-500' : 'bg-gray-300'
        } disabled:opacity-60`}
      >
        <span
          className={`absolute left-1 h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white">
            ...
          </span>
        )}
      </button>
    );
  };

  const getStatusDisplay = (status) => {
    switch (normalizeStatus(status)) {
      case 'ACTIVE':
        return 'Active';
      case 'INACTIVE':
        return 'Inactive';
      case 'PENDING':
        return 'Pending';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status || 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (normalizeStatus(status)) {
      case 'ACTIVE':
        return 'bg-[#d8f5e4] text-[#118a45]';
      case 'INACTIVE':
        return 'bg-[#ffe2d1] text-[#c85b1d]';
      case 'PENDING':
        return 'bg-[#fff6cc] text-[#a17a00]';
      case 'REJECTED':
        return 'bg-[#ffe3e3] text-[#c53030]';
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
      value: String(totalCategoriesCount),
      tone: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Sub Categories',
      value: String(totalSubCategoriesCount),
      tone: 'bg-orange-100 text-orange-700',
    },
    {
      label: 'Menu Items',
      value: String(totalMenuItemsCount),
      tone: 'bg-orange-50 text-orange-600',
    },
    {
      label: 'Active Items',
      value: String(totalAvailableItemsCount),
      tone: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="bg-[#FAFAFA] font-sans px-8 pb-10">
          <div className="mb-8 mt-1 flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Menu Management</h1>
              <p className="text-gray-500 text-sm mt-1">Manage categories, sub categories, and menu items</p>
            </div>

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

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[220px_220px_minmax(0,1fr)]">
            {/* Categories Panel */}
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Categories</h2>
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
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="PENDING">Pending</option>
                      <option value="REJECTED">Rejected</option>
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
                    <article key={item.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md cursor-pointer" onClick={() => navigate(`/admin/menu/${item.id}`)}>
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
                          <ToggleSwitch
                            checked={normalizeStatus(item.status) === 'ACTIVE'}
                            onChange={() => handleToggleAvailability(item)}
                            disabled={
                              togglingItemId === item.id
                              || (normalizeStatus(item.status) !== 'ACTIVE' && normalizeStatus(item.status) !== 'INACTIVE')
                            }
                            loading={togglingItemId === item.id}
                          />
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(`/admin/menu/edit/${item.id}`);
                            }}
                            className="grid size-8 place-items-center rounded-lg border border-gray-200 bg-white text-sm transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            aria-label="Edit"
                          >
                            <Pencil size={14} />
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
  );
}
