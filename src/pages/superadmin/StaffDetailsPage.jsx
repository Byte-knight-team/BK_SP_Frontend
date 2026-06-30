import { useCallback, useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useOutletContext,
  useParams,
} from "react-router-dom";
import {
  RiArrowLeftLine,
  RiEditLine,
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiShieldUserLine,
  RiStore2Line,
  RiMoneyDollarCircleLine,
  RiErrorWarningLine,
} from "@remixicon/react";

import { getStaffByIdAPI } from "../../apis/staff/staff";
import { showErrorToast } from "../../utils/toast";

/*
  StaffDetailsPage

  Purpose:
  - Shows one staff member's details.
  - Used by both SUPER_ADMIN and ADMIN staff routes.

  Routes:
  - SUPER_ADMIN: /staff/staff/:id
  - ADMIN:       /admin/staff/:id

  Important:
  - This page detects the current route.
  - If opened from /admin, back/edit links stay in /admin.
  - If opened from /staff, back/edit links stay in /staff.
*/
export default function StaffDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const { setHeaderInfo } = useOutletContext();

  const isAdminPanelRoute = location.pathname.startsWith("/admin");

  const staffListPath = isAdminPanelRoute ? "/admin/staff" : "/staff/staff";

  const staffEditPath = isAdminPanelRoute
    ? `/admin/staff/${id}/edit`
    : `/staff/staff/${id}/edit`;

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    setHeaderInfo({
      title: "Staff Details",
      description: "View staff account information and branch assignment.",
      Icon: RiUserLine,
    });

    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setPageError("");

    const { data, error } = await getStaffByIdAPI(id);

    if (error) {
      setPageError(error);
      setStaff(null);
      showErrorToast(error);
    } else {
      setStaff(data);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const isActive =
    typeof staff?.active === "boolean"
      ? staff.active
      : typeof staff?.isActive === "boolean"
        ? staff.isActive
        : false;

  const formatSalary = (salary) => {
    if (salary === null || salary === undefined || salary === "") {
      return "Not assigned";
    }

    return `LKR ${Number(salary).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="max-w-5xl">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <StaffDetailsState
            Icon={RiUserLine}
            title="Loading staff details"
            description="Please wait while the staff account information is loaded."
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
          <BackToStaffListLink staffListPath={staffListPath} />

          <StaffDetailsState
            Icon={RiErrorWarningLine}
            title="Could not load staff details"
            description={pageError}
            iconClassName="bg-red-50 text-red-600"
          />
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="max-w-5xl">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <BackToStaffListLink staffListPath={staffListPath} />

          <StaffDetailsState
            Icon={RiUserLine}
            title="Staff member not found"
            description="The selected staff account could not be found. It may have been removed or the ID may be incorrect."
            iconClassName="bg-gray-100 text-gray-600"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        {/* Back link */}
        <BackToStaffListLink staffListPath={staffListPath} />

        {/* Main staff identity section */}
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900">
                {staff.fullName || staff.name || "No name"}
              </h3>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              @{staff.username || "no-username"}
            </p>
          </div>

          <Link
            to={staffEditPath}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
          >
            <RiEditLine size={18} />
            Edit Staff
          </Link>
        </div>

        {/* Staff information cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
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
            wide
          />
        </div>
      </div>
    </div>
  );
}

function BackToStaffListLink({ staffListPath }) {
  return (
    <div className="mb-6">
      <Link
        to={staffListPath}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600"
      >
        <RiArrowLeftLine size={18} />
        Back to staff list
      </Link>
    </div>
  );
}

function StaffDetailsState({
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

      <h3 className="font-semibold text-gray-900">{title}</h3>

      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}




//This is for showing the details in cards style 
function DetailCard({ icon: Icon, label, value, wide = false }) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 ${
        wide ? "md:col-span-2" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {label}
          </div>

          <div className="mt-1 break-words text-sm font-semibold text-gray-900">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}