<template>
  <div class="app">
    <header>
      <h1>用户留言系统</h1>
      <div class="user-info">
        <template v-if="userStore.isAuthenticated">
          <div class="logged-in-user">
            <span>欢迎, {{ userStore.user?.username }}</span>
            <button @click="handleLogout" class="btn">
              <i class="fas fa-sign-out-alt"></i> 退出
            </button>
          </div>
        </template>
        <template v-else>
          <button @click="showLogin = true" class="btn">
            <i class="fas fa-sign-in-alt"></i> 登录
          </button>
          <button @click="showRegister = true" class="btn">
            <i class="fas fa-user-plus"></i> 注册
          </button>
        </template>
      </div>
    </header>

    <main>
      <router-view />

      <LoginForm v-if="showLogin" @close="showLogin = false" @success="handleLoginSuccess" />
      <RegisterForm v-if="showRegister" @close="showRegister = false" @success="handleRegisterSuccess" />
    </main>

    <MessageNotification :message="notification.message" :type="notification.type" v-if="notification.show" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from './stores/user'
import { useNotificationStore } from './stores/notification'
import LoginForm from './components/LoginForm.vue'
import RegisterForm from './components/RegisterForm.vue'
import MessageNotification from './components/MessageNotification.vue'

const userStore = useUserStore()
const notificationStore = useNotificationStore()

const showLogin = ref(false)
const showRegister = ref(false)

const notification = ref({
  show: false,
  message: '',
  type: 'success'
})

const handleLogout = async () => {
  await userStore.logout()
  notification.value = {
    show: true,
    message: '已成功退出登录',
    type: 'success'
  }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

const handleLoginSuccess = () => {
  showLogin.value = false
  notification.value = {
    show: true,
    message: '登录成功！',
    type: 'success'
  }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

const handleRegisterSuccess = () => {
  showRegister.value = false
  showLogin.value = true
  notification.value = {
    show: true,
    message: '注册成功，请登录！',
    type: 'success'
  }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}
</script>

<style scoped>
.app {
  min-height: 100vh;
}
</style>
