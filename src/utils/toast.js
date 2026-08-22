import React from "react";
import { toast } from "react-toastify";
import { LogOut, DoorOpen } from "lucide-react";

const toastOptions = {
  position: "bottom-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export function showSuccessToast(message = "Action completed successfully.") {
  toast.success(message, toastOptions);
}

export function showErrorToast(message = "Something went wrong. Please try again.") {
  toast.error(message, toastOptions);
}

export function showWarningToast(message = "Please check the details and try again.") {
  toast.warning(message, toastOptions);
}

export function showInfoToast(message = "Information updated.") {
  toast.info(message, toastOptions);
}

export const orangeRedToastStyle = {
  style: {
    background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
    color: "#ffffff",
    fontWeight: "600",
    borderRadius: "12px",
    boxShadow: "0 10px 25px -5px rgba(234, 88, 12, 0.4)",
  },
  progressStyle: {
    background: "#fed7aa",
  },
};

export function showSignOutToast(message = "Signed out successfully") {
  toast(message, {
    ...toastOptions,
    ...orangeRedToastStyle,
    icon: () => React.createElement(LogOut, { size: 18, className: "text-white shrink-0", strokeWidth: 2.2 }),
  });
}

export function showLeaveTableToast(message = "You have left the table session") {
  toast(message, {
    ...toastOptions,
    ...orangeRedToastStyle,
    icon: () => React.createElement(DoorOpen, { size: 18, className: "text-white shrink-0", strokeWidth: 2.2 }),
  });
}

export function getErrorMessage(error, fallbackMessage = "Something went wrong. Please try again.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
}