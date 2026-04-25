import React from 'react';
import { 
  Search, Filter, MoreVertical, Shield, 
  CheckCircle2, XCircle, Pencil, Trash2, UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

export default function UserManagementPage() {
  const users = [
    {
      id: 1,
      name: 'Vibhath Kalsara',
      email: 'shiranthi.r@cravehouse.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2 hours ago',
      initial: 'S'
    },
    {
      id: 2,
      name: 'Dileepa Prabhath',
      email: 'm.rajapksha@cravehouse.com',
      role: 'Chief Chef',
      status: 'Active',
      lastLogin: '10 mins ago',
      initial: 'M'
    },
    {
      id: 3,
      name: 'Venuri Perera',
      email: 'namal.r@cravehouse.com',
      role: 'Receptionist',
      status: 'Active',
      lastLogin: '1 day ago',
      initial: 'E'
    },
    {
      id: 4,
      name: 'Ashen Randira',
      email: 'basil.r@cravehouse.com',
      role: 'Manager',
      status: 'Inactive',
      lastLogin: '3 days ago',
      initial: 'D'
    },
    {
      id: 5,
      name: 'Isuru Adikaram',
      email: 'gotabaya.r@cravehouse.com',
      role: 'Delivery Driver',
      status: 'Active',
      lastLogin: '5 mins ago',
      initial: 'J'
    },
    {
      id: 6,
      name: 'Thilakarathna Dilshan',
      email: 'r.rajapaksha@cravehouse.com',
      role: 'Deliver Driver',
      status: 'Active',
      lastLogin: '4 hours ago',
      initial: 'R'
    }
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans">
      <AdminSidebar activePage="/admin/users" />

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
        <AdminHeader />

        <div className="flex-1 overflow-y-auto px-10 pb-10">
          
          {/* Page Title & Actions */}
          <div className="flex items-center justify-between mt-2 mb-8">
            <div>
              <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">User Management</h1>
              <p className="text-gray-500 text-sm mt-1">Manage staff access and permissions</p>
            </div>
            <Link to="/admin/users/add" className="bg-[#FF6B00] hover:bg-[#e66000] text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-md shadow-orange-500/20 transition-all">
              <UserPlus size={18} />
              Add New User
            </Link>
          </div>

          {/* Search and Filter Row */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 flex items-center bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
              <Search size={18} className="text-gray-400 mr-3" />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400" 
              />
            </div>
            
            <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-600 shadow-sm transition-colors">
              <Filter size={20} />
            </button>
            <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-600 shadow-sm transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>

          {/* Users Table Core */}
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[35%]">User</th>
                    <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[20%]">Role</th>
                    <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[15%]">Status</th>
                    <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[20%]">Last Login</th>
                    <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right w-[10%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[#FF6B00] bg-[#FFF2E5] flex-shrink-0">
                            {user.initial}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{user.name}</div>
                            <div className="flex items-center text-xs text-gray-500 mt-0.5">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 opacity-70"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center text-sm font-medium text-gray-600 gap-2">
                          <Shield size={14} className="text-gray-400" />
                          {user.role}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {user.status === 'Active' ? (
                          <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 border border-green-100/50 px-2.5 py-1 rounded-lg text-xs font-semibold">
                            <CheckCircle2 size={14} /> Active
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-500 border border-gray-100 px-2.5 py-1 rounded-lg text-xs font-semibold">
                            <XCircle size={14} /> Inactive
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-500 font-medium">
                          {user.lastLogin}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button className="text-gray-400 hover:text-[#FF6B00] transition-colors">
                            <Pencil size={18} />
                          </button>
                          <button className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
