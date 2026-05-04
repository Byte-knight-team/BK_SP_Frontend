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

export const getMenuCategoriesAPI = async () => {
  const response = await authFetch(`${MENU_BASE}/categories`);
  const payload = await parseResponse(response, 'Unable to load categories.');
  const rows = toArray(payload?.data ?? payload);

  return rows
    .map((entry) => {
      if (typeof entry === 'string') {
        return { id: entry, name: entry };
      }

      return {
        id: entry?.id ?? entry?.categoryId ?? entry?.name,
        name: entry?.name ?? entry?.categoryName ?? '',
      };
    })
    .filter((entry) => entry.name);
};

export const getMenuCategoriesCountAPI = async () => {
  const response = await authFetch(`${MENU_BASE}/categories/count`);
  const payload = await parseResponse(response, 'Unable to load categories count.');
  return typeof payload === 'number' ? payload : (payload?.data ?? payload ?? 0);
};

export const getMenuSubcategoriesCountAPI = async () => {
  const response = await authFetch(`${MENU_BASE}/subcategories/count`);
  const payload = await parseResponse(response, 'Unable to load subcategories count.');
  return typeof payload === 'number' ? payload : (payload?.data ?? payload ?? 0);
};

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

export const getMenuSubcategoriesAPI = async ({ categoryId = '', categoryName = '' } = {}) => {
  const params = new URLSearchParams();

  if (categoryId) {
    params.set('categoryId', categoryId);
  }

  if (categoryName) {
    params.set('category', categoryName);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await authFetch(`${MENU_BASE}/subcategories${query}`);
  const payload = await parseResponse(response, 'Unable to load subcategories.');
  const rows = toArray(payload?.data ?? payload);

  return rows
    .map((entry) => {
      if (typeof entry === 'string') {
        return entry;
      }

      return entry?.name ?? entry?.subCategory ?? '';
    })
    .filter(Boolean);
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

export const deleteMenuCategoryAPI = async (id) => {
  const response = await authFetch(`${API_BASE}/api/v1/categories/${id}`, {
    method: 'DELETE',
  });

  const payload = await parseResponse(response, 'Unable to delete category.');
  return payload?.data ?? payload;
};

export const createMenuCategoryAPI = async (categoryPayload) => {
  const response = await authFetch(`${API_BASE}/api/v1/categories`, {
    method: 'POST',
    body: JSON.stringify(categoryPayload),
  });

  const payload = await parseResponse(response, 'Unable to create category.');
  return payload?.data ?? payload;
};
