import { RiCloseLine, RiLogoutBoxRLine } from "@remixicon/react";

export default function LogoutConfirmModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-900/45 px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-[1.4rem] border border-gray-100 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <RiLogoutBoxRLine size={23} />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                Confirm Logout
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Are you sure you want to end your current session?
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close logout confirmation"
          >
            <RiCloseLine size={18} />
          </button>
        </div>

        <div className="border-t border-gray-100 px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-red-100 transition hover:bg-red-600"
            >
              <RiLogoutBoxRLine size={17} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}