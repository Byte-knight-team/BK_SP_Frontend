import React, { useState } from 'react';
import { ArrowLeft, CircleDot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createMenuCategoryAPI } from '../../apis/admin/menu';

// Super Admin page for creating a new menu category.
export default function AddCategoryPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const nextErrors = {};

    if (name.trim().length < 2) {
      nextErrors.name = 'Category name must be at least 2 characters.';
    }

    if (description.trim().length > 0 && description.trim().length < 10) {
      nextErrors.description = 'Description must be at least 10 characters if provided.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreateCategory = async () => {
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createMenuCategoryAPI({
        name: name.trim(),
        description: description.trim(),
      });

      navigate('/admin/menu');
    } catch (error) {
      setApiError(error.message || 'Unable to create category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/menu');
  };

  return (
    <div className="bg-[#FAFAFA] font-sans px-10 pb-10">
          <div className="flex items-center justify-between mb-8 mt-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/menu')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Category</h1>
                <p className="text-gray-500 text-sm mt-1">Create a new category for your menu items</p>
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
                onClick={handleCreateCategory}
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </div>

          {apiError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiError}
            </div>
          )}

          <div className="max-w-3xl">
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <CircleDot size={16} className="text-orange-500" />
                </div>
                <h2 className="text-base font-bold text-gray-900">Category Details</h2>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Beverages"
                  className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the category..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all resize-none ${errors.description ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
              </div>
            </div>
          </div>
    </div>
  );
}
