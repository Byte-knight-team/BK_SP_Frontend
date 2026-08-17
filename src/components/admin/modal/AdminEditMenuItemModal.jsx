import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { CheckCircle2, CircleDot, X } from 'lucide-react';
import CloudinaryImageUpload from '../CloudinaryImageUpload';
import { getMenuItemByIdAPI, updateMenuItemAPI } from '../../../apis/admin/menu';
import { getMenuCategoriesAPI, getMenuSubcategoriesAPI } from '../../../apis/staff/category';
import IngredientPicker from '../../kitchen/menu/IngredientPicker';
import { getMenuItemIngredientsAPI, saveMenuItemIngredientsAPI } from '../../../apis/kitchen/menu';
import { InventoryService } from '../../../apis/manager/InventoryService';

const normalizeSubCategory = (value) => {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';
  return trimmed.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const mapVisibilityToStatus = (visibility) => {
  return visibility === 'Available' ? 'ACTIVE' : 'INACTIVE';
};

const mapStatusToVisibility = (status) => {
  return status?.toUpperCase() === 'INACTIVE' ? 'Unavailable' : 'Available';
};

export default function AdminEditMenuItemModal({ request, onClose, onApprove, mode = 'request' }) {
  const queryClient = useQueryClient();
  const subCategoryWrapperRef = useRef(null);
  
  const itemId = request.menuItemId;

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
  const [ingredients, setIngredients] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaveSuccessful, setIsSaveSuccessful] = useState(false);
  const [errors, setErrors] = useState({});

  const visibilityOptions = [
    { label: 'Available', color: 'text-orange-500' },
    { label: 'Unavailable', color: 'text-gray-700' },
  ];

  const subCategorySuggestions = useMemo(() => {
    const normalized = subCategory.trim().toLowerCase();
    if (!normalized) return subCategoryOptions.slice(0, 8);
    return subCategoryOptions.filter((entry) => entry.toLowerCase().includes(normalized)).slice(0, 8);
  }, [subCategory, subCategoryOptions]);

  const { data: item, isLoading: isItemLoading } = useQuery({
    queryKey: ['menuItem', itemId],
    queryFn: () => getMenuItemByIdAPI(itemId),
    initialData: () => {
      const allItems = queryClient.getQueryData(['menuItems']);
      return allItems?.find((i) => String(i.id) === String(itemId));
    },
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['menuCategories'],
    queryFn: getMenuCategoriesAPI,
  });

  const { data: subCategories = [] } = useQuery({
    queryKey: ['menuSubCategories', categoryId, categoryName],
    queryFn: () => getMenuSubcategoriesAPI({ categoryId, categoryName }),
    enabled: !!categoryId || !!categoryName,
  });

  const { data: ingredientsData } = useQuery({
    queryKey: ['menuItemIngredients', itemId],
    queryFn: () => getMenuItemIngredientsAPI(itemId),
  });

  const { data: inventoryData } = useQuery({
    queryKey: ['inventoryItems'],
    queryFn: () => InventoryService.getAllItems(""),
  });

  useEffect(() => {
    if (item && !itemName) {
      setItemName(item.name || '');
      setCategoryId(String(item.categoryId ?? item.categoryName ?? ''));
      setCategoryName(item.categoryName || '');
      setSubCategory(item.subCategory || '');
      setBasePrice(String(item.price ?? '0'));
      setPreparationTime(String(item.preparationTime ?? ''));
      setDescription(item.description || '');
      setVisibility(mapStatusToVisibility(item.status));

      if (item.imageUrl) {
        setImageData({ secure_url: item.imageUrl, public_id: item.imagePublicId || '' });
      }
    }
  }, [item, itemName]);

  useEffect(() => {
    if (ingredientsData && !ingredientsData.error && ingredients.length === 0) {
      setIngredients(ingredientsData.data || []);
    }
  }, [ingredientsData]);

  useEffect(() => {
    if (inventoryData && inventoryItems.length === 0) {
      if (Array.isArray(inventoryData)) {
        setInventoryItems(inventoryData);
      } else if (inventoryData && Array.isArray(inventoryData.data)) {
        setInventoryItems(inventoryData.data);
      }
    }
  }, [inventoryData]);

  useEffect(() => {
    if (categories.length > 0) setCategoryOptions(categories);
  }, [categories]);

  useEffect(() => {
    if (subCategories.length > 0) setSubCategoryOptions(subCategories);
  }, [subCategories]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!subCategoryWrapperRef.current?.contains(event.target)) {
        setIsSubCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateForm = () => {
    const nextErrors = {};
    const normalizedSubCategory = normalizeSubCategory(subCategory);
    const parsedPrice = Number(basePrice);
    const parsedPreparationTime = Number(preparationTime);

    if (itemName.trim().length < 2) nextErrors.itemName = 'Item name must be at least 2 characters.';
    if (!categoryId) nextErrors.categoryId = 'Please select a category.';
    if (!normalizedSubCategory) nextErrors.subCategory = 'Subcategory is required.';
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) nextErrors.basePrice = 'Base price must be greater than 0.';
    if (!Number.isFinite(parsedPreparationTime) || parsedPreparationTime <= 0) nextErrors.preparationTime = 'Preparation time must be greater than 0.';
    if (!imageData?.secure_url) nextErrors.image = 'Please upload an item image.';

    setErrors(nextErrors);
    return { isValid: Object.keys(nextErrors).length === 0, normalizedSubCategory };
  };

  const handleSaveChanges = async () => {
    const { isValid, normalizedSubCategory } = validateForm();
    if (!isValid) return;

    const selectedCategory = categories.find((c) => String(c.id) === String(categoryId) || c.name === categoryId);
    if (selectedCategory && selectedCategory.status === 'INACTIVE') {
      toast.error('Cannot save a menu item in an INACTIVE category.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payloadToSend = {
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
      };
      
      const updatedItem = await updateMenuItemAPI(itemId, payloadToSend);

      await saveMenuItemIngredientsAPI(itemId, ingredients);

      queryClient.setQueryData(['menuItems'], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((item) => (String(item.id) === String(itemId) ? { ...item, ...payloadToSend, ...updatedItem } : item));
      });
      
      queryClient.setQueryData(['menuItem', itemId], (oldItem) => {
        if (!oldItem) return oldItem;
        return { ...oldItem, ...payloadToSend, ...updatedItem };
      });

      await queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      await queryClient.invalidateQueries({ queryKey: ['menuItem', itemId] });
      await queryClient.invalidateQueries({ queryKey: ['menuCounts'] });

      if (mode === 'direct') {
        toast.success('Menu item updated successfully!');
        if (onApprove) onApprove();
        onClose();
      } else {
        toast.success('Menu item updated successfully! You can now approve the request.');
        setIsSaveSuccessful(true);
      }
    } catch (error) {
      toast.error(error.message || 'Unable to update menu item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMetaLoading = isCategoriesLoading;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="bg-[#FAFAFA] font-sans w-full max-w-6xl my-8 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-gray-100 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {mode === 'request' ? 'Edit Menu Item & Approve' : 'Edit Menu Item'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {mode === 'request' ? `Review Chef ${request.chefName}'s request and edit details.` : 'Update the menu item details directly.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
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
            {mode === 'request' && (
              <button
                onClick={() => onApprove(request)}
                disabled={!isSaveSuccessful}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={!isSaveSuccessful ? 'Save changes first before approving' : 'Approve the update request'}
              >
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 ml-2">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {isItemLoading ? (
            <p className="text-center text-gray-500 text-sm">Loading menu item...</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              
              {/* Left Column */}
              <div className="flex flex-col gap-6">
                <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                      <CircleDot size={16} className="text-orange-500" />
                    </div>
                    <h2 className="text-base font-bold text-gray-900">General Information</h2>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name</label>
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all ${errors.itemName ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.itemName && <p className="mt-1 text-xs text-red-600">{errors.itemName}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <select
                        value={categoryId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setCategoryId(id);
                          setCategoryName(categoryOptions.find((c) => String(c.id) === id)?.name || '');
                          setSubCategory('');
                        }}
                        className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 transition-all appearance-none cursor-pointer ${errors.categoryId ? 'border-red-300' : 'border-gray-200'}`}
                        disabled={isMetaLoading}
                      >
                        <option value="">Select category</option>
                        {categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                        className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 transition-all ${errors.subCategory ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      {isSubCategoryOpen && subCategorySuggestions.length > 0 && (
                        <div className="absolute z-20 mt-2 max-h-52 w-full overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                          {subCategorySuggestions.map((entry) => (
                            <button
                              key={entry}
                              type="button"
                              className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-orange-50"
                              onMouseDown={(e) => {
                                e.preventDefault();
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
                        min="0" step="0.01"
                        className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 transition-all ${errors.basePrice ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      {errors.basePrice && <p className="mt-1 text-xs text-red-600">{errors.basePrice}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Prep Time (min)</label>
                      <input
                        type="number"
                        value={preparationTime}
                        onChange={(e) => setPreparationTime(e.target.value)}
                        min="1" step="1"
                        className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 transition-all ${errors.preparationTime ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      {errors.preparationTime && <p className="mt-1 text-xs text-red-600">{errors.preparationTime}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-8">
                  <IngredientPicker ingredients={ingredients} inventoryItems={inventoryItems} onChange={setIngredients} />
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-6">
                <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Item Image</h2>
                  <CloudinaryImageUpload
                    initialValue={imageData}
                    onChange={(res) => setImageData(res)}
                    className="w-full"
                  />
                  {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
                </div>

                <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Visibility</h2>
                  <div className="flex flex-col gap-1">
                    {visibilityOptions.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => setVisibility(opt.label)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${visibility === opt.label ? 'bg-orange-50 text-orange-500 border border-orange-200' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}
                      >
                        <span>{opt.label}</span>
                        {visibility === opt.label && <CheckCircle2 size={18} className="text-orange-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
