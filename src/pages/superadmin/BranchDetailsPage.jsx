// src/pages/superadmin/BranchDetailsPage.jsx

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useOutletContext,
  useParams,
} from "react-router-dom";

import {
  RiBuilding2Line,
  RiArrowLeftLine,
  RiEditLine,
  RiErrorWarningLine,
  RiShieldUserLine,
  RiMoneyDollarCircleLine,
  RiTimerFlashLine,
  RiShoppingBag3Line,
  RiBarChartBoxLine,
  RiMapPinLine,
  RiMailLine,
  RiPhoneLine,
  RiCalendarLine,
  RiRefreshLine,
  RiTeamLine,
  RiUserSettingsLine,
  RiRestaurantLine,
  RiTruckLine,
  RiCustomerService2Line,
} from "@remixicon/react";

import {
  getBranchByIdAPI,
  activateBranchAPI,
  deactivateBranchAPI,
} from "../../apis/staff/branches";

import {
  getAllStaffAPI,
} from "../../apis/staff/staff";

import {
  getBranchConfigAPI,
} from "../../apis/staff/systemConfig";

import {
  getSuperAdminBranchRevenueAPI,
} from "../../apis/staff/dashboard";

import { useAuth } from "../../context/AuthContext";

import {
  showSuccessToast,
  showErrorToast,
} from "../../utils/toast";

const DEFAULT_BRANCH_CONFIG = {
  deliveryFee: 0,
  deliveryFeePerKm: 10,
  maxDeliveryRadiusKm: 30,

  deliveryEnabled: false,
  pickupEnabled: false,
  dineInEnabled: false,
  branchActiveForOrders: false,

  reservationFeePerHour: 1000,
  reservationHandlingFee: 500,
  reservationPaymentWindowMinutes: 30,
  reservationMinLeadHours: 3,
  reservationMaxGuestCount: 20,
  reservationsEnabled: true,

  updatedAt: null,
};

const DEFAULT_BRANCH_REVENUE = {
  periodRevenue: 0,
  periodOrderCount: 0,
  todayRevenue: 0,
  todayOrderCount: 0,
  averageOrderValue: 0,
};

export default function BranchDetailsPage() {
  const { id } = useParams();

  const outletContext = useOutletContext();

  const setHeaderInfo =
    outletContext?.setHeaderInfo;

  const [branch, setBranch] =
    useState(null);

  const [branchConfig, setBranchConfig] =
    useState(DEFAULT_BRANCH_CONFIG);

  const [branchRevenue, setBranchRevenue] =
    useState(DEFAULT_BRANCH_REVENUE);

  const [
    branchStaffList,
    setBranchStaffList,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [configLoading, setConfigLoading] =
    useState(false);

  const [revenueLoading, setRevenueLoading] =
    useState(false);

  const [staffLoading, setStaffLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [pageError, setPageError] =
    useState("");

  const [configError, setConfigError] =
    useState("");

  const [revenueError, setRevenueError] =
    useState("");

  const [staffError, setStaffError] =
    useState("");

  const { user } = useAuth();

  const loggedInRole = normalizeRole(
    user?.roleName || user?.role || ""
  );

  const isSuperAdmin =
    loggedInRole === "SUPER_ADMIN";

  useEffect(() => {
    if (setHeaderInfo) {
      setHeaderInfo({
        title: "Branch Details",
        description:
          "View branch information, location, revenue, staff, order configuration, and reservation configuration.",
        Icon: RiBuilding2Line,
      });
    }

    return () => {
      if (setHeaderInfo) {
        setHeaderInfo(null);
      }
    };
  }, [setHeaderInfo]);

  const loadBranchConfig =
    useCallback(async () => {
      setConfigLoading(true);
      setConfigError("");

      try {
        const response =
          await getBranchConfigAPI(id);

        setBranchConfig(
          normalizeBranchConfig(response)
        );
      } catch (error) {
        const message =
          error?.message ||
          "Failed to load branch configuration.";

        setConfigError(message);

        setBranchConfig(
          DEFAULT_BRANCH_CONFIG
        );

        showErrorToast(message);
      } finally {
        setConfigLoading(false);
      }
    }, [id]);

  const loadBranchRevenue =
    useCallback(async () => {
      setRevenueLoading(true);
      setRevenueError("");

      try {
        const response =
          await getSuperAdminBranchRevenueAPI(
            7
          );

        if (response?.error) {
          throw new Error(response.error);
        }

        const revenueList =
          normalizeList(response);

        const selectedBranchRevenue =
          revenueList.find(
            (item) =>
              String(item?.branchId) ===
              String(id)
          );

        setBranchRevenue(
          selectedBranchRevenue ||
            DEFAULT_BRANCH_REVENUE
        );
      } catch (error) {
        const message =
          error?.message ||
          "Failed to load branch revenue details.";

        setRevenueError(message);

        setBranchRevenue(
          DEFAULT_BRANCH_REVENUE
        );
      } finally {
        setRevenueLoading(false);
      }
    }, [id]);

  const loadBranchStaff =
    useCallback(async () => {
      setStaffLoading(true);
      setStaffError("");

      try {
        const response =
          await getAllStaffAPI();

        if (response?.error) {
          throw new Error(response.error);
        }

        const staffList = normalizeList(
          response?.data || response
        );

        const filteredStaff =
          staffList.filter((staff) => {
            const staffBranchId =
              getStaffBranchId(staff);

            return (
              String(staffBranchId) ===
              String(id)
            );
          });

        setBranchStaffList(filteredStaff);
      } catch (error) {
        const message =
          error?.message ||
          "Failed to load branch staff details.";

        setStaffError(message);
        setBranchStaffList([]);
      } finally {
        setStaffLoading(false);
      }
    }, [id]);

  const loadBranch = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const { data, error } =
        await getBranchByIdAPI(id);

      if (error) {
        throw new Error(error);
      }

      if (!data) {
        throw new Error(
          "Branch details were not returned by the server."
        );
      }

      setBranch(data);

      await Promise.allSettled([
        loadBranchConfig(),
        loadBranchRevenue(),
        loadBranchStaff(),
      ]);
    } catch (error) {
      const message =
        error?.message ||
        "Failed to load branch details.";

      setPageError(message);
      setBranch(null);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  }, [
    id,
    loadBranchConfig,
    loadBranchRevenue,
    loadBranchStaff,
  ]);

  useEffect(() => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    loadBranch();
  }, [
    isSuperAdmin,
    loadBranch,
  ]);

  const handleToggleStatus = async () => {
    if (!branch || actionLoading) {
      return;
    }

    const active =
      isBranchActive(branch);

    setActionLoading(true);

    try {
      const result = active
        ? await deactivateBranchAPI(id)
        : await activateBranchAPI(id);

      if (result?.error) {
        throw new Error(result.error);
      }

      showSuccessToast(
        active
          ? "Branch deactivated successfully."
          : "Branch activated successfully."
      );

      await loadBranch();
    } catch (error) {
      showErrorToast(
        error?.message ||
          "Failed to update branch status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefreshDetails = async () => {
    await loadBranch();

    showSuccessToast(
      "Branch details refreshed successfully."
    );
  };

  if (!isSuperAdmin) {
    return (
      <div className="w-full">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <BranchDetailsState
            Icon={RiShieldUserLine}
            title="No Access"
            description="Branch details are only available for SUPER_ADMIN users."
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
          <BranchDetailsState
            Icon={RiBuilding2Line}
            title="Loading branch details"
            description="Please wait while the selected branch information is loaded."
            iconClassName="bg-gray-100 text-gray-600"
            loading
          />
        </div>
      </div>
    );
  }

  if (pageError && !branch) {
    return (
      <div className="w-full">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <BackToBranchesLink />

          <BranchDetailsState
            Icon={RiErrorWarningLine}
            title="Unable to load branch details"
            description={pageError}
            iconClassName="bg-red-50 text-red-600"
          />
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="w-full">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <BackToBranchesLink />

          <BranchDetailsState
            Icon={RiBuilding2Line}
            title="Branch not found"
            description="The selected branch could not be found."
            iconClassName="bg-gray-100 text-gray-600"
          />
        </div>
      </div>
    );
  }

  const active =
    isBranchActive(branch);

  const branchId =
    branch?.id || branch?.branchId || id;

  const totalStaff =
    branchStaffList.length;

  const activeStaff =
    branchStaffList.filter(
      isStaffActive
    ).length;

  const inactiveStaff =
    totalStaff - activeStaff;

  const adminCount = countStaffByRole(
    branchStaffList,
    "ADMIN"
  );

  const managerCount = countStaffByRole(
    branchStaffList,
    "MANAGER"
  );

  const chefCount = countStaffByRole(
    branchStaffList,
    "CHEF"
  );

  const receptionistCount =
    countStaffByRole(
      branchStaffList,
      "RECEPTIONIST"
    );

  const deliveryCount = countStaffByRole(
    branchStaffList,
    "DELIVERY"
  );

  return (
    <div className="w-full space-y-5">
      <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        <BackToBranchesLink />

        <div className="flex flex-col gap-5 border-b border-gray-100 pb-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="break-words text-2xl font-bold text-gray-900">
                {branch?.name ||
                  "No branch name"}
              </h3>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  active
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {active
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Branch ID: {branchId}
            </p>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              View branch contact information,
              location, revenue, staff, order
              settings, and reservation settings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRefreshDetails}
              disabled={
                loading ||
                revenueLoading ||
                configLoading ||
                staffLoading
              }
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RiRefreshLine size={18} />
              Refresh Details
            </button>

            <Link
              to={`/staff/branches/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
            >
              <RiEditLine size={18} />
              Edit Branch
            </Link>

            <button
              type="button"
              disabled={actionLoading}
              onClick={handleToggleStatus}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                active
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            >
              {actionLoading && (
                <span
                  className={`h-4 w-4 animate-spin rounded-full border-2 ${
                    active
                      ? "border-red-200 border-t-red-600"
                      : "border-green-200 border-t-green-700"
                  }`}
                />
              )}

              {actionLoading
                ? "Updating..."
                : active
                  ? "Deactivate Branch"
                  : "Activate Branch"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <BranchQuickInfoCard
            Icon={RiMapPinLine}
            label="Address"
            value={
              branch?.address || "N/A"
            }
          />

          <BranchQuickInfoCard
            Icon={RiPhoneLine}
            label="Contact Number"
            value={
              branch?.contactNumber ||
              branch?.phone ||
              "N/A"
            }
          />

          <BranchQuickInfoCard
            Icon={RiMailLine}
            label="Email"
            value={branch?.email || "N/A"}
          />

          <BranchQuickInfoCard
            Icon={RiCalendarLine}
            label="Created Date"
            value={formatDate(
              branch?.createdAt ||
                branch?.createdDate
            )}
          />
        </div>
      </section>

      <BranchLocationCard branch={branch} />

      <BranchRevenueSummaryCard
        branchRevenue={branchRevenue}
        revenueLoading={revenueLoading}
        revenueError={revenueError}
        onReload={loadBranchRevenue}
      />

      <BranchStaffSummaryCard
        totalStaff={totalStaff}
        activeStaff={activeStaff}
        inactiveStaff={inactiveStaff}
        adminCount={adminCount}
        managerCount={managerCount}
        chefCount={chefCount}
        receptionistCount={
          receptionistCount
        }
        deliveryCount={deliveryCount}
        staffLoading={staffLoading}
        staffError={staffError}
        onReload={loadBranchStaff}
      />

      <BranchConfigurationCard
        branchConfig={branchConfig}
        configLoading={configLoading}
        configError={configError}
        onReload={loadBranchConfig}
      />
    </div>
  );
}

function BranchLocationCard({ branch }) {
  const latitude = getFiniteCoordinate(
    branch?.latitude
  );

  const longitude = getFiniteCoordinate(
    branch?.longitude
  );

  const locationConfigured =
    latitude !== null &&
    longitude !== null;

  return (
    <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Branch Map Location
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Coordinates selected for delivery and
            location-based branch operations.
          </p>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${
            locationConfigured
              ? "bg-green-50 text-green-700"
              : "bg-orange-50 text-orange-700"
          }`}
        >
          {locationConfigured
            ? "Location Configured"
            : "Location Required"}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LocationCoordinateCard
          label="Latitude"
          value={formatCoordinate(latitude)}
        />

        <LocationCoordinateCard
          label="Longitude"
          value={formatCoordinate(longitude)}
        />
      </div>

      <p className="mt-4 text-xs leading-5 text-gray-400">
        The physical address is entered manually
        and is shown in the branch summary above.
        The map stores only latitude and longitude.
      </p>

      {!locationConfigured && (
        <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-700">
          This branch does not have complete
          coordinates. Use Edit Branch to select
          its map location.
        </div>
      )}
    </section>
  );
}

function LocationCoordinateCard({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </p>

      <p className="mt-3 break-all text-lg font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-gray-400">
        Exact coordinate saved for this branch.
      </p>
    </div>
  );
}

function BranchRevenueSummaryCard({
  branchRevenue,
  revenueLoading,
  revenueError,
  onReload,
}) {
  return (
    <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        title="Branch Revenue Summary"
        description="Revenue and paid order performance for this branch."
        loading={revenueLoading}
        loadingText="Loading revenue"
        reloadLabel="Reload Revenue"
        onReload={onReload}
      />

      {revenueError && (
        <ErrorBox message={revenueError} />
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <RevenueMetricCard
          Icon={RiMoneyDollarCircleLine}
          label="7-Day Revenue"
          value={formatMoney(
            branchRevenue?.periodRevenue
          )}
          description="Paid revenue in selected period"
        />

        <RevenueMetricCard
          Icon={RiTimerFlashLine}
          label="Today Revenue"
          value={formatMoney(
            branchRevenue?.todayRevenue
          )}
          description="Paid revenue today"
        />

        <RevenueMetricCard
          Icon={RiShoppingBag3Line}
          label="7-Day Orders"
          value={Number(
            branchRevenue?.periodOrderCount || 0
          ).toLocaleString()}
          description="Paid orders in selected period"
        />

        <RevenueMetricCard
          Icon={RiShoppingBag3Line}
          label="Today Orders"
          value={Number(
            branchRevenue?.todayOrderCount || 0
          ).toLocaleString()}
          description="Paid orders today"
        />

        <RevenueMetricCard
          Icon={RiBarChartBoxLine}
          label="Average Order"
          value={formatMoney(
            branchRevenue?.averageOrderValue
          )}
          description="Average paid order value"
        />
      </div>
    </section>
  );
}

function BranchStaffSummaryCard({
  totalStaff,
  activeStaff,
  inactiveStaff,
  adminCount,
  managerCount,
  chefCount,
  receptionistCount,
  deliveryCount,
  staffLoading,
  staffError,
  onReload,
}) {
  const staffCards = [
    {
      label: "Total Staff",
      value: totalStaff,
      description:
        "Staff assigned to this branch",
      Icon: RiTeamLine,
    },
    {
      label: "Active Staff",
      value: activeStaff,
      description:
        "Currently active accounts",
      Icon: RiShieldUserLine,
    },
    {
      label: "Inactive Staff",
      value: inactiveStaff,
      description:
        "Disabled or inactive accounts",
      Icon: RiErrorWarningLine,
    },
    {
      label: "Admins",
      value: adminCount,
      description: "Branch admin users",
      Icon: RiUserSettingsLine,
    },
    {
      label: "Managers",
      value: managerCount,
      description: "Branch manager users",
      Icon: RiUserSettingsLine,
    },
    {
      label: "Chefs",
      value: chefCount,
      description: "Kitchen staff users",
      Icon: RiRestaurantLine,
    },
    {
      label: "Receptionists",
      value: receptionistCount,
      description: "Front-desk staff users",
      Icon: RiCustomerService2Line,
    },
    {
      label: "Delivery Staff",
      value: deliveryCount,
      description: "Delivery staff users",
      Icon: RiTruckLine,
    },
  ];

  return (
    <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        title="Branch Staff Summary"
        description="Staff distribution and role breakdown for this branch."
        loading={staffLoading}
        loadingText="Loading staff"
        reloadLabel="Reload Staff"
        onReload={onReload}
      />

      {staffError && (
        <ErrorBox message={staffError} />
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {staffCards.map((card) => (
          <StaffMetricCard
            key={card.label}
            {...card}
          />
        ))}
      </div>
    </section>
  );
}

function BranchConfigurationCard({
  branchConfig,
  configLoading,
  configError,
  onReload,
}) {
  return (
    <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        title="Branch Order & Reservation Configuration"
        description="View delivery pricing, order availability, and reservation rules."
        loading={configLoading}
        loadingText="Loading configuration"
        reloadLabel="Reload Config"
        onReload={onReload}
      />

      {branchConfig?.updatedAt && (
        <p className="mt-3 text-xs text-gray-400">
          Last updated:{" "}
          {formatDateTime(
            branchConfig.updatedAt
          )}
        </p>
      )}

      {configError && (
        <ErrorBox message={configError} />
      )}

      {configLoading ? (
        <div className="mt-6">
          <BranchDetailsState
            Icon={RiBuilding2Line}
            title="Loading branch configuration"
            description="Please wait while the order and reservation settings are loaded."
            iconClassName="bg-gray-100 text-gray-600"
            loading
          />
        </div>
      ) : (
        <>
          <div className="mt-6">
            <h4 className="text-sm font-bold text-gray-900">
              Delivery Pricing
            </h4>

            <p className="mt-1 text-sm text-gray-500">
              Charges and supported delivery
              distance configured for this branch.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <ConfigValueCard
                label="Base Delivery Fee"
                value={formatMoney(
                  branchConfig.deliveryFee
                )}
                description="Base charge applied to delivery orders."
              />

              <ConfigValueCard
                label="Delivery Fee Per KM"
                value={`${formatMoney(
                  branchConfig.deliveryFeePerKm
                )} / km`}
                description="Additional charge for each kilometre."
              />

              <ConfigValueCard
                label="Maximum Delivery Radius"
                value={formatDistance(
                  branchConfig.maxDeliveryRadiusKm
                )}
                description="Maximum supported delivery distance."
              />
            </div>
          </div>

          <div className="mt-7 border-t border-gray-100 pt-6">
            <h4 className="text-sm font-bold text-gray-900">
              Order Availability
            </h4>

            <p className="mt-1 text-sm text-gray-500">
              Order methods currently enabled for
              this branch.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ConfigStatusCard
                label="Active for Orders"
                description="Allow this branch to receive customer orders."
                enabled={
                  branchConfig.branchActiveForOrders
                }
              />

              <ConfigStatusCard
                label="Delivery"
                description="Enable delivery orders for this branch."
                enabled={
                  branchConfig.deliveryEnabled
                }
              />

              <ConfigStatusCard
                label="Pickup"
                description="Enable pickup orders for this branch."
                enabled={
                  branchConfig.pickupEnabled
                }
              />

              <ConfigStatusCard
                label="Dine-In"
                description="Enable dine-in orders for this branch."
                enabled={
                  branchConfig.dineInEnabled
                }
              />
            </div>
          </div>

          <div className="mt-7 border-t border-gray-100 pt-6">
            <h4 className="text-sm font-bold text-gray-900">
              Reservation Configuration
            </h4>

            <p className="mt-1 text-sm text-gray-500">
              Reservation availability, charges,
              payment timing, and customer limits.
            </p>

            <div className="mt-4">
              <ConfigStatusCard
                label="Reservations"
                description="Allow customers to create reservations for this branch."
                enabled={
                  branchConfig.reservationsEnabled
                }
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <ConfigValueCard
                label="Fee Per Hour"
                value={formatMoney(
                  branchConfig.reservationFeePerHour
                )}
                description="Hourly charge applied to a reservation."
              />

              <ConfigValueCard
                label="Handling Fee"
                value={formatMoney(
                  branchConfig.reservationHandlingFee
                )}
                description="Additional handling charge applied to a reservation."
              />

              <ConfigValueCard
                label="Payment Window"
                value={formatMinutes(
                  branchConfig.reservationPaymentWindowMinutes
                )}
                description="Time allowed for the customer to complete payment."
              />

              <ConfigValueCard
                label="Minimum Lead Time"
                value={formatHours(
                  branchConfig.reservationMinLeadHours
                )}
                description="Minimum advance notice required for a reservation."
              />

              <ConfigValueCard
                label="Maximum Guest Count"
                value={formatGuestCount(
                  branchConfig.reservationMaxGuestCount
                )}
                description="Maximum guests allowed in one reservation."
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function SectionHeader({
  title,
  description,
  loading,
  loadingText,
  reloadLabel,
  onReload,
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h3 className="text-lg font-bold text-gray-900">
          {title}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      {loading ? (
        <LoadingPill text={loadingText} />
      ) : (
        <SmallReloadButton
          label={reloadLabel}
          onClick={onReload}
        />
      )}
    </div>
  );
}

function ConfigValueCard({
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </p>

      <p className="mt-3 break-words text-lg font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-gray-400">
        {description}
      </p>
    </div>
  );
}

function ConfigStatusCard({
  label,
  description,
  enabled,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {label}
        </p>

        <p className="mt-2 text-sm font-semibold text-gray-900">
          {description}
        </p>

        <p
          className={`mt-2 text-xs font-bold ${
            enabled
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          {enabled ? "Enabled" : "Disabled"}
        </p>
      </div>

      <div
        className={`relative h-6 w-11 shrink-0 rounded-full ${
          enabled
            ? "bg-orange-500"
            : "bg-gray-300"
        }`}
      >
        <div
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            enabled
              ? "translate-x-5"
              : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );
}

function RevenueMetricCard({
  Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {label}
          </p>

          <h4 className="mt-3 text-2xl font-bold text-gray-900">
            {value}
          </h4>

          <p className="mt-2 text-xs text-gray-400">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function StaffMetricCard({
  label,
  value,
  description,
  Icon,
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {label}
          </p>

          <h4 className="mt-3 text-2xl font-bold text-gray-900">
            {Number(
              value || 0
            ).toLocaleString()}
          </h4>

          <p className="mt-2 text-xs text-gray-400">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function BranchQuickInfoCard({
  Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600">
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {label}
          </p>

          <p className="mt-2 break-words text-sm font-semibold text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function SmallReloadButton({
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
    >
      <RiRefreshLine size={17} />
      {label}
    </button>
  );
}

function LoadingPill({ text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600" />
      {text}
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
      <p className="text-sm font-medium text-red-600">
        {message}
      </p>
    </div>
  );
}

function BackToBranchesLink() {
  return (
    <div className="mb-6">
      <Link
        to="/staff/branches"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600"
      >
        <RiArrowLeftLine size={18} />
        Back to branches
      </Link>
    </div>
  );
}

function BranchDetailsState({
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

      <h3 className="font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

function normalizeBranchConfig(response) {
  const config =
    response?.data || response || {};

  return {
    ...DEFAULT_BRANCH_CONFIG,
    ...config,

    deliveryFee: normalizeConfigValue(
      config.deliveryFee,
      0
    ),

    deliveryFeePerKm: normalizeConfigValue(
      config.deliveryFeePerKm,
      10
    ),

    maxDeliveryRadiusKm:
      normalizeConfigValue(
        config.maxDeliveryRadiusKm,
        30
      ),

    deliveryEnabled: Boolean(
      config.deliveryEnabled
    ),

    pickupEnabled: Boolean(
      config.pickupEnabled
    ),

    dineInEnabled: Boolean(
      config.dineInEnabled
    ),

    branchActiveForOrders: Boolean(
      config.branchActiveForOrders
    ),

    reservationFeePerHour:
      normalizeConfigValue(
        config.reservationFeePerHour,
        1000
      ),

    reservationHandlingFee:
      normalizeConfigValue(
        config.reservationHandlingFee,
        500
      ),

    reservationPaymentWindowMinutes:
      normalizeConfigValue(
        config.reservationPaymentWindowMinutes,
        30
      ),

    reservationMinLeadHours:
      normalizeConfigValue(
        config.reservationMinLeadHours,
        3
      ),

    reservationMaxGuestCount:
      normalizeConfigValue(
        config.reservationMaxGuestCount,
        20
      ),

    reservationsEnabled:
      config.reservationsEnabled === null ||
      config.reservationsEnabled === undefined
        ? true
        : Boolean(
            config.reservationsEnabled
          ),
  };
}

function normalizeConfigValue(
  value,
  fallback
) {
  return value === null ||
    value === undefined ||
    value === ""
    ? fallback
    : value;
}

function normalizeList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.staff)) {
    return response.staff;
  }

  if (Array.isArray(response?.branches)) {
    return response.branches;
  }

  return [];
}

function getStaffBranchId(staff) {
  return (
    staff?.branchId ||
    staff?.branch?.id ||
    staff?.branch?.branchId ||
    staff?.assignedBranchId ||
    staff?.branchDetails?.id ||
    null
  );
}

function isStaffActive(staff) {
  if (typeof staff?.active === "boolean") {
    return staff.active;
  }

  if (
    typeof staff?.isActive === "boolean"
  ) {
    return staff.isActive;
  }

  if (
    typeof staff?.enabled === "boolean"
  ) {
    return staff.enabled;
  }

  const status = String(
    staff?.status ||
      staff?.accountStatus ||
      ""
  )
    .trim()
    .toUpperCase();

  return status === "ACTIVE";
}

function getStaffRole(staff) {
  let roleValue = "";

  if (
    typeof staff?.roleName === "string"
  ) {
    roleValue = staff.roleName;
  } else if (
    typeof staff?.role?.name === "string"
  ) {
    roleValue = staff.role.name;
  } else if (
    typeof staff?.role === "string"
  ) {
    roleValue = staff.role;
  } else if (
    typeof staff?.userRole === "string"
  ) {
    roleValue = staff.userRole;
  } else if (
    typeof staff?.user?.role?.name ===
    "string"
  ) {
    roleValue = staff.user.role.name;
  }

  return normalizeRole(roleValue);
}

function countStaffByRole(
  staffList,
  roleName
) {
  return staffList.filter(
    (staff) =>
      getStaffRole(staff) === roleName
  ).length;
}

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .replace(/^ROLE_/, "")
    .replace(/\s+/g, "_")
    .toUpperCase();
}

function getBranchStatus(branchData) {
  if (!branchData) {
    return "UNKNOWN";
  }

  if (branchData.status) {
    return String(branchData.status)
      .trim()
      .toUpperCase();
  }

  if (
    typeof branchData.active === "boolean"
  ) {
    return branchData.active
      ? "ACTIVE"
      : "INACTIVE";
  }

  if (
    typeof branchData.isActive === "boolean"
  ) {
    return branchData.isActive
      ? "ACTIVE"
      : "INACTIVE";
  }

  return "UNKNOWN";
}

function isBranchActive(branchData) {
  return (
    getBranchStatus(branchData) ===
    "ACTIVE"
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

function formatDate(dateValue) {
  if (!dateValue) {
    return "N/A";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString();
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

function formatMoney(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "LKR 0";
  }

  return `LKR ${numericValue.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  )}`;
}

function formatDistance(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0 km";
  }

  return `${numericValue.toLocaleString(
    undefined,
    {
      maximumFractionDigits: 2,
    }
  )} km`;
}

function formatMinutes(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0 minutes";
  }

  return `${numericValue.toLocaleString()} ${
    numericValue === 1
      ? "minute"
      : "minutes"
  }`;
}

function formatHours(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0 hours";
  }

  return `${numericValue.toLocaleString()} ${
    numericValue === 1
      ? "hour"
      : "hours"
  }`;
}

function formatGuestCount(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0 guests";
  }

  return `${numericValue.toLocaleString()} ${
    numericValue === 1
      ? "guest"
      : "guests"
  }`;
}
