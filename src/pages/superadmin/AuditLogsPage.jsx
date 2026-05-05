import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiErrorWarningLine,
  RiFileList3Line,
  RiRefreshLine,
  RiShieldUserLine,
} from "@remixicon/react";

import { getAuditLogsAPI } from "../../apis/staff/auditLogs";
import { useAuth } from "../../context/AuthContext";

/*
  AuditLogsPage
  Shows latest logs with pagination.
*/


//
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
  const [error, setError] = useState("");

  useEffect(() => {
    setHeaderInfo({
      title: "Audit Logs",
      subtitle: "Monitor important system activity records.",
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
      return "bg-green-50 text-green-700 border border-green-200";
    }

    if (status === "FAILURE") {
      return "bg-red-50 text-red-700 border border-red-200";
    }

    return "bg-slate-50 text-slate-700 border border-slate-200";
  };

  const loadAuditLogs = useCallback(async () => {
    if (!isSuperAdmin) return;

    setLoading(true);
    setError("");

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
      setError(error.message || "Failed to load audit logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, isSuperAdmin]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  if (!isSuperAdmin) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <RiShieldUserLine size={28} />
          </div>

          <h2 className="text-xl font-semibold text-slate-900">No Access</h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Audit Logs are available only for SUPER_ADMIN users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simple summary and reload card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <RiFileList3Line size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                System Audit Records
              </h2>

              <p className="text-sm text-slate-500">
                Total logs:{" "}
                <span className="font-semibold text-slate-800">
                  {pageInfo.totalElements}
                </span>
              </p>
            </div>
          </div>

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

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <RiErrorWarningLine size={22} className="mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Audit table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Latest Audit Logs
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
              Try reloading the page after performing a system action.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Actor</th>
                  <th className="px-5 py-3">Module</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Endpoint</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      #{log.id}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDateTime(log.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {log.actorEmail || "System"}
                      </div>

                      <div className="text-xs text-slate-500">
                        {log.actorRoleName || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
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
                        {log.httpMethod || "-"}
                      </div>

                      <div className="max-w-xs truncate text-xs text-slate-500">
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
    </div>
  );
}