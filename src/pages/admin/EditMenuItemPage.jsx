import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, Bell, HelpCircle, Settings, ArrowLeft, CheckCircle2, CircleDot
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import CloudinaryImageUpload from '../../components/admin/CloudinaryImageUpload';
import {
  getMenuItemByIdAPI,
  getMenuCategoriesAPI,
  getMenuSubcategoriesAPI,
  updateMenuItemAPI,
} from '../../apis/admin/menu';

const normalizeSubCategory = (value) => {
  const trimmed = value.trim().replace(/\s+/g, ' ');

  if (!trimmed) {
    return '';
  }

  return trimmed
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const mapVisibilityToStatus = (visibility) => {
  switch (visibility) {
    case 'Available':
      return 'ACTIVE';
    case 'Unavailable':
      return 'INACTIVE';
    default:
      return 'ACTIVE';
  }
};

const mapStatusToVisibility = (status) => {
  switch (status?.toUpperCase()) {
    case 'INACTIVE':
      return 'Unavailable';
    default:
      return 'Available';
  }
};

// Admin page for updating an existing menu item.
export default function EditMenuItemPage() {
  const navigate = useNavigate();
  const { id: itemId } = useParams();
  const subCategoryWrapperRef = useRef(null);

  const [itemName, setItemName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [basePrice, setBasePrice] = useState('0');
  const [preparationTime, setPreparationTime] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('Available');
  const [imageData, setImageData] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
  const [isMetaLoading, setIsMetaLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const visibilityOptions = [
    { label: 'Available', color: 'text-orange-500' },
    { label: 'Unavailable', color: 'text-gray-700' },
  ];

  const subCategorySuggestions = useMemo(() => {
    const normalized = subCategory.trim().toLowerCase();

    if (!normalized) {
      return subCategoryOptions.slice(0, 8);
    }

    return subCategoryOptions
      .filter((entry) => entry.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [subCategory, subCategoryOptions]);

  // Load existing item data
  useEffect(() => {
    let isMounted = true;

    const loadItem = async () => {
      setIsPageLoading(true);
      setApiError('');

      try {
        const item = await getMenuItemByIdAPI(itemId);

        if (!isMounted) return;

        setItemName(item.name || '');
        setCategoryId(String(item.categoryId ?? item.categoryName ?? ''));
        setCategoryName(item.categoryName || '');
        setSubCategory(item.subCategory || '');
        setBasePrice(String(item.price ?? '0'));
        setPreparationTime(String(item.preparationTime ?? ''));
        setDescription(item.description || '');
        setVisibility(mapStatusToVisibility(item.status));

        if (item.imageUrl) {
          setImageData({
            secure_url: item.imageUrl,
            public_id: item.imagePublicId || '',
          });
        }
      } catch (error) {
        if (isMounted) {
          setApiError(error.message || 'Unable to load menu item.');
        }
      } finally {
        if (isMounted) {
          setIsPageLoading(false);
        }
      }
    };

    loadItem();

    return () => {
      isMounted = false;
    };
  }, [itemId]);

  // Load categories
  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      setIsMetaLoading(true);

      try {
        const categories = await getMenuCategoriesAPI();

        if (isMounted) {
          setCategoryOptions(categories);
        }
      } catch (error) {
        if (isMounted) {
          setApiError(error.message || 'Unable to load category data.');
        }
      } finally {
        if (isMounted) {
          setIsMetaLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    let isMounted = true;

    const loadSubCategories = async () => {
      try {
        const data = await getMenuSubcategoriesAPI({ categoryId, categoryName });

        if (isMounted) {
          setSubCategoryOptions(data);
        }
      } catch (error) {
        if (isMounted) {
          setApiError(error.message || 'Unable to load subcategories.');
        }
      }
    };

    loadSubCategories();

    return () => {
      isMounted = false;
    };
  }, [categoryId, categoryName]);

  // Close subcategory dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!subCategoryWrapperRef.current?.contains(event.target)) {
        setIsSubCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const validateForm = () => {
    const nextErrors = {};
    const normalizedSubCategory = normalizeSubCategory(subCategory);
    const parsedPrice = Number(basePrice);
    const parsedPreparationTime = Number(preparationTime);

    if (itemName.trim().length < 2) {
      nextErrors.itemName = 'Item name must be at least 2 characters.';
    }

    if (!categoryId) {
      nextErrors.categoryId = 'Please select a category.';
    }

    if (!normalizedSubCategory) {
      nextErrors.subCategory = 'Subcategory is required.';
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      nextErrors.basePrice = 'Base price must be greater than 0.';
    }

    if (!Number.isFinite(parsedPreparationTime) || parsedPreparationTime <= 0) {
      nextErrors.preparationTime = 'Preparation time must be greater than 0.';
    }

    if (!imageData?.secure_url) {
      nextErrors.image = 'Please upload an item image.';
    }

    setErrors(nextErrors);
    return { isValid: Object.keys(nextErrors).length === 0, normalizedSubCategory };
  };

  const handleSaveChanges = async () => {
    setApiError('');

    const { isValid, normalizedSubCategory } = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      await updateMenuItemAPI(itemId, {
        name: itemName.trim(),
        categoryId: Number(categoryId),
        categoryName,
        subCategory: normalizedSubCategory,
        price: Number(basePrice),
        preparationTime: Number(preparationTime),
        description: description.trim() || null,
        status: mapVisibilityToStatus(visibility),
        imageUrl: imageData.secure_url,
        imagePublicId: imageData.public_id,
      });

      navigate('/admin/menu');
    } catch (error) {
      setApiError(error.message || 'Unable to update menu item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/menu');
  };

  if (isPageLoading) {
    return (
      <div className="bg-[#FAFAFA] font-sans py-16">
        <p className="text-center text-gray-500 text-sm">Loading menu item...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] font-sans">

        {/* Scrollable Content Area */}
        <div className="px-10 pb-10">

          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/menu')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Menu Item</h1>
                <p className="text-gray-500 text-sm mt-1">Configure item details, variants, and availability</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="bg-white hover:bg-gray-50 text-gray-800 font-semibold px-6 py-2.5 rounded-xl border border-gray-200 text-sm transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {apiError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiError}
            </div>
          )}

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

            {/* Left Column - General Information */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <CircleDot size={16} className="text-orange-500" />
                </div>
                <h2 className="text-base font-bold text-gray-900">General Information</h2>
              </div>

              {/* Item Name */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Classic Cheeseburger"
                  className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all ${errors.itemName ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.itemName && <p className="mt-1 text-xs text-red-600">{errors.itemName}</p>}
              </div>

              {/* Category, Subcategory, Base Price & Prep Time */}
              <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selectedCategory = categoryOptions.find((entry) => String(entry.id) === selectedId);

                      setCategoryId(selectedId);
                      setCategoryName(selectedCategory?.name || '');
                      setSubCategory('');
                    }}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all appearance-none cursor-pointer ${errors.categoryId ? 'border-red-300' : 'border-gray-200'}`}
                    disabled={isMetaLoading}
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId}</p>}
                </div>

                <div ref={subCategoryWrapperRef} className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategory</label>
                  <input
                    type="text"
                    value={subCategory}
                    onFocus={() => setIsSubCategoryOpen(true)}
                    onChange={(e) => setSubCategory(e.target.value)}
                    onBlur={() => setSubCategory(normalizeSubCategory(subCategory))}
                    placeholder="Type or pick a subcategory"
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all ${errors.subCategory ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {isSubCategoryOpen && subCategorySuggestions.length > 0 && (
                    <div className="absolute z-20 mt-2 max-h-52 w-full overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                      {subCategorySuggestions.map((entry) => (
                        <button
                          key={entry}
                          type="button"
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-orange-50"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            setSubCategory(normalizeSubCategory(entry));
                            setIsSubCategoryOpen(false);
                          }}
                        >
                          {entry}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.subCategory && <p className="mt-1 text-xs text-red-600">{errors.subCategory}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Base Price (LKR)</label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all ${errors.basePrice ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors.basePrice && <p className="mt-1 text-xs text-red-600">{errors.basePrice}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Preparation Time (min)</label>
                  <input
                    type="number"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(e.target.value)}
                    placeholder="e.g. 15"
                    min="1"
                    step="1"
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all ${errors.preparationTime ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors.preparationTime && <p className="mt-1 text-xs text-red-600">{errors.preparationTime}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your dish..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all resize-none ${errors.description ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">

              {/* Item Image */}
              <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Item Image</h2>
                <CloudinaryImageUpload
                  initialValue={imageData}
                  onChange={(uploadResult) => setImageData(uploadResult)}
                  className="w-full"
                />
                {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
              </div>

              {/* Visibility */}
              <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Visibility</h2>
                <div className="flex flex-col gap-1">
                  {visibilityOptions.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => setVisibility(option.label)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${visibility === option.label
                        ? 'bg-orange-50 text-orange-500 border border-orange-200'
                        : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                        }`}
                    >
                      <span>{option.label}</span>
                      {visibility === option.label && (
                        <CheckCircle2 size={18} className="text-orange-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
    </div>
  );
}
