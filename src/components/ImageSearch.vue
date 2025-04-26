<template>
  <div class="flex flex-col items-center">
    <div class="border-2 border-dashed border-pink-300 w-64 h-64 flex items-center justify-center mb-4">
      <input type="file" @change="handleUpload" class="hidden" ref="fileInput" />
      <button @click="$refs.fileInput.click()" class="text-pink-500 hover:underline">點擊上傳照片</button>
    </div>

    <div v-if="uploadedImage">
      <h2 class="text-xl font-bold mb-4">找到類似的作品</h2>
      <div class="grid grid-cols-2 gap-4">
        <div v-for="(work, index) in similarWorks" :key="index" class="bg-white p-2 rounded-lg shadow">
          <img :src="work" class="w-full h-40 object-cover rounded" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const uploadedImage = ref(null)
const similarWorks = ref([])

const handleUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    uploadedImage.value = URL.createObjectURL(file)
    // 假資料
    similarWorks.value = [
      'https://source.unsplash.com/featured/?nail1',
      'https://source.unsplash.com/featured/?nail2',
      'https://source.unsplash.com/featured/?nail3'
    ]
  }
}
</script>
