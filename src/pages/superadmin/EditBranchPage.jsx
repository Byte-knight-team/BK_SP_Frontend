// src/pages/superadmin/EditBranchPage.jsx

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
  RiSaveLine,
  RiErrorWarningLine,
  RiShieldUserLine,
  RiMapPinLine,
} from "@remixicon/react";

import {
  getBranchByIdAPI,
  updateBranchAPI,
} from "../../apis/staff/branches";

import {
  getBranchConfigAPI,
  updateBranchConfigAPI,
} from "../../apis/staff/systemConfig";

import BranchLocationPickerModal from "../../components/superadmin/BranchLocationPickerModal";

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
};

export default function EditBranchPage() {
  const { id } = useParams();

  const outletContext = useOutletContext();

  const setHeaderInfo =
    outletContext?.setHeaderInfo;

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNumber: "",
    email: "",
    latitude: null,
    longitude: null,
  });

  const [branchConfig, setBranchConfig] =
    useState(DEFAULT_BRANCH_CONFIG);

  const [
    locationPickerOpen,
    setLocationPickerOpen,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [pageError, setPageError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [configLoading, setConfigLoading] =
    useState(true);

  const [configSaving, setConfigSaving] =
    useState(false);

  const [configError, setConfigError] =
    useState("");

  const { user } = useAuth();

  const loggedInRole = normalizeRole(
    user?.roleName || user?.role || ""
  );

  const isSuperAdmin =
    loggedInRole === "SUPER_ADMIN";

  const hasSelectedLocation =
    Number.isFinite(formData.latitude) &&
    Number.isFinite(formData.longitude);

  useEffect(() => {
    if (setHeaderInfo) {
      setHeaderInfo({
        title: "Edit Branch",
        description:
          "Update branch information, map coordinates, order settings, and reservation settings.",
        Icon: RiBuilding2Line,
      });
    }

    return () => {
      if (setHeaderInfo) {
        setHeaderInfo(null);
      }
    };
  }, [setHeaderInfo]);

  const loadBranch = useCallback(
    async ({
      showFullLoading = true,
    } = {}) => {
      if (showFullLoading) {
        setLoading(true);
      }

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

        setFormData({
          name: data?.name || "",
          address: data?.address || "",

          contactNumber:
            data?.contactNumber ||
            data?.phone ||
            "",

          email: data?.email || "",

          latitude: normalizeCoordinate(
            data?.latitude
          ),

          longitude: normalizeCoordinate(
            data?.longitude
          ),
        });

        return true;
      } catch (error) {
        const message =
          error?.message ||
          "Failed to load branch details.";

        setPageError(message);
        showErrorToast(message);

        return false;
      } finally {
        if (showFullLoading) {
          setLoading(false);
        }
      }
    },
    [id]
  );

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

        return true;
      } catch (error) {
        const message =
          error?.message ||
          "Failed to load branch configuration.";

        setConfigError(message);
        showErrorToast(message);

        setBranchConfig(
          DEFAULT_BRANCH_CONFIG
        );

        return false;
      } finally {
        setConfigLoading(false);
      }
    }, [id]);

  useEffect(() => {
    if (!isSuperAdmin) {
      setLoading(false);
      setConfigLoading(false);
      return;
    }

    loadBranch();
    loadBranchConfig();
  }, [
    isSuperAdmin,
    loadBranch,
    loadBranchConfig,
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    const cleanedValue =
      name === "contactNumber"
        ? cleanContactNumber(value)
        : value;

    setFormData((previousData) => ({
      ...previousData,
      [name]: cleanedValue,
    }));
  };

  const handleLocationConfirm = ({
    lat,
    lng,
  }) => {
    const latitude = Number(lat);
    const longitude = Number(lng);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      showErrorToast(
        "Unable to read the selected map coordinates."
      );
      return;
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      showErrorToast(
        "The selected map coordinates are invalid."
      );
      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      latitude,
      longitude,
    }));

    setLocationPickerOpen(false);
  };

  const handleConfigInputChange = (
    event
  ) => {
    const { name, value } = event.target;

    setBranchConfig((previousConfig) => ({
      ...previousConfig,
      [name]: value,
    }));
  };

  const handleConfigCheckboxChange = (
    event
  ) => {
    const { name, checked } = event.target;

    setBranchConfig((previousConfig) => ({
      ...previousConfig,
      [name]: checked,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Branch name is required.";
    }

    if (!formData.address.trim()) {
      return "Branch address is required.";
    }

    if (!hasSelectedLocation) {
      return "Please select the branch location from the map.";
    }

    if (
      formData.latitude < -90 ||
      formData.latitude > 90
    ) {
      return "The selected latitude is invalid.";
    }

    if (
      formData.longitude < -180 ||
      formData.longitude > 180
    ) {
      return "The selected longitude is invalid.";
    }

    if (!formData.contactNumber.trim()) {
      return "Contact number is required.";
    }

    const phoneRegex = /^\+?\d{10,15}$/;

    if (
      !phoneRegex.test(
        formData.contactNumber.trim()
      )
    ) {
      return "Contact number is invalid.";
    }

    if (!formData.email.trim()) {
      return "Branch email is required.";
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        formData.email.trim()
      )
    ) {
      return "Please enter a valid branch email address.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      showErrorToast(validationError);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      address: formData.address.trim(),

      contactNumber:
        formData.contactNumber.trim(),

      email: formData.email.trim(),

      latitude: formData.latitude,
      longitude: formData.longitude,
    };

    setSaving(true);

    try {
      const { data, error } =
        await updateBranchAPI(id, payload);

      if (error) {
        throw new Error(error);
      }

      showSuccessToast(
        data?.message ||
          "Branch details updated successfully."
      );

      await loadBranch({
        showFullLoading: false,
      });
    } catch (error) {
      showErrorToast(
        error?.message ||
          "Failed to update branch details."
      );
    } finally {
      setSaving(false);
    }
  };

  const validateBranchConfig = () => {
    const deliveryFee = parseNumber(
      branchConfig.deliveryFee
    );

    const deliveryFeePerKm = parseNumber(
      branchConfig.deliveryFeePerKm
    );

    const maxDeliveryRadiusKm = parseNumber(
      branchConfig.maxDeliveryRadiusKm
    );

    const reservationFeePerHour = parseNumber(
      branchConfig.reservationFeePerHour
    );

    const reservationHandlingFee =
      parseNumber(
        branchConfig.reservationHandlingFee
      );

    const reservationPaymentWindowMinutes =
      parseNumber(
        branchConfig.reservationPaymentWindowMinutes
      );

    const reservationMinLeadHours =
      parseNumber(
        branchConfig.reservationMinLeadHours
      );

    const reservationMaxGuestCount =
      parseNumber(
        branchConfig.reservationMaxGuestCount
      );

    if (deliveryFee === null) {
      return "Enter a valid base delivery fee.";
    }

    if (deliveryFee < 0) {
      return "Delivery fee cannot be negative.";
    }

    if (deliveryFeePerKm === null) {
      return "Enter a valid delivery fee per kilometre.";
    }

    if (deliveryFeePerKm < 0) {
      return "Delivery fee per kilometre cannot be negative.";
    }

    if (maxDeliveryRadiusKm === null) {
      return "Enter a valid maximum delivery radius.";
    }

    if (maxDeliveryRadiusKm < 0) {
      return "Maximum delivery radius cannot be negative.";
    }

    if (reservationFeePerHour === null) {
      return "Enter a valid reservation fee per hour.";
    }

    if (reservationFeePerHour < 0) {
      return "Reservation fee per hour cannot be negative.";
    }

    if (reservationHandlingFee === null) {
      return "Enter a valid reservation handling fee.";
    }

    if (reservationHandlingFee < 0) {
      return "Reservation handling fee cannot be negative.";
    }

    if (
      reservationPaymentWindowMinutes === null ||
      !Number.isInteger(
        reservationPaymentWindowMinutes
      ) ||
      reservationPaymentWindowMinutes < 1
    ) {
      return "Reservation payment window must be at least 1 whole minute.";
    }

    if (
      reservationMinLeadHours === null ||
      !Number.isInteger(
        reservationMinLeadHours
      ) ||
      reservationMinLeadHours < 0
    ) {
      return "Reservation minimum lead time must be zero or more whole hours.";
    }

    if (
      reservationMaxGuestCount === null ||
      !Number.isInteger(
        reservationMaxGuestCount
      ) ||
      reservationMaxGuestCount < 1
    ) {
      return "Reservation maximum guest count must be at least 1.";
    }

    return "";
  };

  const handleSaveBranchConfig = async (
    event
  ) => {
    event.preventDefault();

    const validationError =
      validateBranchConfig();

    if (validationError) {
      showErrorToast(validationError);
      return;
    }

    const payload = {
      deliveryFee: Number(
        branchConfig.deliveryFee
      ),

      deliveryFeePerKm: Number(
        branchConfig.deliveryFeePerKm
      ),

      maxDeliveryRadiusKm: Number(
        branchConfig.maxDeliveryRadiusKm
      ),

      deliveryEnabled: Boolean(
        branchConfig.deliveryEnabled
      ),

      pickupEnabled: Boolean(
        branchConfig.pickupEnabled
      ),

      dineInEnabled: Boolean(
        branchConfig.dineInEnabled
      ),

      branchActiveForOrders: Boolean(
        branchConfig.branchActiveForOrders
      ),

      reservationFeePerHour: Number(
        branchConfig.reservationFeePerHour
      ),

      reservationHandlingFee: Number(
        branchConfig.reservationHandlingFee
      ),

      reservationPaymentWindowMinutes:
        Number(
          branchConfig.reservationPaymentWindowMinutes
        ),

      reservationMinLeadHours: Number(
        branchConfig.reservationMinLeadHours
      ),

      reservationMaxGuestCount: Number(
        branchConfig.reservationMaxGuestCount
      ),

      reservationsEnabled: Boolean(
        branchConfig.reservationsEnabled
      ),
    };

    setConfigSaving(true);
    setConfigError("");

    try {
      await updateBranchConfigAPI(
        id,
        payload
      );

      showSuccessToast(
        "Branch configuration updated successfully."
      );

      await loadBranchConfig();
    } catch (error) {
      const message =
        error?.message ||
        "Failed to update branch configuration.";

      setConfigError(message);
      showErrorToast(message);
    } finally {
      setConfigSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="max-w-5xl">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <EditBranchState
            Icon={RiShieldUserLine}
            title="No Access"
            description="Only SUPER_ADMIN users can edit branches."
            iconClassName="bg-red-50 text-red-600"
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <EditBranchState
            Icon={RiBuilding2Line}
            title="Loading branch edit form"
            description="Please wait while the branch details are loaded."
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
          <BackToBranchesLink />

          <EditBranchState
            Icon={RiErrorWarningLine}
            title="Unable to load branch details"
            description={pageError}
            iconClassName="bg-red-50 text-red-600"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl space-y-6">
        <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <BackToBranchDetailsLink id={id} />

          <div className="mb-5 border-b border-gray-100 pb-5">
            <h3 className="text-xl font-bold text-gray-900">
              Branch Details
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Update the branch address manually
              and select its coordinates separately
              using the map.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="branch-name"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Branch Name
              </label>

              <input
                id="branch-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={saving}
                placeholder="Example: Maharagama Branch"
                autoComplete="organization"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="branch-address"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Branch Address
              </label>

              <textarea
                id="branch-address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={saving}
                rows={3}
                placeholder="Enter the physical branch address"
                autoComplete="street-address"
                className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 disabled:bg-gray-50 disabled:text-gray-400"
              />

              <p className="mt-2 text-xs leading-5 text-gray-400">
                The physical address is entered
                manually. Changing it does not
                automatically change the saved map
                coordinates.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600">
                    <RiMapPinLine size={22} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Branch Map Location
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Move the map until the exact
                      restaurant position is under the
                      center pin. Only latitude and
                      longitude are saved.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setLocationPickerOpen(true)
                  }
                  disabled={saving}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RiMapPinLine size={18} />

                  {hasSelectedLocation
                    ? "Change Location"
                    : "Select Location"}
                </button>
              </div>

              {hasSelectedLocation ? (
                <div className="mt-4 rounded-2xl border border-green-100 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                    Current Coordinates
                  </p>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <CoordinateValue
                      label="Latitude"
                      value={formData.latitude}
                    />

                    <CoordinateValue
                      label="Longitude"
                      value={formData.longitude}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-700">
                  This branch does not have a
                  complete map location. Select one
                  before saving.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="branch-contact-number"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Contact Number
                </label>

                <input
                  id="branch-contact-number"
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Example: +94771234567"
                  autoComplete="tel"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <div>
                <label
                  htmlFor="branch-email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email
                </label>

                <input
                  id="branch-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Example: maharagama@cravehouse.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Link
                to={`/staff/branches/${id}`}
                className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Spinner className="h-4 w-4 border-orange-200 border-t-white" />
                ) : (
                  <RiSaveLine size={18} />
                )}

                {saving
                  ? "Saving..."
                  : "Save Branch Details"}
              </button>
            </div>
          </form>
        </section>

        <form
          onSubmit={handleSaveBranchConfig}
          className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="border-b border-gray-100 pb-5">
            <h3 className="text-xl font-bold text-gray-900">
              Branch Order & Reservation Configuration
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Configure delivery pricing, available
              order methods, and reservation rules.
            </p>
          </div>

          {configError && (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-red-600">
                  {configError}
                </p>

                <button
                  type="button"
                  onClick={loadBranchConfig}
                  disabled={configLoading}
                  className="inline-flex w-fit items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {configLoading ? (
            <div className="mt-6">
              <EditBranchState
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
                  Manage delivery charges and the
                  maximum supported delivery distance.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <ConfigNumberField
                    label="Base Delivery Fee"
                    name="deliveryFee"
                    value={
                      branchConfig.deliveryFee
                    }
                    onChange={
                      handleConfigInputChange
                    }
                    min="0"
                    step="0.01"
                    disabled={
                      !branchConfig.deliveryEnabled ||
                      configSaving
                    }
                    description="Base charge applied to delivery orders."
                  />

                  <ConfigNumberField
                    label="Delivery Fee Per KM"
                    name="deliveryFeePerKm"
                    value={
                      branchConfig.deliveryFeePerKm
                    }
                    onChange={
                      handleConfigInputChange
                    }
                    min="0"
                    step="0.01"
                    disabled={
                      !branchConfig.deliveryEnabled ||
                      configSaving
                    }
                    description="Additional charge applied for each kilometre."
                  />

                  <ConfigNumberField
                    label="Maximum Delivery Radius (KM)"
                    name="maxDeliveryRadiusKm"
                    value={
                      branchConfig.maxDeliveryRadiusKm
                    }
                    onChange={
                      handleConfigInputChange
                    }
                    min="0"
                    step="0.1"
                    disabled={
                      !branchConfig.deliveryEnabled ||
                      configSaving
                    }
                    description="Maximum delivery distance supported by this branch."
                  />
                </div>
              </div>

              <div className="mt-7 border-t border-gray-100 pt-6">
                <h4 className="text-sm font-bold text-gray-900">
                  Order Availability
                </h4>

                <p className="mt-1 text-sm text-gray-500">
                  Choose which ordering methods are
                  available for this branch.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <ConfigToggleCard
                    name="branchActiveForOrders"
                    label="Active For Orders"
                    description="Allow this branch to receive customer orders."
                    checked={
                      branchConfig.branchActiveForOrders
                    }
                    disabled={configSaving}
                    onChange={
                      handleConfigCheckboxChange
                    }
                  />

                  <ConfigToggleCard
                    name="deliveryEnabled"
                    label="Delivery"
                    description="Enable delivery orders for this branch."
                    checked={
                      branchConfig.deliveryEnabled
                    }
                    disabled={configSaving}
                    onChange={
                      handleConfigCheckboxChange
                    }
                  />

                  <ConfigToggleCard
                    name="pickupEnabled"
                    label="Pickup"
                    description="Enable pickup orders for this branch."
                    checked={
                      branchConfig.pickupEnabled
                    }
                    disabled={configSaving}
                    onChange={
                      handleConfigCheckboxChange
                    }
                  />

                  <ConfigToggleCard
                    name="dineInEnabled"
                    label="Dine-In"
                    description="Enable dine-in orders for this branch."
                    checked={
                      branchConfig.dineInEnabled
                    }
                    disabled={configSaving}
                    onChange={
                      handleConfigCheckboxChange
                    }
                  />
                </div>
              </div>

              <div className="mt-7 border-t border-gray-100 pt-6">
                <h4 className="text-sm font-bold text-gray-900">
                  Reservation Configuration
                </h4>

                <p className="mt-1 text-sm text-gray-500">
                  Configure reservation availability,
                  fees, payment timing, and customer
                  limits.
                </p>

                <div className="mt-4">
                  <ConfigToggleCard
                    name="reservationsEnabled"
                    label="Reservations"
                    description="Allow customers to create reservations for this branch."
                    checked={
                      branchConfig.reservationsEnabled
                    }
                    disabled={configSaving}
                    onChange={
                      handleConfigCheckboxChange
                    }
                  />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <ConfigNumberField
                    label="Reservation Fee Per Hour"
                    name="reservationFeePerHour"
                    value={
                      branchConfig.reservationFeePerHour
                    }
                    onChange={
                      handleConfigInputChange
                    }
                    min="0"
                    step="0.01"
                    disabled={
                      !branchConfig.reservationsEnabled ||
                      configSaving
                    }
                    description="Hourly charge applied to a reservation."
                  />

                  <ConfigNumberField
                    label="Reservation Handling Fee"
                    name="reservationHandlingFee"
                    value={
                      branchConfig.reservationHandlingFee
                    }
                    onChange={
                      handleConfigInputChange
                    }
                    min="0"
                    step="0.01"
                    disabled={
                      !branchConfig.reservationsEnabled ||
                      configSaving
                    }
                    description="Additional handling charge applied to a reservation."
                  />

                  <ConfigNumberField
                    label="Payment Window (Minutes)"
                    name="reservationPaymentWindowMinutes"
                    value={
                      branchConfig.reservationPaymentWindowMinutes
                    }
                    onChange={
                      handleConfigInputChange
                    }
                    min="1"
                    step="1"
                    disabled={
                      !branchConfig.reservationsEnabled ||
                      configSaving
                    }
                    description="Time allowed for the customer to complete payment."
                  />

                  <ConfigNumberField
                    label="Minimum Lead Time (Hours)"
                    name="reservationMinLeadHours"
                    value={
                      branchConfig.reservationMinLeadHours
                    }
                    onChange={
                      handleConfigInputChange
                    }
                    min="0"
                    step="1"
                    disabled={
                      !branchConfig.reservationsEnabled ||
                      configSaving
                    }
                    description="Minimum advance notice required for a reservation."
                  />

                  <ConfigNumberField
                    label="Maximum Guest Count"
                    name="reservationMaxGuestCount"
                    value={
                      branchConfig.reservationMaxGuestCount
                    }
                    onChange={
                      handleConfigInputChange
                    }
                    min="1"
                    step="1"
                    disabled={
                      !branchConfig.reservationsEnabled ||
                      configSaving
                    }
                    description="Maximum number of guests allowed in one reservation."
                  />
                </div>
              </div>

              <div className="mt-7 flex justify-end border-t border-gray-100 pt-6">
                <button
                  type="submit"
                  disabled={configSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {configSaving ? (
                    <Spinner className="h-4 w-4 border-orange-200 border-t-white" />
                  ) : (
                    <RiSaveLine size={18} />
                  )}

                  {configSaving
                    ? "Saving..."
                    : "Save Branch Configuration"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      <BranchLocationPickerModal
        isOpen={locationPickerOpen}
        onClose={() =>
          setLocationPickerOpen(false)
        }
        onConfirm={handleLocationConfirm}
        initialCenter={
          hasSelectedLocation
            ? {
                lat: formData.latitude,
                lng: formData.longitude,
              }
            : undefined
        }
      />
    </>
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

function BackToBranchDetailsLink({
  id,
}) {
  return (
    <div className="mb-6">
      <Link
        to={`/staff/branches/${id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600"
      >
        <RiArrowLeftLine size={18} />
        Back to branch details
      </Link>
    </div>
  );
}

function CoordinateValue({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-bold text-gray-900">
        {formatCoordinate(value)}
      </p>
    </div>
  );
}

function EditBranchState({
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
    </div>
  );
}

function ConfigNumberField({
  label,
  name,
  value,
  onChange,
  disabled,
  description,
  min = "0",
  step = "0.01",
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <label
        htmlFor={`config-${name}`}
        className="text-xs font-bold uppercase tracking-wider text-gray-500"
      >
        {label}
      </label>

      <input
        id={`config-${name}`}
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        step={step}
        disabled={disabled}
        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100 disabled:text-gray-400"
      />

      <p className="mt-2 text-xs leading-5 text-gray-400">
        {description}
      </p>
    </div>
  );
}

function ConfigToggleCard({
  name,
  label,
  description,
  checked,
  disabled,
  onChange,
}) {
  return (
    <label
      className={`flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition ${
        disabled
          ? "cursor-not-allowed opacity-70"
          : "cursor-pointer hover:border-orange-100 hover:bg-orange-50/40"
      }`}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {label}
        </p>

        <p className="mt-2 text-sm font-semibold text-gray-900">
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

        <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </div>
    </label>
  );
}

function cleanContactNumber(value) {
  const cleaned = String(value || "")
    .replace(/[^\d+]/g, "");

  if (!cleaned.includes("+")) {
    return cleaned;
  }

  return `+${cleaned.replace(/\+/g, "")}`;
}

function normalizeCoordinate(value) {
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
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "N/A";
  }

  return numericValue.toFixed(6);
}

function parseNumber(value) {
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

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .replace(/^ROLE_/, "")
    .replace(/\s+/g, "_")
    .toUpperCase();
}

function Spinner({ className }) {
  return (
    <span
      className={`inline-flex animate-spin rounded-full border-2 ${className}`}
    />
  );
}