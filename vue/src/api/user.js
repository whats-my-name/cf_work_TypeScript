import api from '../utils/api'

export const userAPI = {
  getUsers: () => api.get('/users'),
  updateUserRole: (userId, role) => api.patch(`/users/${userId}/role`, { role })
}
