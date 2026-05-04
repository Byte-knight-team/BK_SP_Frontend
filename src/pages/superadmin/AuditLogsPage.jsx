import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiEyeLine,
  RiFileList3Line,
  RiFilter3Line,
  RiRefreshLine,
  RiShieldUserLine,
} from "@remixicon/react";

import {
  getAuditLogsAPI,
  getAuditLogByIdAPI,
  AUDIT_MODULE_OPTIONS,
  AUDIT_STATUS_OPTIONS,
} from "../../apis/staff/auditLogs";

import { useAuth } from "../../context/AuthContext";

/*
  AuditLogsPage

  Shows backend audit logs for SUPER_ADMIN.
  AOP logs stay clean, while manual update logs can still show old/new values.
*/

const EVENT_TYPE_OPTIONS = [
  "LOGIN_SUCCESS",
  "LOGIN_FAILED",
  "PASSWORD_CHANGED",

  "STAFF_CREATED",
  "STAFF_UPDATED",
  "STAFF_ACTIVATED",
  "STAFF_DEACTIVATED",
  "INVITE_RESENT",

  "ROLE_CREATED",
  "ROLE_UPDATED",
  "ROLE_DELETED",
  "ROLE_PERMISSIONS_UPDATED",

  "BRANCH_CREATED",
  "BRANCH_UPDATED",
  "BRANCH_ACTIVATED",
  "BRANCH_DEACTIVATED",

  "GLOBAL_CONFIG_UPDATED",
  "BRANCH_CONFIG_UPDATED",
  "BRANCH_OPERATING_HOURS_UPDATED",

  "MENU_CATEGORY_CREATED",
  "MENU_CATEGORY_UPDATED",
  "MENU_CATEGORY_DELETED",

  "MENU_ITEM_CREATED",
  "MENU_ITEM_UPDATED",
  "MENU_ITEM_APPROVED",
  "MENU_ITEM_REJECTED",
  "MENU_ITEM_AVAILABILITY_CHANGED",
  "MENU_ITEM_DELETED",

  "TABLE_CREATED",
  "TABLE_UPDATED",
  "TABLE_STATUS_UPDATED",
  "TABLE_DELETED",

  "QR_CODE_CREATED",
  "QR_CODE_REVOKED",
  "QR_CODE_REGENERATED",

  "ORDER_CREATED",
  "ORDER_CANCELLED",

  "PAYMENT_STATUS_UPDATED",

  "CHEF_REQUEST_CREATED",
  "CHEF_REQUEST_RESOLVED",
  "CHEF_ASSIGNED",
  "CHEF_CHECKED_IN",
  "CHEF_CHECKED_OUT",
  "CHEF_WORK_STATUS_UPDATED",
  "ORDER_ON_HOLD",
  "MEAL_STARTED",
  "MEAL_COMPLETED",

  "INVENTORY_ITEM_CREATED",
  "INVENTORY_ITEM_RESTOCKED",
  "INVENTORY_STOCK_REMOVED",
  "INVENTORY_ITEM_CORRECTED",

  "DRIVER_ASSIGNED",
  "DELIVERY_ACCEPTED",
  "DELIVERY_REJECTED",
  "DELIVERY_STATUS_UPDATED",
  "DELIVERY_ONLINE_STATUS_UPDATED",

  "REPORT_GENERATED",
];

const PAGE_SIZE = 20;

export default function AuditLogsPage() {
  const { setHeaderInfo } = useOutletContext();
  const { user } = useAuth();

  const roleName = user?.roleName || user?.role || "";
  const isSuperAdmin = roleName === "SUPER_ADMIN";

  const [logs, setLogs] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    number: 0,
    totalPages: 0,
    totalElements: 0,
    first: true,
    last: true,
  });

  const [filters, setFilters] = useState({
    module: "",
    eventType: "",
    status: "",
  });

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    setHeaderInfo({
      title: "Audit Logs",
      subtitle: "Monitor authentication, staff, branch, RBAC, and configuration actions.",
    });

    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    if (status === "SUCCESS") {
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }

    if (status === "FAILURE") {
      return "bg-red-50 text-red-700 border border-red-200";
    }

    return "bg-slate-50 text-slate-700 border border-slate-200";
  };

  const getModuleBadgeClass = (module) => {
    if (module === "AUTH") {
      return "bg-blue-50 text-blue-700 border border-blue-200";
    }

    if (module === "STAFF") {
      return "bg-purple-50 text-purple-700 border border-purple-200";
    }

    if (module === "BRANCH") {
      return "bg-orange-50 text-orange-700 border border-orange-200";
    }

    if (module === "CONFIG") {
      return "bg-cyan-50 text-cyan-700 border border-cyan-200";
    }

    if (module === "RBAC") {
      return "bg-indigo-50 text-indigo-700 border border-indigo-200";
    }

    return "bg-slate-50 text-slate-700 border border-slate-200";
  };

  const formatJsonText = (jsonText) => {
    if (!jsonText) return "-";

    try {
      return JSON.stringify(JSON.parse(jsonText), null, 2);
    } catch {
      return jsonText;
    }
  };

  const hasJsonValue = (jsonText) => {
    return jsonText !== null && jsonText !== undefined && String(jsonText).trim() !== "";
  };

  const loadAuditLogs = useCallback(async () => {
    if (!isSuperAdmin) return;

    setLoading(true);
    setError("");

    try {
      const data = await getAuditLogsAPI({
        module: filters.module,
        eventType: filters.eventType,
        status: filters.status,
        page,
        size: PAGE_SIZE,
      });

      setLogs(data?.content || []);

      setPageInfo({
        number: data?.number ?? 0,
        totalPages: data?.totalPages ?? 0,
        totalElements: data?.totalElements ?? 0,
        first: data?.first ?? true,
        last: data?.last ?? true,
      });
    } catch (error) {
      setError(error.message || "Failed to load audit logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page, isSuperAdmin]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const handleFilterChange = (name, value) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      module: "",
      eventType: "",
      status: "",
    });

    setPage(0);
  };

  const handleViewDetails = async (id) => {
    setDetailLoading(true);
    setError("");

    try {
      const data = await getAuditLogByIdAPI(id);
      setSelectedLog(data);
    } catch (error) {
      setError(error.message || "Failed to load audit log details.");
    } finally {
      setDetailLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <RiShieldUserLine size={28} />
          </div>

          <h2 className="text-xl font-semibold text-slate-900">No Access</h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Audit Logs are currently available only for SUPER_ADMIN users.
            Please use a SUPER_ADMIN account to view system activity logs.
          </p>
        </div>
      </div>
    );
  }

  const shouldShowChangeDetails =
    selectedLog &&
    (hasJsonValue(selectedLog.oldValuesJson) || hasJsonValue(selectedLog.newValuesJson));

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <RiFileList3Line size={22} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Total Logs</p>
              <p className="text-2xl font-semibold text-slate-900">
                {pageInfo.totalElements}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <RiFilter3Line size={22} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Current Page</p>
              <p className="text-2xl font-semibold text-slate-900">
                {pageInfo.totalPages === 0 ? 0 : pageInfo.number + 1}
                <span className="text-sm font-medium text-slate-500">
                  {" "}
                  / {pageInfo.totalPages}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <RiShieldUserLine size={22} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Access Level</p>
              <p className="text-lg font-semibold text-slate-900">SUPER_ADMIN</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
            <p className="text-sm text-slate-500">
              Filter logs by module, event type, or status.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RiCloseLine size={18} />
              Clear
            </button>

            <button
              type="button"
              onClick={loadAuditLogs}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RiRefreshLine size={18} />
              Reload
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Module
            </label>

            <select
              value={filters.module}
              onChange={(event) =>
                handleFilterChange("module", event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              <option value="">All modules</option>

              {AUDIT_MODULE_OPTIONS.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Event Type
            </label>

            <select
              value={filters.eventType}
              onChange={(event) =>
                handleFilterChange("eventType", event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              <option value="">All event types</option>

              {EVENT_TYPE_OPTIONS.map((eventType) => (
                <option key={eventType} value={eventType}>
                  {eventType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              value={filters.status}
              onChange={(event) =>
                handleFilterChange("status", event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              <option value="">All statuses</option>

              {AUDIT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <RiErrorWarningLine size={22} className="mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Audit logs table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Audit Log Records
          </h2>
          <p className="text-sm text-slate-500">
            Shows recent system actions recorded by the backend.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <RiFileList3Line size={24} />
            </div>

            <h3 className="font-semibold text-slate-900">No audit logs found</h3>

            <p className="mt-1 text-sm text-slate-500">
              Try clearing filters or reloading the page.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Module</th>
                  <th className="px-5 py-3">Event</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actor</th>
                  <th className="px-5 py-3">Endpoint</th>
                  <th className="px-5 py-3">Created At</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      #{log.id}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getModuleBadgeClass(
                          log.module
                        )}`}
                      >
                        {log.module || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {log.eventType || "-"}
                      </div>

                      <div className="max-w-xs truncate text-xs text-slate-500">
                        {log.description || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          log.status
                        )}`}
                      >
                        {log.status || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {log.actorEmail || "-"}
                      </div>

                      <div className="text-xs text-slate-500">
                        {log.actorRoleName || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {log.httpMethod || "-"}
                      </div>

                      <div className="max-w-xs truncate text-xs text-slate-500">
                        {log.endpoint || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDateTime(log.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(log.id)}
                        disabled={detailLoading}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <RiEyeLine size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            Page {pageInfo.totalPages === 0 ? 0 : pageInfo.number + 1} of{" "}
            {pageInfo.totalPages} • {pageInfo.totalElements} total logs
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(current - 1, 0))}
              disabled={pageInfo.first || loading}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RiArrowLeftSLine size={18} />
              Previous
            </button>

            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={pageInfo.last || loading}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <RiArrowRightSLine size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Details modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Audit Log #{selectedLog.id}
                </h2>

                <p className="text-sm text-slate-500">
                  {selectedLog.eventType} • {formatDateTime(selectedLog.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <RiCloseLine size={22} />
              </button>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              <DetailItem label="Module" value={selectedLog.module} />
              <DetailItem label="Event Type" value={selectedLog.eventType} />
              <DetailItem label="Status" value={selectedLog.status} />
              <DetailItem label="Severity" value={selectedLog.severity} />
              <DetailItem label="Target Type" value={selectedLog.targetType} />
              <DetailItem label="Target ID" value={selectedLog.targetId} />
              <DetailItem label="Actor User ID" value={selectedLog.actorUserId} />
              <DetailItem label="Actor Email" value={selectedLog.actorEmail} />
              <DetailItem label="Actor Role" value={selectedLog.actorRoleName} />
              <DetailItem label="Branch ID" value={selectedLog.branchId} />
              <DetailItem label="HTTP Method" value={selectedLog.httpMethod} />
              <DetailItem label="Endpoint" value={selectedLog.endpoint} />
              <DetailItem label="IP Address" value={selectedLog.ipAddress} />
              <DetailItem
                label="Created At"
                value={formatDateTime(selectedLog.createdAt)}
              />
            </div>

            <div className="space-y-4 border-t border-slate-200 p-5">
              <div>
                <h3 className="mb-2 font-semibold text-slate-900">Description</h3>

                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                  {selectedLog.description || "-"}
                </p>
              </div>

              {shouldShowChangeDetails && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-semibold text-slate-900">
                    Change Details
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    These values are shown only for manual audit logs that store before/after data.
                  </p>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {hasJsonValue(selectedLog.oldValuesJson) && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-slate-800">
                          Old Values
                        </h4>

                        <pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
                          {formatJsonText(selectedLog.oldValuesJson)}
                        </pre>
                      </div>
                    )}

                    {hasJsonValue(selectedLog.newValuesJson) && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-slate-800">
                          New Values
                        </h4>

                        <pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
                          {formatJsonText(selectedLog.newValuesJson)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/*
  Small reusable component for the detail modal.
*/
function DetailItem({ label, value }) {
  const displayValue =
    value === null || value === undefined || value === "" ? "-" : String(value);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-medium text-slate-900">
        {displayValue}
      </p>
    </div>
  );
}