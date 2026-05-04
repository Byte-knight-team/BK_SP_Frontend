import { buildApiUrl } from '../apis/apiHelper'

export async function loginStaff({ email, password }) {
  const response = await fetch(buildApiUrl('/api/auth/staff/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Login failed')
  }

  return data
}

export async function changeStaffPassword(payload) {
  const token = localStorage.getItem('token')

  const response = await fetch(buildApiUrl('/api/auth/staff/change-password'), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Password change failed')
  }

  return data
}
