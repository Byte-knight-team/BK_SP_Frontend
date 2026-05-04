// src/pages/superadmin/CustomerDetailsPage.jsx

import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiUserLine,
  RiForbid2Line,
  RiCheckboxCircleLine,
  RiMapPinLine,
} from "@remixicon/react";

import { useAuth } from "../../context/AuthContext";
import {
  getCustomerByIdAPI,
  activateCustomerAPI,
  deactivateCustomerAPI,
} from "../../apis/staff/customers";

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const userRole = user?.role || user?.roleName;
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const outletContext = useOutletContext() || {};
  const { setPageTitle } = outletContext;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPageTitle?.("Customer Details");
  }, [setPageTitle]);

  useEffect(() => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    loadCustomer();
  }, [id, isSuperAdmin]);

  async function loadCustomer() {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomerByIdAPI(id);
      setCustomer(data);
    } catch (err) {
      setError(err.message || "Failed to load customer details.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus() {
    if (!customer) return;

    const actionText = customer.active ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${customer.fullName}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      if (customer.active) {
        await deactivateCustomerAPI(customer.id);
      } else {
        await activateCustomerAPI(customer.id);
      }

      setCustomer((previousCustomer) => ({
        ...previousCustomer,
        active: !previousCustomer.active,
      }));
    } catch (err) {
      alert(err.message || "Failed to update customer status.");
    } finally {
      setActionLoading(false);
    }
  }

  function formatDate(value) {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (!isSuperAdmin) {
    return (
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-sm text-gray-500 mt-2">
          Customer details are restricted to SUPER_ADMIN users.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm text-sm text-gray-500">
        Loading customer details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm">
        <p className="text-sm text-red-600">{error}</p>

        <Link
          to="/staff/customers"
          className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <RiArrowLeftLine className="h-4 w-4" />
          Back to Customers
        </Link>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm text-sm text-gray-500">
        Customer not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/staff/customers"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <RiArrowLeftLine className="h-4 w-4" />
        Back to Customers
      </Link>

      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <RiUserLine className="h-7 w-7 text-gray-700" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {customer.fullName}
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Customer ID: {customer.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={actionLoading}
            onClick={handleToggleStatus}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-60 ${
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

            {customer.active ? "Deactivate Customer" : "Activate Customer"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Customer Information
          </h2>

          <div className="mt-5 space-y-4">
            <InfoRow label="Full Name" value={customer.fullName} />
            <InfoRow label="Email" value={customer.email} />
            <InfoRow label="Phone" value={customer.phone || "-"} />
            <InfoRow
              label="Status"
              value={customer.active ? "Active" : "Inactive"}
            />
            <InfoRow label="Created At" value={formatDate(customer.createdAt)} />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <RiMapPinLine className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">
              Saved Addresses
            </h2>
          </div>

          {customer.addresses?.length > 0 ? (
            <div className="mt-5 space-y-3">
              {customer.addresses.map((address) => (
                <div
                  key={address.id}
                  className="border border-gray-100 rounded-2xl p-4"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {address.label || "Address"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {address.addressLine}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {address.city}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-5">
              No saved addresses available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-b-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}