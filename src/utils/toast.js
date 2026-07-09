import { toast } from "react-toastify";

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

export function getErrorMessage(error, fallbackMessage = "Something went wrong. Please try again.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
}