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