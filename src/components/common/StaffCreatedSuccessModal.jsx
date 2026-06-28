import { useState } from "react";
import {
  RiArrowLeftLine,
  RiCheckboxCircleLine,
  RiCheckLine,
  RiCloseLine,
  RiEyeLine,
  RiFileCopyLine,
  RiMailCheckLine,
  RiMailCloseLine,
  RiRefreshLine,
} from "@remixicon/react";

export default function StaffCreatedSuccessModal({
  staff,
  onViewStaff,
  onCreateAnother,
  onBackToList,
  onClose,
}) {
  const [copied, setCopied] = useState(false);

  if (!staff) return null;

  const emailSent = Boolean(staff.emailSent);
  const temporaryPassword = staff.temporaryPassword || "";

  const handleCopyTemporaryPassword = async () => {
    if (!temporaryPassword) return;

    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-900/40 px-4 py-8">
      <div className="w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
              <RiCheckboxCircleLine size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Staff Created Successfully
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                The staff account has been created and is ready to use.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close success modal"
          >
            <RiCloseLine size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoCard label="Full Name" value={staff.fullName} />
            <InfoCard label="Username" value={staff.username} />
            <InfoCard label="Email" value={staff.email} />
            <InfoCard label="Phone" value={staff.phone} />
            <InfoCard label="Role" value={formatEnumLabel(staff.roleName)} />
            <InfoCard label="Branch" value={staff.branchName} />
          </div>

          {/* Invite / temporary password status */}
          <div
            className={`mt-5 rounded-2xl border px-4 py-4 ${
              emailSent
                ? "border-green-100 bg-green-50 text-green-800"
                : "border-orange-100 bg-orange-50 text-orange-900"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ${
                  emailSent ? "text-green-600" : "text-orange-600"
                }`}
              >
                {emailSent ? (
                  <RiMailCheckLine size={21} />
                ) : (
                  <RiMailCloseLine size={21} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold">
                  {emailSent
                    ? "Invite email sent successfully"
                    : "Manual password sharing required"}
                </h4>

                <p className="mt-1 text-sm leading-6">
                  {emailSent
                    ? staff.message ||
                      "The staff member can check their email for login instructions."
                    : "The staff account was created, but the invite email could not be delivered."}
                </p>

                {!emailSent && temporaryPassword && (
                  <div className="mt-3 rounded-2xl border border-orange-100 bg-white px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                          Temporary Password
                        </span>

                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-red-600 ring-1 ring-red-100">
                          Shown Once
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyTemporaryPassword}
                        className={`inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-bold transition ${
                          copied
                            ? "bg-green-50 text-green-700 ring-1 ring-green-100"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                        }`}
                      >
                        {copied ? (
                          <>
                            <RiCheckLine size={14} />
                            Copied
                          </>
                        ) : (
                          <>
                            <RiFileCopyLine size={14} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-3 rounded-xl bg-gray-950 px-4 py-3 font-mono text-sm font-bold tracking-wide text-white">
                      {temporaryPassword}
                    </div>

                    <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2">
                      <p className="text-xs font-bold leading-5 text-red-700">
                        Copy this password before closing. It will not be shown
                        again.
                      </p>
                    </div>
                  </div>
                )}

                {!emailSent && !temporaryPassword && (
                  <div className="mt-3 rounded-xl border border-orange-100 bg-white px-3 py-2">
                    <p className="text-xs font-semibold leading-5 text-orange-800">
                      No temporary password was returned by the backend. Please
                      check the staff record or resend the invitation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="grid grid-cols-1 gap-3 border-t border-gray-100 px-6 py-5 sm:grid-cols-3">
          <button
            type="button"
            onClick={onViewStaff}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-orange-100 hover:bg-orange-600"
          >
            <RiEyeLine size={17} />
            View Staff
          </button>

          <button
            type="button"
            onClick={onCreateAnother}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
          >
            <RiRefreshLine size={17} />
            Create Another
          </button>

          <button
            type="button"
            onClick={onBackToList}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            <RiArrowLeftLine size={17} />
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
}

function formatEnumLabel(value) {
  if (!value) return "-";

  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}