// src/pages/superadmin/SystemConfigPage.jsx

import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
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

import { useAuth } from "../../context/AuthContext";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

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

function getUserRoleName(user) {
  return user?.roleName || user?.role || "";
}

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .replace(/^ROLE_/, "")
    .replace(/\s+/g, "_")
    .toUpperCase();
}

function toNumber(value) {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return 0;
  }

  return numberValue;
}

function mapConfigToForm(data) {
  return {
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
  };
}

export default function SystemConfigPage() {
  const outletContext = useOutletContext();
  const setHeaderInfo = outletContext?.setHeaderInfo;

  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const { user: authUser } = useAuth();

  const roleName = normalizeRole(getUserRoleName(authUser));
  const isSuperAdmin = roleName === "SUPER_ADMIN";

  useEffect(() => {
    if (setHeaderInfo) {
      setHeaderInfo({
        title: "System Configuration",
        description: "Manage global tax, service charge, and loyalty rules.",
        Icon: RiSettings3Line,
      });
    }

    return () => {
      if (setHeaderInfo) {
        setHeaderInfo(null);
      }
    };
  }, [setHeaderInfo]);

  const loadGlobalConfig = useCallback(async ({ showFullLoading = true } = {}) => {
    try {
      if (showFullLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setLoadError("");

      const data = await getGlobalConfigAPI();

      setFormData(mapConfigToForm(data));
      setLastUpdatedAt(data?.updatedAt || null);

      return true;
    } catch (error) {
      const message = error.message || "Failed to load global configuration.";

      setLoadError(message);
      showErrorToast(message);

      return false;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    loadGlobalConfig({ showFullLoading: true });
  }, [isSuperAdmin, loadGlobalConfig]);

  async function handleRefreshConfig() {
    const success = await loadGlobalConfig({ showFullLoading: false });

    if (success) {
      showSuccessToast("System configuration refreshed successfully.");
    }
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleCheckboxChange(event) {
    const { name, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: checked,
    }));
  }

  function validateForm() {
    const taxPercentage = toNumber(formData.taxPercentage);
    const serviceChargePercentage = toNumber(formData.serviceChargePercentage);
    const pointsPerAmount = toNumber(formData.pointsPerAmount);
    const amountPerPoint = toNumber(formData.amountPerPoint);
    const minPointsToRedeem = toNumber(formData.minPointsToRedeem);
    const valuePerPoint = toNumber(formData.valuePerPoint);

    if (taxPercentage < 0) {
      return "Tax percentage cannot be negative.";
    }

    if (serviceChargePercentage < 0) {
      return "Service charge percentage cannot be negative.";
    }

    if (pointsPerAmount < 0) {
      return "Points per amount cannot be negative.";
    }

    if (amountPerPoint < 0) {
      return "Amount per point cannot be negative.";
    }

    if (minPointsToRedeem < 0) {
      return "Minimum points to redeem cannot be negative.";
    }

    if (valuePerPoint < 0) {
      return "Value per point cannot be negative.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      showErrorToast(validationError);
      return;
    }

    try {
      setSaving(true);

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

      showSuccessToast("Global system configuration updated successfully.");

      if (updatedData?.updatedAt) {
        setLastUpdatedAt(updatedData.updatedAt);
      }
    } catch (error) {
      showErrorToast(error.message || "Failed to update global configuration.");
    } finally {
      setSaving(false);
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="w-full">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <SystemConfigState
            Icon={RiShieldKeyholeLine}
            title="No Access"
            description="System Configuration is available only for SUPER_ADMIN users. ADMIN users should not update global business rules."
            iconClassName="bg-red-50 text-red-600"
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <SystemConfigState
            Icon={RiSettings3Line}
            title="Loading system configuration"
            description="Please wait while global tax, service charge, and loyalty rules are loaded."
            iconClassName="bg-gray-100 text-gray-600"
            loading
          />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <SystemConfigState
            Icon={RiSettings3Line}
            title="Unable to load system configuration"
            description={loadError}
            iconClassName="bg-red-50 text-red-600"
            action={
              <button
                type="button"
                onClick={() => loadGlobalConfig({ showFullLoading: true })}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <RiRefreshLine size={18} />
                Retry
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {/* Top workspace card */}
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Configuration Workspace
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Update global tax, service charge, and loyalty rules used across
              the restaurant system.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              {lastUpdatedAt
                ? (
                    <>
                      Last updated:{" "}
                      <span className="font-semibold text-gray-800">
                        {formatDateTime(lastUpdatedAt)}
                      </span>
                    </>
                  )
                : (
                    "No update timestamp available."
                  )}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefreshConfig}
            disabled={refreshing || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? (
              <Spinner className="h-4 w-4 border-gray-300 border-t-orange-500" />
            ) : (
              <RiRefreshLine size={18} />
            )}

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tax and service charge section */}
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
          <SectionHeader
            Icon={RiPercentLine}
            title="Tax & Service Charge"
            description="Configure system-wide percentage-based charges."
          />

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5">
              <ToggleSwitch
                name="taxEnabled"
                label="Enable Tax"
                description="Turn tax calculation on or off globally."
                checked={formData.taxEnabled}
                disabled={saving || refreshing}
                onChange={handleCheckboxChange}
              />

              <NumberField
                label="Tax Percentage"
                name="taxPercentage"
                value={formData.taxPercentage}
                onChange={handleInputChange}
                disabled={!formData.taxEnabled || saving || refreshing}
                step="0.01"
              />
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5">
              <ToggleSwitch
                name="serviceChargeEnabled"
                label="Enable Service Charge"
                description="Turn service charge calculation on or off globally."
                checked={formData.serviceChargeEnabled}
                disabled={saving || refreshing}
                onChange={handleCheckboxChange}
              />

              <NumberField
                label="Service Charge Percentage"
                name="serviceChargePercentage"
                value={formData.serviceChargePercentage}
                onChange={handleInputChange}
                disabled={!formData.serviceChargeEnabled || saving || refreshing}
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Loyalty section */}
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
          <SectionHeader
            Icon={RiGiftLine}
            title="Loyalty Rules"
            description="Configure how customers earn and redeem loyalty points."
          />

          <div className="mb-5 rounded-2xl border border-gray-100 bg-gray-50/70 p-5">
            <ToggleSwitch
              name="loyaltyEnabled"
              label="Enable Loyalty"
              description="Turn customer loyalty point rules on or off globally."
              checked={formData.loyaltyEnabled}
              disabled={saving || refreshing}
              onChange={handleCheckboxChange}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-4 lg:grid-cols-2">
            <NumberField
              label="Points Per Amount"
              name="pointsPerAmount"
              value={formData.pointsPerAmount}
              onChange={handleInputChange}
              disabled={!formData.loyaltyEnabled || saving || refreshing}
              step="0.01"
            />

            <NumberField
              label="Amount Per Point"
              name="amountPerPoint"
              value={formData.amountPerPoint}
              onChange={handleInputChange}
              disabled={!formData.loyaltyEnabled || saving || refreshing}
              step="0.01"
            />

            <NumberField
              label="Minimum Points To Redeem"
              name="minPointsToRedeem"
              value={formData.minPointsToRedeem}
              onChange={handleInputChange}
              disabled={!formData.loyaltyEnabled || saving || refreshing}
              step="1"
            />

            <NumberField
              label="Value Per Point"
              name="valuePerPoint"
              value={formData.valuePerPoint}
              onChange={handleInputChange}
              disabled={!formData.loyaltyEnabled || saving || refreshing}
              step="0.01"
            />
          </div>
        </div>

        {/* Save card */}
        <div className="flex flex-col gap-3 rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Save Global Configuration
            </h4>

            <p className="mt-1 text-sm text-gray-500">
              Changes will affect global ordering calculations after saving.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Spinner className="h-4 w-4 border-orange-200 border-t-white" />
            ) : (
              <RiSaveLine size={18} />
            )}

            {saving ? "Saving..." : "Save Global Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionHeader({ Icon, title, description }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-600">
        <Icon size={22} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function ToggleSwitch({
  name,
  label,
  description,
  checked,
  disabled,
  onChange,
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <div>
        <span className="text-sm font-semibold text-gray-800">{label}</span>

        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>

      <div className="relative shrink-0">
        <input
          type="checkbox"
          name={name}
          checked={Boolean(checked)}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only"
        />

        <div className="h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-orange-500 peer-disabled:cursor-not-allowed peer-disabled:opacity-60" />

        <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5 peer-disabled:opacity-80" />
      </div>
    </label>
  );
}

function NumberField({
  label,
  name,
  value,
  onChange,
  disabled,
  step = "0.01",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min="0"
        step={step}
        disabled={disabled}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100 disabled:text-gray-400"
      />
    </div>
  );
}

function SystemConfigState({
  Icon,
  title,
  description,
  iconClassName,
  loading = false,
  action = null,
}) {
  return (
    <div className="text-center">
      <div
        className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${iconClassName}`}
      >
        {loading ? (
          <Spinner className="h-6 w-6 border-gray-300 border-t-orange-500" />
        ) : (
          <Icon size={24} />
        )}
      </div>

      <h3 className="font-semibold text-gray-900">{title}</h3>

      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>

      {action}
    </div>
  );
}

function Spinner({ className }) {
  return (
    <span
      className={`inline-flex animate-spin rounded-full border-2 ${className}`}
    />
  );
}

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "N/A";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString();
}