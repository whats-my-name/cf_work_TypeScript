<template>
  <div :class="['message-notification', type]">
    {{ message }}
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'success'
  }
})
</script>
