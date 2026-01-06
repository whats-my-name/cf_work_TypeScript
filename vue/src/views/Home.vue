<template>
  <section class="message-section">
    <MessageForm v-if="userStore.isAuthenticated" @success="handleMessageSuccess" />
    <UserManagement v-if="userStore.user?.role === 'admin'" />
    <MessageList />
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notification'
import MessageForm from '../components/MessageForm.vue'
import UserManagement from '../components/UserManagement.vue'
import MessageList from '../components/MessageList.vue'

const userStore = useUserStore()

onMounted(() => {
  userStore.checkLoginStatus()
})

const handleMessageSuccess = () => {
  // MessageForm 会自动刷新消息列表
}
</script>
