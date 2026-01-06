<template>
  <div class="messages-list">
    <h2>留言列表</h2>
    <div v-if="messages.length === 0" class="empty-state">
      <p>暂无留言</p>
    </div>
    <div v-else>
      <MessageCard
        v-for="message in messages"
        :key="message.id"
        :message="message"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useMessageStore } from '../stores/message'
import { useUserStore } from '../stores/user'
import MessageCard from './MessageCard.vue'

const messageStore = useMessageStore()
const userStore = useUserStore()

const messages = computed(() => messageStore.messages)

const handleDelete = async (messageId) => {
  if (confirm('确定要删除这条留言吗？')) {
    await messageStore.deleteMessage(messageId)
  }
}

onMounted(() => {
  messageStore.loadMessages()
})
</script>
