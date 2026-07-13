import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  RiAddLine,
  RiSearchLine,
  RiFilter3Line,
  RiEditLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "@remixicon/react";
import { getMenuCategoriesAPI, toggleMenuCategoryStatusAPI } from "../../apis/admin/menu";
import { toast } from "react-toastify";

export default function CategoryManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const data = await getMenuCategoriesAPI();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((c) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleMenuCategoryStatusAPI(id, !currentStatus);
      setCategories((prevCategories) =>
        prevCategories.map((c) =>
          c.id === id ? { ...c, isActive: !currentStatus } : c
        )
      );
      toast.success("Category status updated successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to update category status.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all menu categories. Categories are global and available in all branches.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors"
        >
          <RiAddLine size={18} />
          Create Category
        </button>
      </div>

      {/* Main Content Card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Search and Filter */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full sm:max-w-md">
            <RiSearchLine
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-50"
            />
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto">
            <RiFilter3Line size={18} />
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600">Category Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 w-full">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{category.description}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors" title="Edit Category">
                        <RiEditLine size={18} />
                      </button>
                      <button
                        title={category.isActive ? "Deactivate Category" : "Activate Category"}
                        onClick={() => handleToggleStatus(category.id, category.isActive)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${category.isActive ? 'bg-orange-500' : 'bg-gray-200'}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${category.isActive ? 'translate-x-4' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-gray-100 bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div>
            Showing {filteredCategories.length} categories
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button className="p-1 rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-50" disabled>
                <RiArrowLeftSLine size={20} />
              </button>
              <button className="px-3 py-1 rounded-md border border-orange-200 text-orange-600 font-medium">
                1
              </button>
              <button className="p-1 rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-50" disabled>
                <RiArrowRightSLine size={20} />
              </button>
            </div>
            <select className="border border-gray-200 rounded-md py-1.5 px-3 text-sm text-gray-700 outline-none hover:border-gray-300">
              <option>10 / page</option>
              <option>20 / page</option>
              <option>50 / page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
