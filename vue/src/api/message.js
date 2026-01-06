import api from '../utils/api'

export const messageAPI = {
  getMessages: () => api.get('/messages'),
  createMessage: (content, image) => api.post('/messages', { content, image }),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`)
}
