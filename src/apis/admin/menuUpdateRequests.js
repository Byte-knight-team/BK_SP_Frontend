import { authFetch } from '../apiHelper';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const ADMIN_REQUESTS_BASE = `${API_BASE}/api/v1/admin/menu-item-requests`;

const parseResponse = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
};

const toArray = (value) => (Array.isArray(value) ? value : []);

export const getMenuUpdateRequestsAPI = async (status = '') => {
  const url = status ? `${ADMIN_REQUESTS_BASE}?status=${status}` : ADMIN_REQUESTS_BASE;
  const response = await authFetch(url);
  const payload = await parseResponse(response, 'Unable to load menu update requests.');
  return toArray(payload?.data ?? payload);
};

export const makeMenuUpdateRequestDecisionAPI = async (id, decisionPayload) => {
  const response = await authFetch(`${ADMIN_REQUESTS_BASE}/${id}/decision`, {
    method: 'PUT',
    body: JSON.stringify(decisionPayload),
  });

  const payload = await parseResponse(response, 'Unable to make decision on menu update request.');
  return payload?.data ?? payload;
};
