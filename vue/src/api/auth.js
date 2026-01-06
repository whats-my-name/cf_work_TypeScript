import api from '../utils/api'

export const authAPI = {
  login: (username, password) => api.post('/login', { username, password }),
  register: (username, email, password) => api.post('/register', { username, email, password }),
  logout: () => api.post('/logout'),
  getCurrentUser: () => api.get('/me')
}
