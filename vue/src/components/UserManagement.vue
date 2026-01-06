<template>
  <div class="admin-controls">
    <h3>管理员操作</h3>
    <button @click="openModal" class="btn secondary-btn">管理用户</button>
  </div>

  <div v-if="showModal" class="modal" @click.self="showModal = false">
    <div class="modal-content">
      <span class="close-btn" @click="showModal = false">&times;</span>
      <h2>用户管理</h2>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else>
        <div v-for="user in users" :key="user.id" class="user-item">
          <div>
            <strong>{{ user.username }}</strong> ({{ user.email }})
          </div>
          <div>
            <select
              class="role-select"
              :value="user.role"
              @change="handleRoleChange(user.id, $event)"
            >
              <option value="user">用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const showModal = ref(false)
const loading = ref(false)
const users = ref([])

const openModal = async () => {
  showModal.value = true
  loading.value = true
  users.value = await userStore.fetchUsers()
  loading.value = false
}

const handleRoleChange = async (userId, event) => {
  const newRole = event.target.value
  await userStore.updateUserRole(userId, newRole)
}
</script>

<style scoped>
.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
