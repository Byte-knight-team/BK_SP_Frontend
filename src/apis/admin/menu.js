import { authFetch } from '../apiHelper';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const MENU_BASE = `${API_BASE}/api/v1/menu`;

const parseResponse = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
};

const toArray = (value) => (Array.isArray(value) ? value : []);



export const getMenuItemsCountAPI = async () => {
  const response = await authFetch(`${MENU_BASE}/count`);
  const payload = await parseResponse(response, 'Unable to load menu items count.');
  return typeof payload === 'number' ? payload : (payload?.data ?? payload ?? 0);
};

export const getAvailableItemsCountAPI = async () => {
  const response = await authFetch(`${MENU_BASE}/available/count`);
  const payload = await parseResponse(response, 'Unable to load available items count.');
  return typeof payload === 'number' ? payload : (payload?.data ?? payload ?? 0);
};



export const createMenuItemAPI = async (menuItemPayload) => {
  const response = await authFetch(`${MENU_BASE}`, {
    method: 'POST',
    body: JSON.stringify(menuItemPayload),
  });

  const payload = await parseResponse(response, 'Unable to create menu item.');
  return payload?.data ?? payload;
};

export const getPendingMenuItemsAPI = async () => {
  const response = await authFetch(`${MENU_BASE}/pending-chef-items`);
  const payload = await parseResponse(response, 'Unable to load pending menu items.');
  return toArray(payload?.data ?? payload);
};

export const approveMenuItemAPI = async (id, approvalPayload = {}) => {
  const response = await authFetch(`${MENU_BASE}/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(approvalPayload),
  });

  const payload = await parseResponse(response, 'Unable to approve menu item.');
  return payload?.data ?? payload;
};

export const rejectMenuItemAPI = async (id, rejectionReason) => {
  const response = await authFetch(`${MENU_BASE}/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ rejectionReason }),
  });

  const payload = await parseResponse(response, 'Unable to reject menu item.');
  return payload?.data ?? payload;
};

export const getMenuItemsAPI = async () => {
  const response = await authFetch(`${MENU_BASE}`);
  const payload = await parseResponse(response, 'Unable to load menu items.');
  return toArray(payload?.data ?? payload);
};

export const getMenuItemByIdAPI = async (id) => {
  const response = await authFetch(`${MENU_BASE}/${id}`);
  const payload = await parseResponse(response, 'Unable to load menu item details.');
  return payload?.data ?? payload;
};

export const updateMenuItemAPI = async (id, menuItemPayload) => {
  const response = await authFetch(`${MENU_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(menuItemPayload),
  });

  const payload = await parseResponse(response, 'Unable to update menu item.');
  return payload?.data ?? payload;
};

export const deleteMenuItemAPI = async (id) => {
  const response = await authFetch(`${MENU_BASE}/${id}`, {
    method: 'DELETE',
  });

  const payload = await parseResponse(response, 'Unable to delete menu item.');
  return payload?.data ?? payload;
};



// Admin APIs for Ingredients (added from MenuController)
export const getAdminMenuItemIngredientsAPI = async (id) => {
  const response = await authFetch(MENU_BASE + '/' + id + '/ingredients');
  const data = await parseResponse(response, 'Failed to fetch ingredients');
  return { data, error: null };
};

export const saveAdminMenuItemIngredientsAPI = async (id, ingredients) => {
  const response = await authFetch(MENU_BASE + '/' + id + '/ingredients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients }),
  });
  const data = await parseResponse(response, 'Failed to save ingredients');
  return { data, error: null };
};