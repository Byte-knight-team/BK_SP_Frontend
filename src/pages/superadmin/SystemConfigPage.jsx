// src/pages/superadmin/SystemConfigPage.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  RiErrorWarningLine,
  RiGiftLine,
  RiMapPinLine,
  RiPercentLine,
  RiRefreshLine,
  RiSaveLine,
  RiSettings3Line,
  RiShieldKeyholeLine,
  RiStore2Line,
} from "@remixicon/react";

import {
  getGlobalConfigAPI,
  updateGlobalConfigAPI,
} from "../../apis/staff/systemConfig";

import {
  getAllBranchesAPI,
} from "../../apis/staff/branches";

import { useAuth } from "../../context/AuthContext";
import {
  showSuccessToast,
  showErrorToast,
} from "../../utils/toast";

/**
 * Default values for the global configuration form.
 *
 * deliveryBranchId:
 * - Identifies the one branch selected by SUPER_ADMIN
 *   as the configured delivery branch.
 *
 * orderCancelWindowMinutes:
 * - Still exists in the backend.
 * - Remains hidden from the UI.
 * - Must be preserved whenever global configuration is saved.
 */
const DEFAULT_FORM = {
  deliveryBranchId: "",

  taxEnabled: false,
  taxPercentage: 0,

  serviceChargeEnabled: false,
  serviceChargePercentage: 0,

  loyaltyEnabled: false,
  pointsPerAmount: 0,
  amountPerPoint: 1,
  minPointsToRedeem: 0,
  valuePerPoint: 0,

  orderCancelWindowMinutes: 10,
};

export default function SystemConfigPage() {
  const outletContext = useOutletContext();
  const setHeaderInfo = outletContext?.setHeaderInfo;

  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [deliveryBranchName, setDeliveryBranchName] =
    useState("");

  const [branches, setBranches] = useState([]);
  const [lastUpdatedAt, setLastUpdatedAt] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [branchesLoading, setBranchesLoading] =
    useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [saving, setSaving] = useState(false);

  const [loadError, setLoadError] = useState("");
  const [branchesError, setBranchesError] =
    useState("");

  const { user: authUser } = useAuth();

  const roleName = normalizeRole(
    getUserRoleName(authUser)
  );

  const isSuperAdmin = roleName === "SUPER_ADMIN";

  /**
   * Only ACTIVE branches with complete map coordinates
   * can be selected as the system delivery branch.
   */
  const eligibleBranches = useMemo(() => {
    return branches
      .filter(isEligibleDeliveryBranch)
      .sort((firstBranch, secondBranch) =>
        getBranchName(firstBranch).localeCompare(
          getBranchName(secondBranch)
        )
      );
  }, [branches]);

  const selectedDeliveryBranch = useMemo(() => {
    if (!formData.deliveryBranchId) {
      return null;
    }

    return (
      eligibleBranches.find(
        (branch) =>
          String(getBranchId(branch)) ===
          String(formData.deliveryBranchId)
      ) || null
    );
  }, [
    eligibleBranches,
    formData.deliveryBranchId,
  ]);

  const selectedBranchUnavailable =
    !branchesLoading &&
    Boolean(formData.deliveryBranchId) &&
    !selectedDeliveryBranch;

  useEffect(() => {
    if (setHeaderInfo) {
      setHeaderInfo({
        title: "System Configuration",
        description:
          "Manage the configured delivery branch and global restaurant rules.",
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
   * Loads the global configuration record.
   */
  const loadGlobalConfig = useCallback(
    async ({ showFullLoading = true } = {}) => {
      try {
        if (showFullLoading) {
          setLoading(true);
        }

        setLoadError("");

        const response = await getGlobalConfigAPI();
        const data = unwrapObject(response);

        setFormData(mapConfigToForm(data));

        setDeliveryBranchName(
          data?.deliveryBranchName || ""
        );

        setLastUpdatedAt(
          data?.updatedAt || null
        );

        return true;
      } catch (error) {
        const message =
          error?.message ||
          "Failed to load global configuration.";

        setLoadError(message);
        showErrorToast(message);

        return false;
      } finally {
        if (showFullLoading) {
          setLoading(false);
        }
      }
    },
    []
  );

  /**
   * Loads all branches and keeps the full list in state.
   *
   * Eligibility filtering is performed separately so the
   * UI can display how many branches are unavailable.
   */
  const loadBranches = useCallback(async () => {
    try {
      setBranchesLoading(true);
      setBranchesError("");

      const response = await getAllBranchesAPI();

      if (response?.error) {
        throw new Error(response.error);
      }

      setBranches(normalizeList(response));

      return true;
    } catch (error) {
      const message =
        error?.message ||
        "Failed to load branches.";

      setBranchesError(message);
      setBranches([]);

      return false;
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) {
      setLoading(false);
      setBranchesLoading(false);
      return;
    }

    Promise.allSettled([
      loadGlobalConfig({
        showFullLoading: true,
      }),
      loadBranches(),
    ]);
  }, [
    isSuperAdmin,
    loadGlobalConfig,
    loadBranches,
  ]);

  /**
   * Reloads both the global configuration and branch list.
   */
  async function handleRefreshConfig() {
    setRefreshing(true);

    const [configResult, branchesResult] =
      await Promise.all([
        loadGlobalConfig({
          showFullLoading: false,
        }),
        loadBranches(),
      ]);

    setRefreshing(false);

    if (configResult && branchesResult) {
      showSuccessToast(
        "System configuration refreshed successfully."
      );
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

  function handleDeliveryBranchChange(event) {
    const selectedId = event.target.value;

    const branch =
      eligibleBranches.find(
        (item) =>
          String(getBranchId(item)) ===
          String(selectedId)
      ) || null;

    setFormData((previousData) => ({
      ...previousData,
      deliveryBranchId: selectedId,
    }));

    setDeliveryBranchName(
      branch ? getBranchName(branch) : ""
    );
  }

  /**
   * Validates frontend values before sending them
   * to the global configuration endpoint.
   */
  function validateForm() {
    if (!formData.deliveryBranchId) {
      return "Please select the system delivery branch.";
    }

    if (branchesLoading) {
      return "Please wait while branches are being loaded.";
    }

    if (branchesError) {
      return "Branches could not be loaded. Reload the branch list before saving.";
    }

    if (!selectedDeliveryBranch) {
      return "The selected delivery branch is not active or does not have a complete map location.";
    }

    const taxPercentage = toNumber(
      formData.taxPercentage
    );

    const serviceChargePercentage = toNumber(
      formData.serviceChargePercentage
    );

    const pointsPerAmount = toNumber(
      formData.pointsPerAmount
    );

    const amountPerPoint = toNumber(
      formData.amountPerPoint
    );

    const minPointsToRedeem = toNumber(
      formData.minPointsToRedeem
    );

    const valuePerPoint = toNumber(
      formData.valuePerPoint
    );

    if (
      taxPercentage < 0 ||
      taxPercentage > 100
    ) {
      return "Tax percentage must be between 0 and 100.";
    }

    if (
      serviceChargePercentage < 0 ||
      serviceChargePercentage > 100
    ) {
      return "Service charge percentage must be between 0 and 100.";
    }

    if (pointsPerAmount < 0) {
      return "Points per amount cannot be negative.";
    }

    if (amountPerPoint <= 0) {
      return "Amount per point must be greater than zero.";
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
   * Saves the selected delivery branch together with
   * all existing global configuration fields.
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
        deliveryBranchId: Number(
          formData.deliveryBranchId
        ),

        taxEnabled: Boolean(
          formData.taxEnabled
        ),

        taxPercentage: toNumber(
          formData.taxPercentage
        ),

        serviceChargeEnabled: Boolean(
          formData.serviceChargeEnabled
        ),

        serviceChargePercentage: toNumber(
          formData.serviceChargePercentage
        ),

        loyaltyEnabled: Boolean(
          formData.loyaltyEnabled
        ),

        pointsPerAmount: toNumber(
          formData.pointsPerAmount
        ),

        amountPerPoint: toNumber(
          formData.amountPerPoint
        ),

        minPointsToRedeem: toNumber(
          formData.minPointsToRedeem
        ),

        valuePerPoint: toNumber(
          formData.valuePerPoint
        ),

        // Hidden field preserved for backend compatibility.
        orderCancelWindowMinutes: toNumber(
          formData.orderCancelWindowMinutes
        ),
      };

      const response =
        await updateGlobalConfigAPI(payload);

      const updatedData = unwrapObject(response);

      if (updatedData) {
        setFormData(
          mapConfigToForm(updatedData)
        );

        setDeliveryBranchName(
          updatedData?.deliveryBranchName ||
            getBranchName(
              selectedDeliveryBranch
            )
        );

        setLastUpdatedAt(
          updatedData?.updatedAt ||
            lastUpdatedAt
        );
      }

      showSuccessToast(
        "Global system configuration updated successfully."
      );
    } catch (error) {
      showErrorToast(
        error?.message ||
          "Failed to update global configuration."
      );
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
            description="System Configuration is available only for SUPER_ADMIN users. ADMIN users cannot update global business rules."
            iconClassName="bg-red-50 text-red-600"
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex min-h-[clamp(24rem,calc(100vh-15rem),44rem)] items-center justify-center rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <SystemConfigState
            Icon={RiSettings3Line}
            title="Loading system configuration"
            description="Please wait while the configured delivery branch and global rules are loaded."
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
                onClick={() =>
                  Promise.allSettled([
                    loadGlobalConfig({
                      showFullLoading: true,
                    }),
                    loadBranches(),
                  ])
                }
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
      {/* Configuration workspace */}
      <section className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Configuration Workspace
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Configure the system delivery branch,
              tax, service charge, and loyalty rules.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              {lastUpdatedAt ? (
                <>
                  Last updated:{" "}
                  <span className="font-semibold text-gray-800">
                    {formatDateTime(lastUpdatedAt)}
                  </span>
                </>
              ) : (
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

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Delivery branch section */}
        <section className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
          <SectionHeader
            Icon={RiStore2Line}
            title="System Delivery Branch"
            description="Select the one active branch that will act as the configured delivery branch."
          />

          {branchesError && (
            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <RiErrorWarningLine
                    size={21}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      Unable to load branches
                    </p>

                    <p className="mt-1 text-sm text-red-600">
                      {branchesError}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadBranches}
                  disabled={branchesLoading}
                  className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RiRefreshLine size={17} />
                  Retry
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5">
              <label
                htmlFor="deliveryBranchId"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Delivery Branch
              </label>

              <select
                id="deliveryBranchId"
                name="deliveryBranchId"
                value={formData.deliveryBranchId}
                onChange={
                  handleDeliveryBranchChange
                }
                disabled={
                  branchesLoading ||
                  refreshing ||
                  saving ||
                  Boolean(branchesError)
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">
                  {branchesLoading
                    ? "Loading branches..."
                    : eligibleBranches.length === 0
                      ? "No eligible branches available"
                      : "Select delivery branch"}
                </option>

                {eligibleBranches.map(
                  (branch) => (
                    <option
                      key={getBranchId(branch)}
                      value={getBranchId(branch)}
                    >
                      {getBranchName(branch)}
                    </option>
                  )
                )}
              </select>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Only ACTIVE branches with latitude
                and longitude appear in this list.
              </p>

              {!branchesLoading &&
                !branchesError && (
                  <p className="mt-2 text-xs font-semibold text-gray-600">
                    {eligibleBranches.length} of{" "}
                    {branches.length} branches are
                    eligible.
                  </p>
                )}
            </div>

            <SelectedDeliveryBranchCard
              branch={selectedDeliveryBranch}
              fallbackBranchName={
                deliveryBranchName
              }
              unavailable={
                selectedBranchUnavailable
              }
            />
          </div>

          {!branchesLoading &&
            !branchesError &&
            eligibleBranches.length === 0 && (
              <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-700">
                No branch can currently be selected.
                Create or edit an ACTIVE branch and
                choose its exact map location first.
              </div>
            )}
        </section>

        {/* Tax and service charge section */}
        <section className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
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
                disabled={
                  !formData.taxEnabled ||
                  saving ||
                  refreshing
                }
                step="0.01"
                max="100"
              />
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5">
              <ToggleSwitch
                name="serviceChargeEnabled"
                label="Enable Service Charge"
                description="Turn service charge calculation on or off globally."
                checked={
                  formData.serviceChargeEnabled
                }
                disabled={saving || refreshing}
                onChange={handleCheckboxChange}
              />

              <NumberField
                label="Service Charge Percentage"
                name="serviceChargePercentage"
                value={
                  formData.serviceChargePercentage
                }
                onChange={handleInputChange}
                disabled={
                  !formData.serviceChargeEnabled ||
                  saving ||
                  refreshing
                }
                step="0.01"
                max="100"
              />
            </div>
          </div>
        </section>

        {/* Loyalty section */}
        <section className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
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

          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
            <NumberField
              label="Points Per Amount"
              name="pointsPerAmount"
              value={formData.pointsPerAmount}
              onChange={handleInputChange}
              disabled={
                !formData.loyaltyEnabled ||
                saving ||
                refreshing
              }
              step="0.01"
            />

            <NumberField
              label="Amount Per Point"
              name="amountPerPoint"
              value={formData.amountPerPoint}
              onChange={handleInputChange}
              disabled={
                !formData.loyaltyEnabled ||
                saving ||
                refreshing
              }
              step="0.01"
              min="0.01"
            />

            <NumberField
              label="Minimum Points To Redeem"
              name="minPointsToRedeem"
              value={formData.minPointsToRedeem}
              onChange={handleInputChange}
              disabled={
                !formData.loyaltyEnabled ||
                saving ||
                refreshing
              }
              step="1"
            />

            <NumberField
              label="Value Per Point"
              name="valuePerPoint"
              value={formData.valuePerPoint}
              onChange={handleInputChange}
              disabled={
                !formData.loyaltyEnabled ||
                saving ||
                refreshing
              }
              step="0.01"
            />
          </div>
        </section>

        {/* Save section */}
        <section className="flex flex-col gap-3 rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Save Global Configuration
            </h4>

            <p className="mt-1 text-sm text-gray-500">
              Saving updates the configured delivery
              branch and global ordering rules.
            </p>
          </div>

          <button
            type="submit"
            disabled={
              saving ||
              refreshing ||
              branchesLoading ||
              Boolean(branchesError) ||
              eligibleBranches.length === 0
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Spinner className="h-4 w-4 border-orange-200 border-t-white" />
            ) : (
              <RiSaveLine size={18} />
            )}

            {saving
              ? "Saving..."
              : "Save Global Configuration"}
          </button>
        </section>
      </form>
    </div>
  );
}

function SelectedDeliveryBranchCard({
  branch,
  fallbackBranchName,
  unavailable,
}) {
  if (unavailable) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600">
            <RiErrorWarningLine size={22} />
          </div>

          <div>
            <p className="text-sm font-bold text-orange-800">
              Selected Branch Is Unavailable
            </p>

            <p className="mt-1 text-sm leading-6 text-orange-700">
              {fallbackBranchName
                ? `${fallbackBranchName} is no longer eligible.`
                : "The previously selected branch is no longer eligible."}{" "}
              Select an active branch with a
              complete map location.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-gray-500">
            <RiMapPinLine size={22} />
          </div>

          <div>
            <p className="text-sm font-bold text-gray-800">
              No Delivery Branch Selected
            </p>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Choose one eligible branch from the
              list to use as the configured system
              delivery branch.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const latitude = getFiniteCoordinate(
    branch?.latitude
  );

  const longitude = getFiniteCoordinate(
    branch?.longitude
  );

  return (
    <div className="rounded-2xl border border-green-100 bg-green-50/50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-green-700">
          <RiMapPinLine size={22} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-green-700">
            Selected Delivery Branch
          </p>

          <p className="mt-2 text-base font-bold text-gray-900">
            {getBranchName(branch)}
          </p>

          <p className="mt-2 break-words text-sm leading-6 text-gray-600">
            {branch?.address ||
              "No address available"}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-500 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-gray-700">
                Latitude:
              </span>{" "}
              {formatCoordinate(latitude)}
            </p>

            <p>
              <span className="font-semibold text-gray-700">
                Longitude:
              </span>{" "}
              {formatCoordinate(longitude)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  Icon,
  title,
  description,
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
        <Icon size={22} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>

        <p className="text-sm text-gray-500">
          {description}
        </p>
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
        <span className="text-sm font-semibold text-gray-800">
          {label}
        </span>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
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
  min = "0",
  max,
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
        min={min}
        max={max}
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

      <h3 className="font-semibold text-gray-900">
        {title}
      </h3>

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

function mapConfigToForm(data) {
  return {
    deliveryBranchId:
      data?.deliveryBranchId !== null &&
      data?.deliveryBranchId !== undefined
        ? String(data.deliveryBranchId)
        : "",

    taxEnabled: Boolean(data?.taxEnabled),

    taxPercentage:
      data?.taxPercentage ?? 0,

    serviceChargeEnabled: Boolean(
      data?.serviceChargeEnabled
    ),

    serviceChargePercentage:
      data?.serviceChargePercentage ?? 0,

    loyaltyEnabled: Boolean(
      data?.loyaltyEnabled
    ),

    pointsPerAmount:
      data?.pointsPerAmount ?? 0,

    amountPerPoint:
      data?.amountPerPoint ?? 1,

    minPointsToRedeem:
      data?.minPointsToRedeem ?? 0,

    valuePerPoint:
      data?.valuePerPoint ?? 0,

    orderCancelWindowMinutes:
      data?.orderCancelWindowMinutes ?? 10,
  };
}

function normalizeList(response) {
  const value =
    response?.data !== undefined
      ? response.data
      : response;

  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.content)) {
    return value.content;
  }

  if (Array.isArray(value?.branches)) {
    return value.branches;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.branches)) {
    return response.branches;
  }

  return [];
}

function unwrapObject(response) {
  if (
    response?.data &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }

  return response || {};
}

function isEligibleDeliveryBranch(branch) {
  return (
    getBranchStatus(branch) === "ACTIVE" &&
    getFiniteCoordinate(branch?.latitude) !==
      null &&
    getFiniteCoordinate(branch?.longitude) !==
      null
  );
}

function getBranchStatus(branch) {
  if (branch?.status) {
    return String(branch.status)
      .trim()
      .toUpperCase();
  }

  if (
    typeof branch?.active === "boolean"
  ) {
    return branch.active
      ? "ACTIVE"
      : "INACTIVE";
  }

  if (
    typeof branch?.isActive === "boolean"
  ) {
    return branch.isActive
      ? "ACTIVE"
      : "INACTIVE";
  }

  return "UNKNOWN";
}

function getBranchId(branch) {
  return branch?.id ?? branch?.branchId ?? "";
}

function getBranchName(branch) {
  return (
    branch?.name ||
    branch?.branchName ||
    "Unnamed Branch"
  );
}

function getFiniteCoordinate(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : null;
}

function formatCoordinate(value) {
  if (value === null) {
    return "N/A";
  }

  return Number(value).toFixed(6);
}

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

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return numberValue;
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
