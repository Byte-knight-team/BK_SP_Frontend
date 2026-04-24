// src/pages/superadmin/SystemConfigPage.jsx

import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  RiErrorWarningLine,
  RiGiftLine,
  RiPercentLine,
  RiRefreshLine,
  RiSaveLine,
  RiSettings3Line,
  RiShieldKeyholeLine,
} from "@remixicon/react";

import {
  getGlobalConfigAPI,
  updateGlobalConfigAPI,
} from "../../apis/staff/systemConfig";

/**
 * Default form values for global system configuration.
 *
 * orderCancelWindowMinutes is intentionally hidden from the UI.
 * Backend still has this field, so we preserve it when saving.
 */
const DEFAULT_FORM = {
  taxEnabled: false,
  taxPercentage: 0,

  serviceChargeEnabled: false,
  serviceChargePercentage: 0,

  loyaltyEnabled: false,
  pointsPerAmount: 0,
  amountPerPoint: 0,
  minPointsToRedeem: 0,
  valuePerPoint: 0,

  // Hidden backend field. Do not show this in frontend for now.
  orderCancelWindowMinutes: 10,
};

/**
 * Safely read logged-in user from localStorage.
 */
function getStoredAuthUser() {
  try {
    const rawUser = localStorage.getItem("authUser");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Support both possible role fields from login response.
 */
function getUserRoleName(user) {
  return user?.roleName || user?.role || "";
}

/**
 * Convert input values to numbers before sending to backend.
 */
function toNumber(value) {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return 0;
  }

  return numberValue;
}

export default function SystemConfigPage() {
  const outletContext = useOutletContext();

  // MainLayout provides setHeaderInfo through Outlet context.
  const setHeaderInfo = outletContext?.setHeaderInfo;

  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const authUser = useMemo(() => getStoredAuthUser(), []);
  const roleName = getUserRoleName(authUser);

  // Global system configuration is SUPER_ADMIN only.
  const isSuperAdmin = roleName === "SUPER_ADMIN";

  /**
   * Set page header inside the shared layout.
   */
  useEffect(() => {
    if (setHeaderInfo) {
      setHeaderInfo({
        title: "System Configuration",
        subtitle: "Manage global tax, service charge, and loyalty rules.",
      });
    }
  }, [setHeaderInfo]);

  /**
   * Load global configuration from backend.
   */
  useEffect(() => {
    async function loadGlobalConfig() {
      try {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const data = await getGlobalConfigAPI();

        setFormData({
          taxEnabled: Boolean(data?.taxEnabled),
          taxPercentage: data?.taxPercentage ?? 0,

          serviceChargeEnabled: Boolean(data?.serviceChargeEnabled),
          serviceChargePercentage: data?.serviceChargePercentage ?? 0,

          loyaltyEnabled: Boolean(data?.loyaltyEnabled),
          pointsPerAmount: data?.pointsPerAmount ?? 0,
          amountPerPoint: data?.amountPerPoint ?? 0,
          minPointsToRedeem: data?.minPointsToRedeem ?? 0,
          valuePerPoint: data?.valuePerPoint ?? 0,

          // Preserve hidden backend field.
          orderCancelWindowMinutes: data?.orderCancelWindowMinutes ?? 10,
        });

        setLastUpdatedAt(data?.updatedAt || null);
      } catch (error) {
        setErrorMessage(error.message || "Failed to load global configuration.");
      } finally {
        setLoading(false);
      }
    }

    // Do not call backend for users who should not access this page.
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    loadGlobalConfig();
  }, [isSuperAdmin]);

  /**
   * Handle number input changes.
   */
  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  /**
   * Handle checkbox changes.
   */
  function handleCheckboxChange(event) {
    const { name, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: checked,
    }));
  }

  /**
   * Save global configuration.
   */
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        taxEnabled: Boolean(formData.taxEnabled),
        taxPercentage: toNumber(formData.taxPercentage),

        serviceChargeEnabled: Boolean(formData.serviceChargeEnabled),
        serviceChargePercentage: toNumber(formData.serviceChargePercentage),

        loyaltyEnabled: Boolean(formData.loyaltyEnabled),
        pointsPerAmount: toNumber(formData.pointsPerAmount),
        amountPerPoint: toNumber(formData.amountPerPoint),
        minPointsToRedeem: toNumber(formData.minPointsToRedeem),
        valuePerPoint: toNumber(formData.valuePerPoint),

        // Hidden field kept only for backend compatibility.
        orderCancelWindowMinutes: toNumber(formData.orderCancelWindowMinutes),
      };

      const updatedData = await updateGlobalConfigAPI(payload);

      setSuccessMessage("Global system configuration updated successfully.");

      if (updatedData?.updatedAt) {
        setLastUpdatedAt(updatedData.updatedAt);
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to update global configuration.");
    } finally {
      setSaving(false);
    }
  }

  /**
   * Reload global config from backend.
   */
  async function handleReload() {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const data = await getGlobalConfigAPI();

      setFormData({
        taxEnabled: Boolean(data?.taxEnabled),
        taxPercentage: data?.taxPercentage ?? 0,

        serviceChargeEnabled: Boolean(data?.serviceChargeEnabled),
        serviceChargePercentage: data?.serviceChargePercentage ?? 0,

        loyaltyEnabled: Boolean(data?.loyaltyEnabled),
        pointsPerAmount: data?.pointsPerAmount ?? 0,
        amountPerPoint: data?.amountPerPoint ?? 0,
        minPointsToRedeem: data?.minPointsToRedeem ?? 0,
        valuePerPoint: data?.valuePerPoint ?? 0,

        // Preserve hidden backend field.
        orderCancelWindowMinutes: data?.orderCancelWindowMinutes ?? 10,
      });

      setLastUpdatedAt(data?.updatedAt || null);
    } catch (error) {
      setErrorMessage(error.message || "Failed to reload global configuration.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Clean no-access screen for ADMIN and other roles.
   */
  if (!isSuperAdmin) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-red-50 p-3 text-red-600">
            <RiShieldKeyholeLine size={26} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">No Access</h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              System Configuration is available only for SUPER_ADMIN users.
              ADMIN users should not update global business rules.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Loading screen.
   */
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-gray-600">
          <RiRefreshLine className="animate-spin" size={22} />
          <span className="text-sm font-medium">
            Loading global system configuration...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page summary card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-50 p-3 text-blue-600">
              <RiSettings3Line size={26} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Global System Configuration
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Configure system-wide tax, service charge, and loyalty rules.
              </p>

              {lastUpdatedAt && (
                <p className="mt-2 text-xs text-gray-400">
                  Last updated: {lastUpdatedAt}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleReload}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <RiRefreshLine size={18} />
            Reload
          </button>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <RiErrorWarningLine size={20} className="mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tax and service charge section */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-orange-50 p-2 text-orange-600">
              <RiPercentLine size={22} />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Tax & Service Charge
              </h3>

              <p className="text-sm text-gray-500">
                Configure system-wide percentage-based charges.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Tax card */}
            <div className="rounded-xl border border-gray-100 p-4">
              <label className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-semibold text-gray-800">
                    Enable Tax
                  </span>

                  <p className="mt-1 text-xs text-gray-500">
                    Turn tax calculation on or off globally.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="taxEnabled"
                  checked={formData.taxEnabled}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 rounded border-gray-300"
                />
              </label>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tax Percentage
                </label>

                <input
                  type="number"
                  name="taxPercentage"
                  value={formData.taxPercentage}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  disabled={!formData.taxEnabled}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            </div>

            {/* Service charge card */}
            <div className="rounded-xl border border-gray-100 p-4">
              <label className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-semibold text-gray-800">
                    Enable Service Charge
                  </span>

                  <p className="mt-1 text-xs text-gray-500">
                    Turn service charge calculation on or off globally.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="serviceChargeEnabled"
                  checked={formData.serviceChargeEnabled}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 rounded border-gray-300"
                />
              </label>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Service Charge Percentage
                </label>

                <input
                  type="number"
                  name="serviceChargePercentage"
                  value={formData.serviceChargePercentage}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  disabled={!formData.serviceChargeEnabled}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loyalty section */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-purple-50 p-2 text-purple-600">
              <RiGiftLine size={22} />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Loyalty Rules
              </h3>

              <p className="text-sm text-gray-500">
                Configure how customers earn and redeem loyalty points.
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-gray-100 p-4">
            <label className="flex items-center justify-between gap-4">
              <div>
                <span className="text-sm font-semibold text-gray-800">
                  Enable Loyalty
                </span>

                <p className="mt-1 text-xs text-gray-500">
                  Turn customer loyalty point rules on or off globally.
                </p>
              </div>

              <input
                type="checkbox"
                name="loyaltyEnabled"
                checked={formData.loyaltyEnabled}
                onChange={handleCheckboxChange}
                className="h-5 w-5 rounded border-gray-300"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Points Per Amount
              </label>

              <input
                type="number"
                name="pointsPerAmount"
                value={formData.pointsPerAmount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                disabled={!formData.loyaltyEnabled}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Amount Per Point
              </label>

              <input
                type="number"
                name="amountPerPoint"
                value={formData.amountPerPoint}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                disabled={!formData.loyaltyEnabled}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Minimum Points To Redeem
              </label>

              <input
                type="number"
                name="minPointsToRedeem"
                value={formData.minPointsToRedeem}
                onChange={handleInputChange}
                min="0"
                step="1"
                disabled={!formData.loyaltyEnabled}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Value Per Point
              </label>

              <input
                type="number"
                name="valuePerPoint"
                value={formData.valuePerPoint}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                disabled={!formData.loyaltyEnabled}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            <RiSaveLine size={18} />
            {saving ? "Saving..." : "Save Global Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}