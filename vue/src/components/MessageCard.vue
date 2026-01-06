<template>
  <div class="message-card">
    <div class="message-header">
      <span><strong>{{ message.username }}</strong></span>
      <span>{{ formatDate(message.created_at) }}</span>
    </div>
    <div class="message-content">{{ message.content }}</div>
    <div v-if="message.image_url" class="message-image">
      <img :src="message.image_url" alt="留言图片" loading="lazy">
    </div>
    <div
      v-if="canDelete"
      class="message-actions"
    >
      <button class="btn secondary-btn" @click="$emit('delete', message.id)">
        <i class="fas fa-trash"></i> 删除
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/user'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

defineEmits(['delete'])

const userStore = useUserStore()

const canDelete = computed(() => {
  return userStore.user && (
    userStore.user.role === 'admin' ||
    userStore.user.id === props.message.user_id
  )
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}
</script>
