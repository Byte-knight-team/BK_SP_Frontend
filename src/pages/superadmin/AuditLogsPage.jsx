import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiEyeLine,
  RiFileList3Line,
  RiRefreshLine,
  RiSearchLine,
  RiShieldUserLine,
} from "@remixicon/react";

import {
  getAuditLogByIdAPI,
  getAuditLogsAPI,
} from "../../apis/staff/auditLogs";
import { useAuth } from "../../context/AuthContext";
import { showErrorToast } from "../../utils/toast";

/*
  AuditLogsPage
  Shows audit logs with backend filters, pagination, and a detailed view modal.
*/
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

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    setHeaderInfo({
      title: "Audit Logs",
      description: "Monitor important system activity records.",
      Icon: RiFileList3Line,
    });

    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  /*
    Reset backend page when backend filters change.
  */
  useEffect(() => {
    setPage(0);
  }, [statusFilter, moduleFilter, eventTypeFilter, fromDate, toDate]);

  const loadAuditLogs = useCallback(async () => {
    if (!isSuperAdmin) return;

    if (fromDate && toDate && fromDate > toDate) {
      showErrorToast("From date cannot be later than To date.");
      return;
    }

    setLoading(true);

    try {
      const data = await getAuditLogsAPI({
        page,
        size: PAGE_SIZE,
        module: moduleFilter,
        eventType: eventTypeFilter,
        status: statusFilter,
        from: fromDate,
        to: toDate,
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
      showErrorToast(error.message || "Failed to load audit logs.");
      setLogs([]);

      setPageInfo({
        number: 0,
        totalPages: 0,
        totalElements: 0,
        first: true,
        last: true,
      });
    } finally {
      setLoading(false);
    }
  }, [
    page,
    isSuperAdmin,
    statusFilter,
    moduleFilter,
    eventTypeFilter,
    fromDate,
    toDate,
  ]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const availableModules = useMemo(() => {
    const moduleSet = new Set();

    logs.forEach((log) => {
      if (log.module) {
        moduleSet.add(log.module);
      }
    });

    if (moduleFilter !== "ALL") {
      moduleSet.add(moduleFilter);
    }

    return Array.from(moduleSet).sort();
  }, [logs, moduleFilter]);

  const availableEventTypes = useMemo(() => {
    const eventTypeSet = new Set();

    logs.forEach((log) => {
      if (log.eventType) {
        eventTypeSet.add(log.eventType);
      }
    });

    if (eventTypeFilter !== "ALL") {
      eventTypeSet.add(eventTypeFilter);
    }

    return Array.from(eventTypeSet).sort();
  }, [logs, eventTypeFilter]);

  /*
    Search stays frontend-only on the loaded page.
    Backend filters handle status, module, event type, and date range.
  */
  const filteredLogs = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return logs.filter((log) => {
      const searchableText = [
        log.id,
        log.actorUserId,
        log.actorEmail,
        log.actorRoleName,
        log.branchId,
        log.module,
        log.eventType,
        log.status,
        log.severity,
        log.targetType,
        log.targetId,
        log.description,
        log.httpMethod,
        log.endpoint,
        log.ipAddress,
        log.userAgent,
        log.createdAt,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        !normalizedSearchTerm ||
        searchableText.includes(normalizedSearchTerm)
      );
    });
  }, [logs, searchTerm]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "ALL" ||
    moduleFilter !== "ALL" ||
    eventTypeFilter !== "ALL" ||
    fromDate ||
    toDate;

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setModuleFilter("ALL");
    setEventTypeFilter("ALL");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  const openDetailsModal = async (log) => {
    setSelectedLog(log);
    setDetailsLoading(true);

    try {
      const fullLog = await getAuditLogByIdAPI(log.id);
      setSelectedLog(fullLog);
    } catch (error) {
      showErrorToast(error.message || "Failed to load audit log details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetailsModal = () => {
    setSelectedLog(null);
    setDetailsLoading(false);
  };

  if (!isSuperAdmin) {
    return (
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
        <AuditTableState
          Icon={RiShieldUserLine}
          title="No Access"
          description="Audit Logs are available only for SUPER_ADMIN users."
          iconClassName="bg-red-50 text-red-600"
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary and filters */}
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              System Audit Records
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Review recent system actions recorded by the backend.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Total logs:{" "}
              <span className="font-semibold text-gray-800">
                {pageInfo.totalElements}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={loadAuditLogs}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Spinner className="h-4 w-4 border-gray-300 border-t-orange-500" />
            ) : (
              <RiRefreshLine size={18} />
            )}

            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            <label className="block xl:col-span-5">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                Search
              </span>

              <div className="relative">
                <RiSearchLine
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search actor, endpoint, IP..."
                  className="h-[46px] w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
                />
              </div>
            </label>

            <label className="block xl:col-span-2">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                Status
              </span>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-[46px] w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
              >
                <option value="ALL">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILURE">Failure</option>
              </select>
            </label>

            <label className="block xl:col-span-2">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                Module
              </span>

              <select
                value={moduleFilter}
                onChange={(event) => setModuleFilter(event.target.value)}
                className="h-[46px] w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
              >
                <option value="ALL">All Modules</option>

                {availableModules.map((moduleName) => (
                  <option key={moduleName} value={moduleName}>
                    {formatEnumLabel(moduleName)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block xl:col-span-3">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                Event Type
              </span>

              <select
                value={eventTypeFilter}
                onChange={(event) => setEventTypeFilter(event.target.value)}
                className="h-[46px] w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
              >
                <option value="ALL">All Event Types</option>

                {availableEventTypes.map((eventTypeName) => (
                  <option key={eventTypeName} value={eventTypeName}>
                    {formatEnumLabel(eventTypeName)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block xl:col-span-3">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                From Date
              </span>

              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="h-[46px] w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
              />
            </label>

            <label className="block xl:col-span-3">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                To Date
              </span>

              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="h-[46px] w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
              />
            </label>

            <div className="flex items-end xl:col-span-2">
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="inline-flex h-[46px] w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:text-gray-700"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-500">
            Showing{" "}
            <span className="font-bold text-gray-800">
              {filteredLogs.length}
            </span>{" "}
            of <span className="font-bold text-gray-800">{logs.length}</span>{" "}
            logs on this page
          </div>
        </div>
      </div>

      {/* Audit table */}
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-3 shadow-sm">
        {loading ? (
          <AuditTableState
            Icon={RiFileList3Line}
            title="Loading audit logs"
            description="Please wait while system activity records are loaded."
            iconClassName="bg-gray-100 text-gray-600"
            loading
          />
        ) : logs.length === 0 ? (
          <AuditTableState
            Icon={RiFileList3Line}
            title="No audit logs found"
            description="Try reloading the page after performing a system action."
            iconClassName="bg-gray-100 text-gray-600"
          />
        ) : filteredLogs.length === 0 ? (
          <AuditTableState
            Icon={RiSearchLine}
            title="No matching logs"
            description="Try changing the search text or filters."
            iconClassName="bg-orange-50 text-orange-600"
          />
        ) : (
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="w-[80px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    ID
                  </th>

                  <th className="w-[110px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Module
                  </th>

                  <th className="w-[220px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Event
                  </th>

                  <th className="w-[120px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="w-[240px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Actor
                  </th>

                  <th className="w-[240px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Endpoint
                  </th>

                  <th className="w-[150px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Created At
                  </th>

                  <th className="w-[100px] px-5 py-3.5 pr-6 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-4 align-middle font-semibold text-gray-900">
                      #{log.id}
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getModuleBadgeClass(
                          log.module
                        )}`}
                      >
                        {log.module || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="font-semibold text-gray-900">
                        {formatEnumLabel(log.eventType)}
                      </div>

                      <div className="mt-1 max-w-[210px] truncate text-xs text-gray-500">
                        {log.description || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          log.status
                        )}`}
                      >
                        {log.status || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="max-w-[220px] truncate text-sm font-medium text-gray-800">
                        {log.actorEmail || "System"}
                      </div>

                      <div className="mt-1 text-xs font-medium text-gray-500">
                        {log.actorRoleName || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="font-bold text-gray-900">
                        {log.httpMethod || "-"}
                      </div>

                      <div
                        className="mt-1 max-w-[230px] truncate text-xs text-gray-500"
                        title={log.endpoint || "-"}
                      >
                        {log.endpoint || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-middle text-sm text-gray-600">
                      {formatDateTime(log.createdAt)}
                    </td>

                    <td className="px-5 py-4 pr-6 align-middle text-right">
                      <button
                        type="button"
                        onClick={() => openDetailsModal(log)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <RiEyeLine size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && logs.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-500">
              Page{" "}
              <span className="font-semibold text-gray-800">
                {pageInfo.totalPages === 0 ? 0 : pageInfo.number + 1}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">
                {pageInfo.totalPages}
              </span>{" "}
              • Backend matched{" "}
              <span className="font-semibold text-gray-800">
                {pageInfo.totalElements}
              </span>{" "}
              logs
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(current - 1, 0))}
                disabled={pageInfo.first || loading}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RiArrowLeftSLine size={18} />
                Previous
              </button>

              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={pageInfo.last || loading}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <RiArrowRightSLine size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedLog && (
        <AuditLogDetailsModal
          log={selectedLog}
          loading={detailsLoading}
          onClose={closeDetailsModal}
        />
      )}
    </div>
  );
}

function AuditLogDetailsModal({ log, loading, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-900/40 px-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Audit Log Details
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Full backend-recorded details for log #{log.id}.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <RiCloseLine size={18} />
          </button>
        </div>

        <div className="custom-scrollbar max-h-[calc(90vh-88px)] overflow-y-auto p-5">
          {loading && (
            <div className="mb-5 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <Spinner className="h-5 w-5 border-gray-300 border-t-orange-500" />

                <div>
                  <h4 className="text-sm font-bold text-orange-900">
                    Loading full audit details
                  </h4>

                  <p className="mt-0.5 text-sm text-orange-700">
                    Please wait while the selected audit record is loaded.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <ModalInfoCard label="Audit ID" value={`#${log.id || "-"}`} />
            <ModalInfoCard
              label="Created At"
              value={formatDateTime(log.createdAt)}
            />
            <ModalInfoCard label="Module" value={log.module} />
            <ModalInfoCard
              label="Event Type"
              value={formatEnumLabel(log.eventType)}
            />
            <ModalInfoCard
              label="Status"
              value={log.status}
              badgeClassName={getStatusBadgeClass(log.status)}
            />
            <ModalInfoCard label="Severity" value={log.severity} />
            <ModalInfoCard label="Target Type" value={log.targetType} />
            <ModalInfoCard label="Target ID" value={log.targetId} />
            <ModalInfoCard label="Actor User ID" value={log.actorUserId} />
            <ModalInfoCard label="Actor Email" value={log.actorEmail} />
            <ModalInfoCard label="Actor Role" value={log.actorRoleName} />
            <ModalInfoCard label="Branch ID" value={log.branchId} />
            <ModalInfoCard label="HTTP Method" value={log.httpMethod} />
            <ModalInfoCard label="Endpoint" value={log.endpoint} />
            <ModalInfoCard label="IP Address" value={log.ipAddress} />
          </div>

          <section className="mt-5">
            <h4 className="text-sm font-bold text-gray-900">Description</h4>

            <div className="mt-2 rounded-2xl bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700">
              {log.description || "No description recorded."}
            </div>
          </section>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <JsonPanel title="Old Values" jsonValue={log.oldValuesJson} />
            <JsonPanel title="New Values" jsonValue={log.newValuesJson} />
          </div>

          <section className="mt-5">
            <h4 className="text-sm font-bold text-gray-900">User Agent</h4>

            <div className="mt-2 rounded-2xl bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700">
              {log.userAgent || "-"}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ModalInfoCard({ label, value, badgeClassName = "" }) {
  const displayValue = value || "-";

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      {badgeClassName ? (
        <span
          className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${badgeClassName}`}
        >
          {displayValue}
        </span>
      ) : (
        <p className="mt-2 break-words text-sm font-bold text-gray-900">
          {displayValue}
        </p>
      )}
    </div>
  );
}

function JsonPanel({ title, jsonValue }) {
  return (
    <section>
      <h4 className="mb-2 text-sm font-bold text-gray-900">{title}</h4>

      <pre className="custom-scrollbar max-h-72 overflow-auto rounded-2xl bg-gray-950 p-4 text-xs leading-6 text-gray-100">
        {formatJson(jsonValue)}
      </pre>
    </section>
  );
}

function AuditTableState({
  Icon,
  title,
  description,
  iconClassName,
  loading = false,
}) {
  return (
    <div className="p-8 text-center">
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
    </div>
  );
}

function getStatusBadgeClass(status) {
  if (status === "SUCCESS") {
    return "border border-green-200 bg-green-50 text-green-700";
  }

  if (status === "FAILURE") {
    return "border border-red-200 bg-red-50 text-red-700";
  }

  return "border border-gray-200 bg-gray-50 text-gray-700";
}

function getModuleBadgeClass(module) {
  if (module === "AUTH") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (module === "BRANCH") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  if (module === "STAFF" || module === "USER") {
    return "border-purple-200 bg-purple-50 text-purple-700";
  }

  if (module === "ROLE" || module === "PERMISSION") {
    return "border-green-200 bg-green-50 text-green-700";
  }

  return "border-gray-200 bg-gray-50 text-gray-700";
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatEnumLabel(value) {
  if (!value) return "-";

  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatJson(value) {
  if (!value) {
    return "-";
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return String(value);
  }
}

function Spinner({ className }) {
  return (
    <span
      className={`inline-flex animate-spin rounded-full border-2 ${className}`}
    />
  );
}