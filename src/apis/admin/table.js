import { authFetch } from '../apiHelper';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const ADMIN_BASE = `${API_BASE}/api/admin`;

const parseResponse = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
};

export const getActiveQrCodeAPI = async (tableId) => {
  const response = await authFetch(`${ADMIN_BASE}/tables/${tableId}/qr-codes/active`);
  const payload = await parseResponse(response, 'Unable to get active QR code.');
  return payload?.data ?? payload;
};

export const createQrCodeAPI = async (tableId) => {
  const response = await authFetch(`${ADMIN_BASE}/tables/${tableId}/qr-codes`, {
    method: 'POST',
  });
  const payload = await parseResponse(response, 'Unable to create QR code.');
  return payload?.data ?? payload;
};

export const regenerateQrCodeAPI = async (qrCodeId, revokeReason) => {
  const response = await authFetch(`${ADMIN_BASE}/qr-codes/${qrCodeId}/regenerate`, {
    method: 'POST',
    body: JSON.stringify({ revokeReason }),
  });
  const payload = await parseResponse(response, 'Unable to regenerate QR code.');
  return payload?.data ?? payload;
};

export const revokeQrCodeAPI = async (qrCodeId, revokedReason) => {
  const response = await authFetch(`${ADMIN_BASE}/qr-codes/${qrCodeId}/revoke`, {
    method: 'POST',
    body: JSON.stringify({ revokedReason }),
  });
  const payload = await parseResponse(response, 'Unable to revoke QR code.');
  return payload?.data ?? payload;
};

export const downloadQrCodeAPI = async (qrCodeId) => {
  const response = await authFetch(`${ADMIN_BASE}/qr-codes/${qrCodeId}/download`);
  if (!response.ok) {
    throw new Error('Unable to download QR code.');
  }
  const blob = await response.blob();
  return blob;
};
