import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// ── Doctors ───────────────────────────────────────────────────
export const doctorsApi = {
  list: (specialization) => api.get('/doctors', { params: specialization ? { specialization } : {} }),
  get: (id) => api.get(`/doctors/${id}`),
  createProfile: (data) => api.post('/doctors/profile', data),
  updateProfile: (data) => api.put('/doctors/profile', data),
  addSchedule: (data) => api.post('/doctors/schedules', data),
  deleteSchedule: (id) => api.delete(`/doctors/schedules/${id}`),
  getSlots: (doctorId, date) => api.get(`/doctors/${doctorId}/available-slots`, { params: { date } }),
}

// ── Appointments ──────────────────────────────────────────────
export const appointmentsApi = {
  book: (data) => api.post('/appointments', data),
  myAppointments: () => api.get('/appointments/my'),
  get: (id) => api.get(`/appointments/${id}`),
  update: (id, data) => api.patch(`/appointments/${id}`, data),
  cancel: (id) => api.delete(`/appointments/${id}`),
}

// ── Admin ─────────────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: () => api.get('/admin/users'),
  doctors: () => api.get('/admin/doctors'),
  appointments: () => api.get('/admin/appointments'),
  updateAppointment: (id, data) => api.patch(`/admin/appointments/${id}`, data),
  toggleUser: (id) => api.patch(`/admin/users/${id}/deactivate`),
}

export default api
