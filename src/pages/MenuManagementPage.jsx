import React, { useState } from 'react';
import {
  Flame, LayoutDashboard, Users, Utensils, LayoutGrid, Settings,
  Search, Bell, HelpCircle, LogOut, Eye, MoreHorizontal, Plus
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

export default function MenuManagementPage() {
  const menuItems = [
    {
      id: 1,
      name: "Classic Cheese Burger",
      category: "BURGERS",
      price: "1290",
      popular: "95%",
      status: "ACTIVE",
      image: "https://cdn.prod.website-files.com/65fc1fa2c1e7707c3f051466/69263773f626fe9424210272_750f721e-ad71-4daa-8601-bc3c78b9587d.webp",
    },
    {
      id: 2,
      name: "Peppeoni Pizza",
      category: "PIZZA",
      price: "1650",
      popular: "88%",
      status: "ACTIVE",
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVwcGVyb25pJTIwcGl6emF8ZW58MHx8MHx8fDA=",
    },
    {
      id: 3,
      name: "Iced Caramel Latte",
      category: "DRINKS",
      price: "550",
      popular: "80%",
      status: "OUT OF STOCK",
      image: "https://dwellbymichelle.com/wp-content/uploads/2020/06/DWELL-Iced-Cold-Brew-Latte-e1592262551330.jpg",
    },
    {
      id: 4,
      name: "Caesar Salad",
      category: "SALADS",
      price: "990",
      popular: "65%",
      status: "ACTIVE",
      image: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQP33tR43CcQ8drkc9_Ya5BuOwKSwO0nmmy-WjHT9yyy-SSZGDE",
    },
    {
      id: 5,
      name: "Chocolate Lava Cake",
      category: "DESSERTS",
      price: "850",
      popular: "92%",
      status: "DRAFT",
      image: "https://karenehman.com/wp-content/uploads/2024/10/Hot-Fudge-Sundae-Cake-Take-two.jpg",
    }
  ];

  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredMenuItems = menuItems.filter(item => {
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = item.status === 'ACTIVE';
    else if (statusFilter === 'out_of_stock') matchesStatus = item.status === 'OUT OF STOCK';
    else if (statusFilter === 'draft') matchesStatus = item.status === 'DRAFT';

    let matchesCategory = true;
    if (activeCategory !== "All") {
      matchesCategory = item.category.toUpperCase() === activeCategory.toUpperCase();
    }

    return matchesStatus && matchesCategory;
  });

  const categories = ["All", "Burgers", "Pizza", "Pasta", "Salads", "Desserts", "Drinks"];

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-[#1bc165] text-white';
      case 'OUT OF STOCK': return 'bg-[#ea580c] text-white';
      case 'DRAFT': return 'bg-[#6b7280] text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

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
        <div className="flex-1 overflow-y-auto px-10 pb-10">

          {/* Menu Management Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Menu Management</h1>
              <p className="text-gray-500 text-sm mt-1">Create and organize your restaurant menu</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-white hover:bg-gray-50 text-gray-800 font-semibold px-5 py-2.5 rounded-xl border border-gray-200 text-sm transition-colors shadow-sm">
                Manage Categories
              </button>
              <Link to="/admin/menu/add" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all no-underline">
                <Plus size={18} />
                Add New Item
              </Link>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 custom-scrollbar">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category
                    ? 'bg-black text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="bg-white border border-gray-100 rounded-2xl p-3 mb-8 shadow-sm">
            <div className="flex items-center px-2">
              <Search size={20} className="text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search items..."
                className="w-full bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Grid of Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMenuItems.map((item) => (
              <div key={item.id} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                {/* Image Section */}
                <div className="relative h-[200px] w-full overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${getStatusColor(item.status)}`}>
                    {item.status}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-bold text-orange-500 tracking-wider flex-1 uppercase">{item.category}</span>
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-gray-900 text-base leading-tight flex-1 pr-2">{item.name}</h3>
                    <div className="text-right">
                      <div className="text-[11px] font-bold text-gray-500 uppercase leading-none mb-1">LKR</div>
                      <div className="font-bold text-gray-900 text-lg leading-none">{item.price}</div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center text-gray-400 gap-1.5">
                      <Eye size={14} />
                      <span className="text-xs font-medium">{item.popular} Popular</span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
