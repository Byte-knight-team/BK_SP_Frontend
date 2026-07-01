import { authFetch, buildApiUrl } from '../apiHelper'

export const getAllMenuItemsAPI = async () => {
  try {
    const response = await authFetch(buildApiUrl('/api/v1/menu'))
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to load menu items' }
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const createMenuItemAPI = async (itemData) => {
  try {
    const response = await authFetch(buildApiUrl('/api/v1/menu'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to create menu item' }
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const updateMenuItemAPI = async (id, itemData) => {
  try {
    const response = await authFetch(buildApiUrl(`/api/v1/menu/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to update menu item' }
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

// Get the ingredient list (recipe) for a specific menu item
export const getMenuItemIngredientsAPI = async (menuItemId) => {
  try {
    const response = await authFetch(buildApiUrl(`/api/v1/menu/${menuItemId}/ingredients`))
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to load ingredients' }
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

// Save (replace) the full ingredient list for a menu item
// ingredients = [{ inventoryItemId, quantityRequired }, ...]
export const saveMenuItemIngredientsAPI = async (menuItemId, ingredients) => {
  try {
    const response = await authFetch(buildApiUrl(`/api/v1/menu/${menuItemId}/ingredients`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients }),
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to save ingredients' }
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}
