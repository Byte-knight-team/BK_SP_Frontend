import React, { useState, useMemo, useEffect } from 'react';
import { Search, Pencil, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ToggleSwitch from '../../../../components/ui/ToggleSwitch';
import Pagination from '../../../../components/ui/Pagination';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const CouponTable = ({ coupons, isLoading, onEdit, onToggleStatus, isToggling }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isExpired = (coupon) => {
    if (!coupon.endDate) return false;
    // Set hours to 0 to compare dates accurately
    const end = new Date(coupon.endDate.replace('T', ' ').replace(/-/g, '/').replace('Z', ''));

    return end.getTime() < new Date().getTime();
  };

  const isScheduled = (coupon) => {
    if (!coupon.startDate) return false;
    const start = new Date(coupon.startDate.replace('T', ' ').replace(/-/g, '/').replace('Z', ''));
    return start.getTime() > new Date().getTime();
  };

  // Memoized filtering
  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const matchesSearch = !search || 
        (c.code && c.code.toLowerCase().includes(search.toLowerCase())) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()));
      
      const expired = isExpired(c);
      const scheduled = c.status === 'SCHEDULED' || (c.status === 'ACTIVE' && isScheduled(c));
      
      let matchesStatus = false;
      if (statusFilter === 'ALL') {
        matchesStatus = true;
      } else if (statusFilter === 'EXPIRED') {
        matchesStatus = expired;
      } else if (statusFilter === 'SCHEDULED') {
        matchesStatus = scheduled && !expired;
      } else if (statusFilter === 'ACTIVE') {
        matchesStatus = c.status === 'ACTIVE' && !scheduled && !expired;
      } else if (statusFilter === 'INACTIVE') {
        matchesStatus = c.status === 'INACTIVE' && !expired;
      }
      
      return matchesSearch && matchesStatus;
    });
  }, [coupons, search, statusFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, pageSize]);

  const totalPages = filteredCoupons.length === 0 ? 0 : Math.ceil(filteredCoupons.length / pageSize);
  const safeCurrentPage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedCoupons = useMemo(() => {
    return filteredCoupons.slice(startIndex, endIndex);
  }, [filteredCoupons, startIndex, endIndex]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input 
              type="text" 
              placeholder="Search coupons by code or description..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full cursor-pointer rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="INACTIVE">Inactive</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-3 shadow-sm">
        {isLoading ? (
          <div className="py-10 text-center text-gray-500 text-sm font-medium">Loading coupons...</div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-sm font-medium">
            {search ? "No matching coupons found." : "No coupons available."}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">Code</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">Discount</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">Usage Limit</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">Used</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">Expiration</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCoupons.map(coupon => (
                  <tr 
                    key={coupon.id} 
                    onClick={() => navigate(coupon.id.toString())}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4 align-middle">
                      <div className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                        {coupon.code}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-[200px]" title={coupon.description}>
                        {coupon.description}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle font-medium text-gray-900">
                      {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}%` : `Rs.${coupon.discountValue}`}
                    </td>
                    <td className="px-5 py-4 align-middle text-sm text-gray-700">
                      {coupon.usageLimit ? coupon.usageLimit : <span className="text-gray-400 italic">Unlimited</span>}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-2 py-1 rounded font-semibold text-xs">
                        {coupon.usedCount || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle text-sm text-gray-700 whitespace-nowrap">
                      {coupon.endDate ? new Date(coupon.endDate.replace('T', ' ').replace(/-/g, '/').replace('Z', '')).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                    </td>
                    <td className="px-5 py-4 align-middle text-center">
                      {isExpired(coupon) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                          Expired
                        </span>
                      ) : (coupon.status === 'SCHEDULED' || (coupon.status === 'ACTIVE' && isScheduled(coupon))) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                          Scheduled
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          coupon.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {coupon.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 pr-6 align-middle text-right">
                      <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                        <ToggleSwitch 
                          checked={(coupon.status === 'ACTIVE' || coupon.status === 'SCHEDULED') && !isExpired(coupon)} 
                          onChange={() => onToggleStatus(coupon)} 
                          disabled={isToggling || isExpired(coupon)}
                        />
                        <button 
                          onClick={() => onEdit(coupon)}
                          className="inline-flex items-center justify-center rounded-lg border p-1.5 transition-colors border-gray-200 bg-white text-gray-400 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                          title="Edit Coupon"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredCoupons.length > 0 && (
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            totalItems={filteredCoupons.length}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        )}
      </div>
    </div>
  );
};

export default CouponTable;



