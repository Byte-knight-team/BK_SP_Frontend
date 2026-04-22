import axios from 'axios'

// Create a global Axios instance pointed at your Spring Boot Backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// REQUEST INTERCEPTOR: Automatically attaches your JWT token to every request
api.interceptors.request.use(
  (config) => {
    // Change 'jwt_token' if you use a different key in localStorage!
    const token = localStorage.getItem('jwt_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// RESPONSE INTERCEPTOR: Catches 401 Unauthorized errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.error('Authentication Error: Your token is invalid or expired.')
      // Later you can uncomment this to auto-logout the user:
      // localStorage.removeItem('jwt_token');
      // window.location.href = '/login';
    }
    return Promise.reject(error)
  },
)

export default api
