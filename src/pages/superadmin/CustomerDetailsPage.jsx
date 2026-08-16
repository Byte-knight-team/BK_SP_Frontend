import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiUserHeartLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiShieldCheckLine,
  RiMoneyDollarCircleLine,
  RiStarLine,
  RiCalendarLine,
  RiErrorWarningLine,
} from "@remixicon/react";

import { getCustomerByIdAPI } from "../../apis/staff/customers";
import { showErrorToast } from "../../utils/toast";

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const { setHeaderInfo } = useOutletContext();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    setHeaderInfo({
      title: "Customer Details",
      description: "View customer account information.",
      Icon: RiUserHeartLine,
    });

    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  const loadCustomer = useCallback(async () => {
    setLoading(true);
    setPageError("");

    const { data, error } = await getCustomerByIdAPI(id);

    if (error) {
      setPageError(error);
      setCustomer(null);
      showErrorToast(error);
    } else {
      setCustomer(data);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  if (loading) {
    return (
      <div className="max-w-5xl">
        <div className="flex min-h-[clamp(24rem,calc(100vh-15rem),44rem)] items-center justify-center rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <CustomerDetailsState
            Icon={RiUserHeartLine}
            title="Loading customer details"
            description="Please wait while the customer account information is loaded."
            iconClassName="bg-gray-100 text-gray-600"
            loading
          />
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="max-w-5xl">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <BackToCustomerListLink />

          <CustomerDetailsState
            Icon={RiErrorWarningLine}
            title="Could not load customer details"
            description={pageError}
            iconClassName="bg-red-50 text-red-600"
          />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-5xl">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <BackToCustomerListLink />

          <CustomerDetailsState
            Icon={RiUserHeartLine}
            title="Customer not found"
            description="The selected customer account could not be found."
            iconClassName="bg-gray-100 text-gray-600"
          />
        </div>
      </div>
    );
  }

  const isActive = isCustomerActive(customer);

  return (
    <div className="max-w-5xl">
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        <BackToCustomerListLink />

        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900">
                {customer.fullName || customer.username || "No customer name"}
              </h3>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              @{customer.username || "no-username"} • Customer ID #
              {customer.customerId || customer.id || "N/A"}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-800">
            View only. Customer details cannot be edited by Super Admin.
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <DetailCard
            icon={RiMailLine}
            label="Email"
            value={customer.email || "No email"}
          />

          <DetailCard
            icon={RiPhoneLine}
            label="Phone"
            value={customer.phone || "No phone"}
          />

          <DetailCard
            icon={RiShieldCheckLine}
            label="Email Verified"
            value={customer.emailVerified ? "Yes" : "No"}
          />

          <DetailCard
            icon={RiShieldCheckLine}
            label="Phone Verified"
            value={customer.phoneVerified ? "Yes" : "No"}
          />

          <DetailCard
            icon={RiStarLine}
            label="Loyalty Points"
            value={`${customer.loyaltyPoints ?? 0} points`}
          />

          <DetailCard
            icon={RiMoneyDollarCircleLine}
            label="Total Spent"
            value={formatMoney(customer.totalSpent)}
          />

          <DetailCard
            icon={RiCalendarLine}
            label="Created At"
            value={formatDateTime(customer.createdAt)}
          />

          <DetailCard
            icon={RiCalendarLine}
            label="Updated At"
            value={formatDateTime(customer.updatedAt)}
          />

          <DetailCard
            icon={RiMapPinLine}
            label="Address"
            value={customer.address || "No address"}
            wide
          />
        </div>
      </div>
    </div>
  );
}

function BackToCustomerListLink() {
  return (
    <div className="mb-6">
      <Link
        to="/staff/customers"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600"
      >
        <RiArrowLeftLine size={18} />
        Back to customer list
      </Link>
    </div>
  );
}

function CustomerDetailsState({
  Icon,
  title,
  description,
  iconClassName,
  loading = false,
}) {
  return (
    <div className="text-center">
      <div
        className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${iconClassName}`}
      >
        {loading ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-orange-500" />
        ) : (
          <Icon size={24} />
        )}
      </div>

      <h3 className="font-semibold text-gray-900">{title}</h3>

      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

function DetailCard({ icon: Icon, label, value, wide = false }) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 ${
        wide ? "md:col-span-2" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {label}
          </div>

          <div className="mt-1 break-words text-sm font-semibold text-gray-900">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function isCustomerActive(customer) {
  if (typeof customer?.active === "boolean") return customer.active;
  if (typeof customer?.isActive === "boolean") return customer.isActive;
  if (typeof customer?.enabled === "boolean") return customer.enabled;

  const status = String(customer?.status || customer?.accountStatus || "")
    .trim()
    .toUpperCase();

  if (status === "ACTIVE") return true;
  if (status === "INACTIVE") return false;

  return false;
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "LKR 0";
  }

  return `LKR ${Number(value).toLocaleString()}`;
}

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString();
}
