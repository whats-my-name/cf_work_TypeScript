<template>
  <div class="modal" @click.self="$emit('close')">
    <div class="modal-content">
      <span class="close-btn" @click="$emit('close')">&times;</span>
      <h2>用户登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="login-username">用户名</label>
          <input type="text" id="login-username" v-model="username" required>
        </div>
        <div class="form-group">
          <label for="login-password">密码</label>
          <input type="password" id="login-password" v-model="password" required>
        </div>
        <button type="submit" class="btn submit-btn">登录</button>
      </form>
      <div class="error-message" v-if="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/user'

const emit = defineEmits(['close', 'success'])

const userStore = useUserStore()
const username = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  const result = await userStore.login(username.value, password.value)

  if (result.success) {
    emit('success')
  } else {
    error.value = result.error
  }
}
</script>
