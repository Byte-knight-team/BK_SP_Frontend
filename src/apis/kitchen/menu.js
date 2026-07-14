import { authFetch, buildApiUrl } from '../apiHelper'

// All calls in this file hit the kitchen-owned menu endpoints
// (/api/v1/kitchen/menu/...), which are a separate backend controller/service
// from the admin-side menu endpoints (/api/v1/menu/...). This keeps kitchen
// menu development fully independent of whatever the admin side changes.
// Responses are wrapped in StandardResponse ({ code, message, data }), so
// every call below unwraps `result.data`.

const BASE = '/api/v1/kitchen/menu'

export const getMyMenuItemsAPI = async () => {
  try {
    const response = await authFetch(buildApiUrl(BASE))
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to load menu items' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

// payload matches CreateKitchenMenuItemRequest on the backend — always lands PENDING
export const createMenuItemAPI = async (payload) => {
  try {
    const response = await authFetch(buildApiUrl(BASE), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to create menu item' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

// Flip "in stock now". Backend rejects this unless the item is already ACTIVE.
export const toggleMenuItemAvailabilityAPI = async (id, isAvailable) => {
  try {
    const response = await authFetch(buildApiUrl(`${BASE}/${id}/availability`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable }),
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to update availability' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

// Get the ingredient list (recipe) for a specific menu item
export const getMenuItemIngredientsAPI = async (menuItemId) => {
  try {
    const response = await authFetch(buildApiUrl(`${BASE}/${menuItemId}/ingredients`))
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to load ingredients' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

// Save (replace) the full ingredient list for a menu item
// ingredients = [{ inventoryItemId, quantityRequired }, ...]
export const saveMenuItemIngredientsAPI = async (menuItemId, ingredients) => {
  try {
    const response = await authFetch(buildApiUrl(`${BASE}/${menuItemId}/ingredients`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients }),
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to save ingredients' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

// ACTIVE categories only — for the create-item category dropdown
export const getActiveCategoriesAPI = async () => {
  try {
    const response = await authFetch(buildApiUrl(`${BASE}/categories`))
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to load categories' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

// Distinct sub-category names already used in my branch (optionally narrowed
// to one category) — lets the chef pick an existing one or type a new one
export const getSubCategoriesAPI = async (categoryId) => {
  try {
    const url = categoryId
      ? `${BASE}/subcategories?categoryId=${categoryId}`
      : `${BASE}/subcategories`
    const response = await authFetch(buildApiUrl(url))
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to load sub-categories' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

// Ask the admin to change something on an ACTIVE item. Only ACTIVE items can
// have a request raised — the backend rejects PENDING/REJECTED items.
export const createEditRequestAPI = async (menuItemId, chefNote) => {
  try {
    const response = await authFetch(buildApiUrl(`${BASE}/edit-requests`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuItemId, chefNote }),
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to submit edit request' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

// My own edit requests (any status), newest first — for the My Requests page
export const getMyEditRequestsAPI = async () => {
  try {
    const response = await authFetch(buildApiUrl(`${BASE}/edit-requests`))
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to load edit requests' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}
