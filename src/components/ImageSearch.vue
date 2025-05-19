<template>
  <div class="flex flex-col items-center bg-white p-6 rounded-xl shadow hover:shadow-lg">
    <!-- 上傳區塊 -->
    <div 
      class="w-64 h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#c68f84] rounded-xl cursor-pointer hover:bg-[#f3e4e1] transition mb-6"
      @click="$refs.fileInput.click()"
    >
      <input type="file" @change="handleUpload" class="hidden" ref="fileInput" />
      <div v-if="!uploadedImage" class="text-center text-[#c68f84]">
        點擊上傳照片
      </div>
      <div v-else>
        <img :src="uploadedImage" alt="Uploaded" class="w-full h-full object-cover rounded-xl" />
      </div>
    </div>

    <!-- 搜尋結果區 -->
    <div v-if="uploadedImage">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">找到類似的作品</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div 
          v-for="(work, index) in similarWorks" 
          :key="index" 
          class="bg-white p-3 rounded-xl shadow hover:shadow-lg"
        >
          <img :src="work" class="w-full h-40 object-cover rounded-md" />
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
