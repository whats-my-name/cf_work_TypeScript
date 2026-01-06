import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: []
  }),

  actions: {
    show(message, type = 'success') {
      const notification = {
        id: Date.now(),
        message,
        type
      }
      this.notifications.push(notification)

      setTimeout(() => {
        this.remove(notification.id)
      }, 3000)
    },

    remove(id) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
      }
    }
  }
})
