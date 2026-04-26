import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiEditLine,
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiShieldUserLine,
  RiStore2Line,
  RiMoneyDollarCircleLine,
} from "@remixicon/react";

import { getStaffByIdAPI } from "../../apis/staff/staff";

export default function StaffDetailsPage() {
  const { id } = useParams();
  const { setHeaderInfo } = useOutletContext();

  // Staff member loaded from backend
  const [staff, setStaff] = useState(null);

  // Page loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setHeaderInfo({
      title: "Staff Details",
      description: "View staff account information and branch assignment.",
      Icon: RiUserLine,
    });

    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  useEffect(() => {
    const loadStaff = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await getStaffByIdAPI(id);

      if (error) {
        setError(error);
        setStaff(null);
      } else {
        setStaff(data);
      }

      setLoading(false);
    };

    loadStaff();
  }, [id]);

  const isActive =
    typeof staff?.active === "boolean"
      ? staff.active
      : typeof staff?.isActive === "boolean"
        ? staff.isActive
        : false;

  /*
  Formats salary for display.
 
  Old staff records may have null salary, so we show Not assigned.
*/
  const formatSalary = (salary) => {
    if (salary === null || salary === undefined || salary === "") {
      return "Not assigned";
    }

    return Number(salary).toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm text-sm text-gray-500">
        Loading staff details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
        <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>

        <Link
          to={staffListPath}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600"
        >
          <RiArrowLeftLine size={18} />
          Back to staff list
        </Link>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm text-sm text-gray-500">
        Staff member not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            to={staffListPath}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600"
          >
            <RiArrowLeftLine size={18} />
            Back to staff list
          </Link>

          <Link
            to={`/staff/staff/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600"
          >
            <RiEditLine size={18} />
            Edit Staff
          </Link>
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {staff.fullName || staff.name || "No name"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              @{staff.username || "no-username"}
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-1.5 text-xs font-bold ${isActive
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-500"
              }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          <DetailCard
            icon={RiMailLine}
            label="Email"
            value={staff.email || "No email"}
          />

          <DetailCard
            icon={RiPhoneLine}
            label="Phone"
            value={staff.phone || "No phone"}
          />

          <DetailCard
            icon={RiShieldUserLine}
            label="Role"
            value={staff.roleName || staff.role || "N/A"}
          />

          <DetailCard
            icon={RiMoneyDollarCircleLine}
            label="Monthly Salary"
            value={formatSalary(staff.salary)}
          />

          <DetailCard
            icon={RiStore2Line}
            label="Branch"
            value={staff.branchName || staff.branch?.name || "Global Access"}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * PUT /api/admin/roles/{id}
 *
 * Updates role details such as description or baseSalary.
 *
 * For salary feature, we mainly send:
 * {
 *   baseSalary: 60000
 * }
 */
export async function updateRoleAPI(id, roleData) {
  const response = await authFetch(`${ADMIN_API_BASE_URL}/roles/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roleData),
  });

  return handleResponse(response, "Failed to update role.");
}

// Small reusable card for displaying one staff field
function DetailCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="text-orange-500">
          <Icon size={20} />
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {label}
          </div>
          <div className="text-sm font-semibold text-gray-900 mt-1">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}