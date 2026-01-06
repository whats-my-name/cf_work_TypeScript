<template>
  <div class="message-form-container">
    <h2>发表留言</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <textarea
          id="message-content"
          v-model="content"
          rows="4"
          placeholder="请输入留言内容..."
          required
        ></textarea>
      </div>
      <div class="form-group">
        <div class="image-upload-container">
          <input type="file" id="message-image" accept="image/*" style="display: none;" @change="handleImageChange">
          <button type="button" @click="triggerImageUpload" class="btn secondary-btn">
            <i class="fas fa-image"></i> 添加图片
          </button>
          <span v-if="selectedImageName" style="margin-left: 10px; color: #666;">{{ selectedImageName }}</span>
        </div>
        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="预览">
        </div>
      </div>
      <button type="submit" class="btn submit-btn" :disabled="loading">
        {{ loading ? '提交中...' : '提交留言' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMessageStore } from '../stores/message'

const emit = defineEmits(['success'])

const messageStore = useMessageStore()
const content = ref('')
const imagePreview = ref('')
const selectedImageData = ref(null)
const selectedImageName = ref('')
const loading = ref(false)

const triggerImageUpload = () => {
  document.getElementById('message-image').click()
}

const handleImageChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      imagePreview.value = event.target.result
      selectedImageData.value = event.target.result
      selectedImageName.value = file.name
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = async () => {
  loading.value = true
  const result = await messageStore.createMessage(content.value, selectedImageData.value)
  loading.value = false

  if (result.success) {
    content.value = ''
    imagePreview.value = ''
    selectedImageData.value = null
    selectedImageName.value = ''
    emit('success')
  }
}
</script>
