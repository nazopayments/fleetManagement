const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const getAuthToken = () => localStorage.getItem('fleettrack_token')
export const setAuthToken = (token) => localStorage.setItem('fleettrack_token', token)
export const clearAuthToken = () => localStorage.removeItem('fleettrack_token')

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken()
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  })

  if (response.status === 401) {
    // Unauthorized, clear token and reload to force login
    clearAuthToken()
    window.location.reload()
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || 'API Request Failed')
  }

  return response.json()
}
