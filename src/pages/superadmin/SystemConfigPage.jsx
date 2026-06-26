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

/**
 * Build form state from backend response.
 */
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
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  /*
    Read logged-in user from AuthContext.

    AuthContext gets user data from the decoded JWT token.
    We do not read authUser from localStorage.
  */
  const { user: authUser } = useAuth();

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

  /**
   * Load global configuration from backend.
   */
  const loadGlobalConfig = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");

      const data = await getGlobalConfigAPI();

      setFormData(mapConfigToForm(data));
      setLastUpdatedAt(data?.updatedAt || null);
    } catch (error) {
      const message =
        error.message || "Failed to load global configuration.";

      setLoadError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Do not call backend for users who should not access this page.
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    loadGlobalConfig();
  }, [isSuperAdmin, loadGlobalConfig]);

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
   * Handle toggle changes.
   */
  function handleCheckboxChange(event) {
    const { name, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: checked,
    }));
  }

  /**
   * Validate configuration before saving.
   */
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

  /**
   * Save global configuration.
   */
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
      showErrorToast(
        error.message || "Failed to update global configuration."
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * Clean no-access screen for ADMIN and other roles.
   */
  if (!isSuperAdmin) {
    return (
      <div className="max-w-5xl">
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

  /**
   * Loading screen.
   */
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
      <div className="max-w-5xl">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <SystemConfigState
            Icon={RiSettings3Line}
            title="Unable to load system configuration"
            description={loadError}
            iconClassName="bg-red-50 text-red-600"
            action={
              <button
                type="button"
                onClick={loadGlobalConfig}
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
    <div className="max-w-5xl space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tax and service charge section */}
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <SectionHeader
            Icon={RiPercentLine}
            title="Tax & Service Charge"
            description="Configure system-wide percentage-based charges."
          />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Tax card */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <ToggleSwitch
                name="taxEnabled"
                label="Enable Tax"
                description="Turn tax calculation on or off globally."
                checked={formData.taxEnabled}
                disabled={saving}
                onChange={handleCheckboxChange}
              />

              <NumberField
                label="Tax Percentage"
                name="taxPercentage"
                value={formData.taxPercentage}
                onChange={handleInputChange}
                disabled={!formData.taxEnabled || saving}
                step="0.01"
              />
            </div>

            {/* Service charge card */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <ToggleSwitch
                name="serviceChargeEnabled"
                label="Enable Service Charge"
                description="Turn service charge calculation on or off globally."
                checked={formData.serviceChargeEnabled}
                disabled={saving}
                onChange={handleCheckboxChange}
              />

              <NumberField
                label="Service Charge Percentage"
                name="serviceChargePercentage"
                value={formData.serviceChargePercentage}
                onChange={handleInputChange}
                disabled={!formData.serviceChargeEnabled || saving}
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Loyalty section */}
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <SectionHeader
            Icon={RiGiftLine}
            title="Loyalty Rules"
            description="Configure how customers earn and redeem loyalty points."
          />

          <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <ToggleSwitch
              name="loyaltyEnabled"
              label="Enable Loyalty"
              description="Turn customer loyalty point rules on or off globally."
              checked={formData.loyaltyEnabled}
              disabled={saving}
              onChange={handleCheckboxChange}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <NumberField
              label="Points Per Amount"
              name="pointsPerAmount"
              value={formData.pointsPerAmount}
              onChange={handleInputChange}
              disabled={!formData.loyaltyEnabled || saving}
              step="0.01"
            />

            <NumberField
              label="Amount Per Point"
              name="amountPerPoint"
              value={formData.amountPerPoint}
              onChange={handleInputChange}
              disabled={!formData.loyaltyEnabled || saving}
              step="0.01"
            />

            <NumberField
              label="Minimum Points To Redeem"
              name="minPointsToRedeem"
              value={formData.minPointsToRedeem}
              onChange={handleInputChange}
              disabled={!formData.loyaltyEnabled || saving}
              step="1"
            />

            <NumberField
              label="Value Per Point"
              name="valuePerPoint"
              value={formData.valuePerPoint}
              onChange={handleInputChange}
              disabled={!formData.loyaltyEnabled || saving}
              step="0.01"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex flex-col gap-3 rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Global Configuration
            </h4>

            <p className="mt-1 text-sm text-gray-500">
              {lastUpdatedAt
                ? `Last updated: ${formatDateTime(lastUpdatedAt)}`
                : "Changes will affect global ordering calculations after saving."}
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
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
    <div className="mb-6 flex items-center gap-3">
      <div className="rounded-full bg-orange-50 p-2 text-orange-600">
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
    <div className="mt-4">
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