import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  ChevronLeft,
  ChevronRight,
  ImageOff,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

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
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading, error: queryError } = useQuery({
    queryKey: ['menuItems'],
    queryFn: getMenuItemsAPI,
    staleTime: 5 * 60 * 1000,
  });

  const [activeCategory, setActiveCategory] = useState('');
  const [activeSubCategory, setActiveSubCategory] = useState('All Sub Categories');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);
  
  const initialStatus = searchParams.get('status')?.toUpperCase() || 'ALL';
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  useEffect(() => {
    const status = searchParams.get('status')?.toUpperCase();
    if (status) {
      setStatusFilter(status);
      if (status === 'PENDING' || status === 'REJECTED') {
        setActiveCategory('');
        setActiveSubCategory('All Sub Categories');
      }
    } else {
      setStatusFilter('ALL');
    }
  }, [searchParams]);
  const [togglingItemId, setTogglingItemId] = useState(null);
  const [decisionItemId, setDecisionItemId] = useState(null);
  const [isChefRequestOpen, setIsChefRequestOpen] = useState(false);
  const [chefRequestText, setChefRequestText] = useState('');

  // Queries
  const { data: counts = { catCount: 0, subCatCount: 0, itemsCount: 0, availCount: 0 } } = useQuery({
    queryKey: ['menuCounts'],
    queryFn: async () => {
      const [catCount, subCatCount, itemsCount, availCount] = await Promise.all([
        getMenuCategoriesCountAPI(),
        getMenuSubcategoriesCountAPI(),
        getMenuItemsCountAPI(),
        getAvailableItemsCountAPI(),
      ]);
      return { catCount, subCatCount, itemsCount, availCount };
    },
  });

  const { data: categoryOptions = [] } = useQuery({
    queryKey: ['menuCategories'],
    queryFn: getMenuCategoriesAPI,
  });



  const selectedCategory = categoryOptions.find((c) => c.name === activeCategory);

  const { data: subCategoryOptions = [] } = useQuery({
    queryKey: ['menuSubCategories', selectedCategory?.id, activeCategory],
    queryFn: async () => {
      if (!activeCategory) return [];
      try {
        return await getMenuSubcategoriesAPI({
          categoryId: selectedCategory?.id || '',
          categoryName: activeCategory,
        });
      } catch {
        return [];
      }
    },
    enabled: !!activeCategory,
  });

  // Automatically reset subcategory when activeCategory changes
  useEffect(() => {
    setActiveSubCategory('All Sub Categories');
  }, [activeCategory]);

  // Remove manual loadMenuItems since useQuery handles it

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const itemCategory = item.categoryName || item.category || '';
      const itemSubCategory = item.subCategory || '';
      const itemStatus = normalizeStatus(item.status);
      const itemName = item.name || '';

      const matchesCategory = !activeCategory || itemCategory === activeCategory;
      const matchesSubCategory =
        activeSubCategory === 'All Sub Categories' || itemSubCategory === activeSubCategory;
      const matchesSearch = itemName.toLowerCase().includes(debouncedSearchText.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' ||
        itemStatus === statusFilter.toUpperCase();

      return matchesCategory && matchesSubCategory && matchesSearch && matchesStatus;
    });
  }, [menuItems, activeCategory, activeSubCategory, debouncedSearchText, statusFilter]);

  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeSubCategory, debouncedSearchText, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMenuItems.length / ITEMS_PER_PAGE));
  const paginatedMenuItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMenuItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMenuItems, currentPage]);

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
      if (activeCategory && cat !== activeCategory) return;
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

      queryClient.setQueryData(['menuItems'], (old) =>
        old?.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                ...(updatedItem || {}),
                status: (updatedItem?.status || nextStatus).toUpperCase(),
              }
            : entry
        )
      );
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Item availability updated.');
    } catch (error) {
      toast.error(error.message || 'Unable to update item status.');
    } finally {
      setTogglingItemId(null);
    }
  };

  const handleApprovePendingItem = async (item) => {
    setDecisionItemId(item.id);

    try {
      const action = await approveMenuItemAPI(item.id, {});
      const nextStatus = normalizeStatus(action?.type) || 'ACTIVE';

      queryClient.setQueryData(['menuItems'], (old) =>
        old?.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: nextStatus, isAvailable: nextStatus === 'ACTIVE' }
            : entry
        )
      );
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Item approved successfully.');
    } catch (error) {
      toast.error(error.message || 'Unable to approve item.');
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
      toast.error('Rejection reason is required.');
      return;
    }

    setDecisionItemId(item.id);

    try {
      const action = await rejectMenuItemAPI(item.id, reason.trim());
      const nextStatus = normalizeStatus(action?.type) || 'REJECTED';

      queryClient.setQueryData(['menuItems'], (old) =>
        old?.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: nextStatus, isAvailable: false }
            : entry
        )
      );
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Item rejected successfully.');
    } catch (error) {
      toast.error(error.message || 'Unable to reject item.');
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
      value: String(counts.catCount),
      tone: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Sub Categories',
      value: String(counts.subCatCount),
      tone: 'bg-orange-100 text-orange-700',
    },
    {
      label: 'Menu Items',
      value: String(counts.itemsCount),
      tone: 'bg-orange-50 text-orange-600',
    },
    {
      label: 'Active Items',
      value: String(counts.availCount),
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

            <button
              onClick={() => setIsChefRequestOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              <Plus size={14} />
              Request for chef
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[220px_220px_minmax(0,1fr)]">
            {/* Categories Panel */}
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Categories</h2>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('');
                    setActiveSubCategory('All Sub Categories');
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors ${activeCategory === '' ? 'bg-orange-50 text-orange-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="flex items-center gap-3 text-sm font-medium">
                    All Categories
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${activeCategory === '' ? 'bg-white text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                    {menuItems.length}
                  </span>
                </button>
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
                      className="w-full min-w-[200px] border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
                    />
                  </div>

                  <label className="relative">
                    <select
                      value={statusFilter}
                      onChange={(event) => {
                        const newStatus = event.target.value;
                        setStatusFilter(newStatus);
                        navigate(`/admin/menu${newStatus === 'ALL' ? '' : `?status=${newStatus.toLowerCase()}`}`, { replace: true });
                      }}
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
                  {paginatedMenuItems.map((item) => (
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

              <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-4 sm:flex-row">
                <div className="text-xs text-gray-500">
                  Showing {filteredMenuItems.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredMenuItems.length)} of {filteredMenuItems.length} items
                </div>
                
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-50"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`inline-flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-orange-50 text-orange-600'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-50"
                      aria-label="Next page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
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

      {/* Chef Request Modal */}
      {isChefRequestOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[1.5rem] bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-bold text-gray-900">Request for Chef</h3>
            <textarea
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
              rows={4}
              placeholder="Type your request here (e.g. Please add a new seasonal burger...)"
              value={chefRequestText}
              onChange={(e) => setChefRequestText(e.target.value)}
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsChefRequestOpen(false);
                  setChefRequestText('');
                }}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success("Request sent to chef successfully!");
                  setIsChefRequestOpen(false);
                  setChefRequestText('');
                }}
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!chefRequestText.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
