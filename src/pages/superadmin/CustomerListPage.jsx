// src/pages/superadmin/CustomerListPage.jsx

import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  RiSearchLine,
  RiUserLine,
  RiEyeLine,
  RiForbid2Line,
  RiCheckboxCircleLine,
} from "@remixicon/react";

import { useAuth } from "../../context/AuthContext";
import {
  getCustomersAPI,
  activateCustomerAPI,
  deactivateCustomerAPI,
} from "../../apis/staff/customers";

export default function CustomerListPage() {
  const { user } = useAuth();

  /*
    Some projects store role as user.role.
    Some store it as user.roleName.
    This supports both.
  */
  const userRole = user?.role || user?.roleName;
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  /*
    This safely supports your MainLayout page header.
    If your layout does not provide setPageTitle, this will not crash.
  */
  const outletContext = useOutletContext() || {};
  const { setPageTitle } = outletContext;

  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setPageTitle?.("Customer Management");
  }, [setPageTitle]);

  useEffect(() => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    loadCustomers();
  }, [isSuperAdmin]);

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomersAPI();
      setCustomers(data);
    } catch (err) {
      setError(err.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleCustomerStatus(customer) {
    const actionText = customer.active ? "deactivate" : "activate";

    // Toggle confirmation popup
    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${customer.fullName}?`
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(customer.id);

      if (customer.active) {
        await deactivateCustomerAPI(customer.id);
      } else {
        await activateCustomerAPI(customer.id);
      }

      /*
        Update the UI immediately after dummy API/action success.
        Later this will also work with real backend APIs.
      */
      setCustomers((previousCustomers) =>
        previousCustomers.map((item) =>
          item.id === customer.id
            ? { ...item, active: !item.active }
            : item
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update customer status.");
    } finally {
      setActionLoadingId(null);
    }
  }

  const filteredCustomers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        customer.fullName?.toLowerCase().includes(keyword) ||
        customer.email?.toLowerCase().includes(keyword) ||
        customer.phone?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && customer.active) ||
        (statusFilter === "INACTIVE" && !customer.active);

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchText, statusFilter]);

  function formatDate(value) {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  }

  if (!isSuperAdmin) {
    return (
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-sm text-gray-500 mt-2">
          Customer management is restricted to SUPER_ADMIN users.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gray-100 flex items-center justify-center">
                <RiUserLine className="h-5 w-5 text-gray-700" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Customer Management
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  View customers and manage customer account status.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={loadCustomers}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Reload
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 mt-6">
          <div className="relative">
            <RiSearchLine className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search by name, email, or phone"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-gray-200"
          >
            <option value="ALL">All Customers</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[1.5rem] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading customers...</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Customer
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Phone
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Created
                  </th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/70">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {customer.fullName}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {customer.email}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {customer.phone || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          customer.active
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {customer.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(customer.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/staff/customers/${customer.id}`}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <RiEyeLine className="h-4 w-4" />
                          View
                        </Link>

                        <button
                          type="button"
                          disabled={actionLoadingId === customer.id}
                          onClick={() => handleToggleCustomerStatus(customer)}
                          className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium disabled:opacity-60 ${
                            customer.active
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          {customer.active ? (
                            <RiForbid2Line className="h-4 w-4" />
                          ) : (
                            <RiCheckboxCircleLine className="h-4 w-4" />
                          )}

                          {customer.active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}