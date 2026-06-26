import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiFileList3Line,
  RiRefreshLine,
  RiSearchLine,
  RiShieldUserLine,
} from "@remixicon/react";

import { getAuditLogsAPI } from "../../apis/staff/auditLogs";
import { useAuth } from "../../context/AuthContext";
import { showErrorToast } from "../../utils/toast";

/*
  AuditLogsPage
  Shows latest logs with pagination, search, and page-level filters.
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

  useEffect(() => {
    setHeaderInfo({
      title: "Audit Logs",
      description: "Monitor important system activity records.",
      Icon: RiFileList3Line,
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
      return "border border-green-200 bg-green-50 text-green-700";
    }

    if (status === "FAILURE") {
      return "border border-red-200 bg-red-50 text-red-700";
    }

    return "border border-gray-200 bg-gray-50 text-gray-700";
  };

  const loadAuditLogs = useCallback(async () => {
    if (!isSuperAdmin) return;

    setLoading(true);

    try {
      const data = await getAuditLogsAPI({
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
  }, [page, isSuperAdmin]);

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

    return Array.from(moduleSet).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesStatus =
        statusFilter === "ALL" || String(log.status || "") === statusFilter;

      const matchesModule =
        moduleFilter === "ALL" || String(log.module || "") === moduleFilter;

      const searchableText = [
        log.id,
        log.actorEmail,
        log.actorRoleName,
        log.module,
        log.eventType,
        log.status,
        log.description,
        log.httpMethod,
        log.endpoint,
        log.createdAt,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearchTerm ||
        searchableText.includes(normalizedSearchTerm);

      return matchesStatus && matchesModule && matchesSearch;
    });
  }, [logs, searchTerm, statusFilter, moduleFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setModuleFilter("ALL");
  };

  if (!isSuperAdmin) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <RiShieldUserLine size={28} />
          </div>

          <h2 className="text-xl font-semibold text-gray-900">No Access</h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Audit Logs are available only for SUPER_ADMIN users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Controls card */}
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              System Audit Records
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Review backend-recorded actions, actors, modules, and endpoints.
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
            <RiRefreshLine size={18} />
            {loading ? "Reloading..." : "Reload"}
          </button>
        </div>

        {/* Search and filters */}
        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_220px_auto]">
          <div className="relative">
            <RiSearchLine
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search actor, module, action, endpoint..."
              className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILURE">Failure</option>
          </select>

          <select
            value={moduleFilter}
            onChange={(event) => setModuleFilter(event.target.value)}
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
          >
            <option value="ALL">All Modules</option>

            {availableModules.map((moduleName) => (
              <option key={moduleName} value={moduleName}>
                {moduleName}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Audit table card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
              <RiFileList3Line size={24} />
            </div>

            <h3 className="font-semibold text-gray-900">No audit logs found</h3>

            <p className="mt-1 text-sm text-gray-500">
              Try reloading the page after performing a system action.
            </p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
              <RiSearchLine size={24} />
            </div>

            <h3 className="font-semibold text-gray-900">No matching logs</h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing the search text or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full min-w-[1280px] text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="w-[90px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    ID
                  </th>

                  <th className="w-[190px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Time
                  </th>

                  <th className="w-[250px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Actor
                  </th>

                  <th className="w-[150px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Module
                  </th>

                  <th className="w-[270px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Action
                  </th>

                  <th className="w-[130px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="w-[290px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Endpoint
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-4 align-middle font-semibold text-gray-900">
                      #{log.id}
                    </td>

                    <td className="px-5 py-4 align-middle text-gray-600">
                      {formatDateTime(log.createdAt)}
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="font-medium text-gray-900">
                        {log.actorEmail || "System"}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        {log.actorRoleName || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {log.module || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="font-medium text-gray-900">
                        {log.eventType || "-"}
                      </div>

                      <div className="mt-1 max-w-[260px] truncate text-xs text-gray-500">
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
                      <div className="font-semibold text-gray-900">
                        {log.httpMethod || "-"}
                      </div>

                      <div
                        className="mt-1 max-w-[280px] truncate text-xs text-gray-500"
                        title={log.endpoint || "-"}
                      >
                        {log.endpoint || "-"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-500">
            Page {pageInfo.totalPages === 0 ? 0 : pageInfo.number + 1} of{" "}
            {pageInfo.totalPages} • Showing {filteredLogs.length} of{" "}
            {logs.length} logs on this page
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
      </div>
    </div>
  );
}