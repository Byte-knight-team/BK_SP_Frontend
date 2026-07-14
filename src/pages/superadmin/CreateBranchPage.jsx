// src/pages/superadmin/CreateBranchPage.jsx

import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import {
  RiBuilding2Line,
  RiArrowLeftLine,
  RiAddLine,
  RiShieldUserLine,
  RiMapPinLine,
} from "@remixicon/react";

import { useAuth } from "../../context/AuthContext";

import {
  createBranchAPI,
} from "../../apis/staff/branches";

import {
  showSuccessToast,
  showErrorToast,
} from "../../utils/toast";

import BranchLocationPickerModal from "../../components/superadmin/BranchLocationPickerModal";

export default function CreateBranchPage() {
  const navigate = useNavigate();
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

  const [
    locationPickerOpen,
    setLocationPickerOpen,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

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
        title: "Create Branch",
        description:
          "Add a new restaurant branch and select its exact map coordinates.",
        Icon: RiBuilding2Line,
      });
    }

    return () => {
      if (setHeaderInfo) {
        setHeaderInfo(null);
      }
    };
  }, [setHeaderInfo]);

  /**
   * Handles normal form-field changes.
   */
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

  /**
   * Receives only latitude and longitude from the
   * SUPER_ADMIN branch location picker.
   *
   * The manually entered branch address remains unchanged.
   */
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

  /**
   * Validates the manually entered branch details and
   * the separately selected map coordinates.
   */
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

  /**
   * Creates the branch with:
   * - manually entered address;
   * - map-selected latitude;
   * - map-selected longitude.
   */
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

    setLoading(true);

    try {
      const { data, error } =
        await createBranchAPI(payload);

      if (error) {
        showErrorToast(error);
        return;
      }

      /*
       * The existing backend may return HTTP 200 with only
       * a validation message. A successful branch response
       * should contain the newly created branch ID.
       */
      if (!data?.id) {
        showErrorToast(
          data?.message ||
            "The branch could not be created."
        );
        return;
      }

      showSuccessToast(
        data?.message ||
          "Branch created successfully."
      );

      navigate("/staff/branches");
    } catch (error) {
      showErrorToast(
        error?.message ||
          "Something went wrong while creating the branch."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="max-w-5xl">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <CreateBranchState
            Icon={RiShieldUserLine}
            title="No Access"
            description="Only SUPER_ADMIN users can create branches."
            iconClassName="bg-red-50 text-red-600"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <Link
              to="/staff/branches"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600"
            >
              <RiArrowLeftLine size={18} />
              Back to branches
            </Link>
          </div>

          <div className="mb-6 border-b border-gray-100 pb-5">
            <h3 className="text-lg font-bold text-gray-900">
              Branch Details
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Enter the known physical address
              manually and select the exact branch
              coordinates from the map.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Branch name */}
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
                disabled={loading}
                placeholder="Example: Maharagama Branch"
                autoComplete="organization"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            {/* Manual branch address */}
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
                disabled={loading}
                rows={3}
                placeholder="Enter the physical branch address"
                autoComplete="street-address"
                className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 disabled:bg-gray-50 disabled:text-gray-400"
              />

              <p className="mt-2 text-xs leading-5 text-gray-400">
                Enter the known physical address
                manually. Selecting a map location
                does not change this address.
              </p>
            </div>

            {/* Map-selected coordinates */}
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
                      center pin. Only the latitude and
                      longitude are saved from the map.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setLocationPickerOpen(true)
                  }
                  disabled={loading}
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
                    Selected Coordinates
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
                <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                  No map location has been selected
                  yet.
                </div>
              )}
            </div>

            {/* Contact and email */}
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
                  disabled={loading}
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
                  disabled={loading}
                  placeholder="Example: maharagama@cravehouse.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-700">
              New branches are created as active
              branches. You can later deactivate a
              branch from the branch list or branch
              details page.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Link
                to="/staff/branches"
                className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Spinner className="h-4 w-4 border-orange-200 border-t-white" />
                ) : (
                  <RiAddLine size={18} />
                )}

                {loading
                  ? "Creating..."
                  : "Create Branch"}
              </button>
            </div>
          </form>
        </div>
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

function cleanContactNumber(value) {
  const cleaned = String(value || "")
    .replace(/[^\d+]/g, "");

  if (!cleaned.includes("+")) {
    return cleaned;
  }

  return `+${cleaned.replace(/\+/g, "")}`;
}

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .replace(/^ROLE_/, "")
    .replace(/\s+/g, "_")
    .toUpperCase();
}

function formatCoordinate(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "N/A";
  }

  return numericValue.toFixed(6);
}

function CreateBranchState({
  Icon,
  title,
  description,
  iconClassName,
}) {
  return (
    <div className="text-center">
      <div
        className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${iconClassName}`}
      >
        <Icon size={24} />
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

function Spinner({ className }) {
  return (
    <span
      className={`inline-flex animate-spin rounded-full border-2 ${className}`}
    />
  );
}