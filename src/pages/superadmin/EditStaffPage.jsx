import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { RiArrowLeftLine, RiEditLine } from "@remixicon/react";

import { getStaffByIdAPI, updateStaffAPI } from "../../apis/staff/staff";
import { getAllBranchesAPI } from "../../apis/staff/branches";

const SUPER_ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "CHEF",
  "RECEPTIONIST",
  "DELIVERY",
];

const ADMIN_ROLES = ["MANAGER", "CHEF", "RECEPTIONIST", "DELIVERY"];

export default function EditStaffPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setHeaderInfo } = useOutletContext();

  // Logged-in user details are used to control frontend permissions
  const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
  const loggedInRole = authUser.roleName || authUser.role || "";
  const loggedInBranchId = authUser.branchId || "";
  const loggedInBranchName = authUser.branchName || "Your branch";

  const isSuperAdmin = loggedInRole === "SUPER_ADMIN";
  const allowedRoles = isSuperAdmin ? SUPER_ADMIN_ROLES : ADMIN_ROLES;

  // Form data used for staff update
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    roleName: "",
    branchId: "",
  });

  // Branch dropdown data, only needed for SUPER_ADMIN
  const [branches, setBranches] = useState([]);

  // Page states
  const [pageLoading, setPageLoading] = useState(true);
  const [branchLoading, setBranchLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setHeaderInfo({
      title: "Edit Staff",
      description: "Update staff account details, role, and branch assignment.",
      Icon: RiEditLine,
    });

    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  useEffect(() => {
    const loadPageData = async () => {
      setPageLoading(true);
      setError("");

      // Load staff details first
      const staffResult = await getStaffByIdAPI(id);

      if (staffResult.error) {
        setError(staffResult.error);
        setPageLoading(false);
        return;
      }

      const staff = staffResult.data;

      setFormData({
        fullName: staff.fullName || staff.name || "",
        email: staff.email || "",
        phone: staff.phone || "",
        roleName: staff.roleName || staff.role || "",
        branchId: staff.branchId || staff.branch?.id || "",
      });

      // SUPER_ADMIN can choose from all branches.
      // ADMIN does not need all branches because ADMIN is locked to own branch.
      if (isSuperAdmin) {
        setBranchLoading(true);

        const branchResult = await getAllBranchesAPI();

        if (!branchResult.error) {
          setBranches(Array.isArray(branchResult.data) ? branchResult.data : []);
        }

        setBranchLoading(false);
      }

      setPageLoading(false);
    };

    loadPageData();
  }, [id, isSuperAdmin]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => {
      const updatedData = {
        ...previous,
        [name]: value,
      };

      // SUPER_ADMIN role is global, so it does not need a branch
      if (name === "roleName" && value === "SUPER_ADMIN") {
        updatedData.branchId = "";
      }

      return updatedData;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    // Backend update endpoint expects these fields.
    // Username is not included here because username usually should not be changed after creation.
    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      roleName: formData.roleName,
      branchId:
        formData.roleName === "SUPER_ADMIN"
          ? null
          : isSuperAdmin
            ? Number(formData.branchId)
            : Number(loggedInBranchId),
    };

    if (!payload.fullName || !payload.email || !payload.phone || !payload.roleName) {
      setError("Please fill all required fields.");
      setSaving(false);
      return;
    }

    if (payload.roleName !== "SUPER_ADMIN" && !payload.branchId) {
      setError("Please select a branch.");
      setSaving(false);
      return;
    }

    const { error } = await updateStaffAPI(id, payload);

    if (error) {
      setError(error);
      setSaving(false);
      return;
    }

    setSaving(false);

    // Redirect back to staff list with a success message
    navigate("/staff/staff", {
      state: {
        successMessage: "Staff member updated successfully.",
      },
    });
  };

  if (pageLoading) {
    return (
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm text-sm text-gray-500">
        Loading staff details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
        <div className="mb-6">
          <Link
            to={`/staff/staff/${id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600"
          >
            <RiArrowLeftLine size={18} />
            Back to staff details
          </Link>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role
              </label>
              <select
                name="roleName"
                value={formData.roleName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                {allowedRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {isSuperAdmin ? (
              formData.roleName !== "SUPER_ADMIN" ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch
                  </label>

                  <select
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleChange}
                    disabled={branchLoading}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
                  >
                    <option value="">
                      {branchLoading ? "Loading branches..." : "Select branch"}
                    </option>

                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch
                  </label>

                  <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                    Global access — no branch required
                  </div>
                </div>
              )
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Branch
                </label>

                <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {loggedInBranchName}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/staff/staff"
              className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}