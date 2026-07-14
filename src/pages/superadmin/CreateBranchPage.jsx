import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  RiBuilding2Line,
  RiArrowLeftLine,
  RiAddLine,
  RiShieldUserLine,
  RiMapPinLine,
} from "@remixicon/react";

import { useAuth } from "../../context/AuthContext";
import { createBranchAPI } from "../../apis/staff/branches";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

import LocationPickerModal from "../../components/customer/LocationPickerModal";

export default function CreateBranchPage() {
  const navigate = useNavigate();
  const { setHeaderInfo } = useOutletContext();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNumber: "",
    email: "",
    latitude: null,
    longitude: null,
  });

  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const loggedInRole = user?.roleName || user?.role || "";
  const isSuperAdmin = loggedInRole === "SUPER_ADMIN";

  useEffect(() => {
    setHeaderInfo({
      title: "Create Branch",
      description:
        "Add a new restaurant branch and select its exact map location.",
      Icon: RiBuilding2Line,
    });

    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    const cleanedValue =
      name === "contactNumber"
        ? cleanContactNumber(value)
        : value;

    setFormData((previous) => ({
      ...previous,
      [name]: cleanedValue,
    }));
  };

  const handleLocationConfirm = ({ lat, lng, address }) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      showErrorToast("Unable to read the selected map coordinates.");
      return;
    }

    if (!address || !address.trim()) {
      showErrorToast(
        "Please search and select a location so its address can be recorded."
      );
      return;
    }

    setFormData((previous) => ({
      ...previous,
      address: address.trim(),
      latitude: lat,
      longitude: lng,
    }));

    setLocationPickerOpen(false);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Branch name is required.";
    }

    if (!formData.address.trim()) {
      return "Please select the branch location from the map.";
    }

    if (
      !Number.isFinite(formData.latitude) ||
      !Number.isFinite(formData.longitude)
    ) {
      return "Please select the branch location from the map.";
    }

    if (!formData.contactNumber.trim()) {
      return "Contact number is required.";
    }

    const phoneRegex = /^\+?\d{10,15}$/;

    if (!phoneRegex.test(formData.contactNumber.trim())) {
      return "Contact number is invalid.";
    }

    if (!formData.email.trim()) {
      return "Branch email is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email.trim())) {
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

    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      contactNumber: formData.contactNumber.trim(),
      email: formData.email.trim(),
      latitude: formData.latitude,
      longitude: formData.longitude,
    };

    const { error } = await createBranchAPI(payload);

    setLoading(false);

    if (error) {
      showErrorToast(error);
      return;
    }

    showSuccessToast("Branch created successfully.");
    navigate("/staff/branches");
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
              Enter the branch details and choose its exact location from the
              map.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Branch Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                placeholder="Example: Maharagama Branch"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 disabled:bg-gray-50 disabled:text-gray-400"
              />
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
                      Search and select the exact restaurant location. The map
                      provides the address and coordinates automatically.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setLocationPickerOpen(true)}
                  disabled={loading}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RiMapPinLine size={18} />

                  {formData.latitude !== null
                    ? "Change Location"
                    : "Select Location"}
                </button>
              </div>

              {formData.address ? (
                <div className="mt-4 rounded-2xl border border-green-100 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                    Selected Location
                  </p>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {formData.address}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    Latitude: {formData.latitude} · Longitude:{" "}
                    {formData.longitude}
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                  No branch location has been selected yet.
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Address
              </label>

              <textarea
                name="address"
                value={formData.address}
                readOnly
                rows="3"
                placeholder="Select a location from the map"
                className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none"
              />

              <p className="mt-2 text-xs text-gray-400">
                This address is filled automatically from the selected map
                location.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Contact Number
                </label>

                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Example: +94771234567"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Example: maharagama@cravehouse.com"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-700">
              New branches are created as active branches. You can later
              deactivate the branch from the branch list or details page.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Link
                to="/staff/branches"
                className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Spinner className="h-4 w-4 border-orange-200 border-t-white" />
                ) : (
                  <RiAddLine size={18} />
                )}

                {loading ? "Creating..." : "Create Branch"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <LocationPickerModal
        isOpen={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        onConfirm={handleLocationConfirm}
      />
    </>
  );
}

function cleanContactNumber(value) {
  const cleaned = value.replace(/[^\d+]/g, "");

  if (!cleaned.includes("+")) {
    return cleaned;
  }

  return `+${cleaned.replace(/\+/g, "")}`;
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

      <h3 className="font-semibold text-gray-900">{title}</h3>

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