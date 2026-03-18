import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API-feil:', err.message)
    return Promise.reject(err)
  }
)

// NYHAVNA-SPESIFIKT: Fast plan-ID for prototypen
export const PLAN_ID = 'nyhavna-2024'

export default api
