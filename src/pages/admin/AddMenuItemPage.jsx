import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, Bell, HelpCircle, Settings, ArrowLeft, CheckCircle2, CircleDot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CloudinaryImageUpload from '../../components/admin/CloudinaryImageUpload';
import {
  createMenuItemAPI,
  getMenuCategoriesAPI,
  getMenuSubcategoriesAPI,
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
      return 'AVAILABLE';
    case 'Unavailable':
      return 'UNAVAILABLE';
    default:
      return 'AVAILABLE';
  }
};

export default function AddMenuItemPage() {
  const navigate = useNavigate();
  const subCategoryWrapperRef = useRef(null);

  const [itemName, setItemName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [basePrice, setBasePrice] = useState('0');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('Available');
  const [imageData, setImageData] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
  const [isMetaLoading, setIsMetaLoading] = useState(false);
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

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      setIsMetaLoading(true);
      setApiError('');

      try {
        const categories = await getMenuCategoriesAPI();

        if (!isMounted) {
          return;
        }

        setCategoryOptions(categories);
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

    if (description.trim().length < 10) {
      nextErrors.description = 'Description must be at least 10 characters.';
    }

    if (!imageData?.secure_url || !imageData?.public_id) {
      nextErrors.image = 'Please upload an item image.';
    }

    setErrors(nextErrors);
    return { isValid: Object.keys(nextErrors).length === 0, normalizedSubCategory };
  };

  const handleCreateItem = async () => {
    setApiError('');

    const { isValid, normalizedSubCategory } = validateForm();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createMenuItemAPI({
        name: itemName.trim(),
        categoryId,
        categoryName,
        subCategory: normalizedSubCategory,
        price: Number(basePrice),
        description: description.trim(),
        status: mapVisibilityToStatus(visibility),
        imageUrl: imageData.secure_url,
        imagePublicId: imageData.public_id,
      });

      navigate('/admin/menu');
    } catch (error) {
      setApiError(error.message || 'Unable to create menu item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/menu');
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans">

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-10 pb-10">

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
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Menu Item</h1>
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
                onClick={handleCreateItem}
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                {isSubmitting ? 'Creating...' : 'Create Item'}
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

              {/* Category, Subcategory & Base Price */}
              <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
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
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
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
      </main>
    </div>
  );
}
