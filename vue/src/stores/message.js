import { defineStore } from 'pinia'
import { messageAPI } from '../api/message'

export const useMessageStore = defineStore('message', {
  state: () => ({
    messages: []
  }),

  actions: {
    async loadMessages() {
      try {
        const response = await messageAPI.getMessages()
        this.messages = response.data
      } catch (error) {
        console.error('加载留言失败:', error)
        this.messages = []
      }
    },

    async createMessage(content, image) {
      try {
        const response = await messageAPI.createMessage(content, image)
        if (response.data.success) {
          await this.loadMessages()
          return { success: true }
        }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || '留言失败，请重试'
        }
      }
    },

    async deleteMessage(messageId) {
      try {
        const response = await messageAPI.deleteMessage(messageId)
        if (response.data.success) {
          await this.loadMessages()
          return { success: true }
        }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || '删除失败'
        }
      }
    }
  }
})
