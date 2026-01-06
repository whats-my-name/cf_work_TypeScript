import { defineStore } from 'pinia'
import { authAPI, userAPI } from '../api'
import { messageAPI } from '../api/message'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: false
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    async login(username, password) {
      try {
        const response = await authAPI.login(username, password)
        if (response.data.success) {
          this.user = response.data.user
          this.isAuthenticated = true
          // 保存到 localStorage
          localStorage.setItem('currentUser', JSON.stringify(this.user))
          return { success: true }
        }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || '登录失败，请重试'
        }
      }
    },

    async register(username, email, password) {
      try {
        const response = await authAPI.register(username, email, password)
        if (response.data.success) {
          return { success: true }
        }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || '注册失败，请重试'
        }
      }
    },

    async logout() {
      try {
        await authAPI.logout()
      } catch (error) {
        console.error('登出失败:', error)
      } finally {
        this.user = null
        this.isAuthenticated = false
        localStorage.removeItem('currentUser')
      }
    },

    async checkLoginStatus() {
      try {
        const response = await authAPI.getCurrentUser()
        if (response.data.id) {
          this.user = response.data
          this.isAuthenticated = true
          localStorage.setItem('currentUser', JSON.stringify(this.user))
        }
      } catch (error) {
        this.user = null
        this.isAuthenticated = false
        localStorage.removeItem('currentUser')
      }
    },

    async fetchUsers() {
      try {
        const response = await userAPI.getUsers()
        return response.data
      } catch (error) {
        console.error('获取用户列表失败:', error)
        return []
      }
    },

    async updateUserRole(userId, role) {
      try {
        await userAPI.updateUserRole(userId, role)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || '更新失败'
        }
      }
    }
  }
})
