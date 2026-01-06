<template>
  <div class="modal" @click.self="$emit('close')">
    <div class="modal-content">
      <span class="close-btn" @click="$emit('close')">&times;</span>
      <h2>用户注册</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="reg-username">用户名</label>
          <input type="text" id="reg-username" v-model="username" required>
        </div>
        <div class="form-group">
          <label for="reg-email">邮箱</label>
          <input type="email" id="reg-email" v-model="email" required>
        </div>
        <div class="form-group">
          <label for="reg-password">密码</label>
          <input type="password" id="reg-password" v-model="password" required>
        </div>
        <button type="submit" class="btn submit-btn">注册</button>
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
const email = ref('')
const password = ref('')
const error = ref('')

const handleRegister = async () => {
  error.value = ''
  const result = await userStore.register(username.value, email.value, password.value)

  if (result.success) {
    emit('success')
  } else {
    error.value = result.error
  }
}
</script>
