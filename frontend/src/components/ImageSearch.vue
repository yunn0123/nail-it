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

    <!-- 控制按鈕 -->
    <div v-if="uploadedImage" class="flex gap-4 mt-4">
      <button 
        @click="resetUpload"
        class="px-6 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition"
      >
        重置
      </button>
      <button 
        @click="searchSimilar"
        class="px-6 py-2 rounded-full bg-[#c68f84] text-white hover:bg-[#a96c60] transition"
      >
        搜尋
      </button>
    </div>

    <!-- Loading 狀態 -->
    <div v-if="isLoading" class="flex items-center justify-center mt-6">
      <svg class="animate-spin h-6 w-6 text-[#c68f84]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span class="ml-2 text-[#c68f84]">正在搜尋類似作品...</span>
    </div>

    <!-- 搜尋結果區 -->
    <div v-if="uploadedImage && similarWorks.length">
      <div class="flex items-center mt-6 mb-7">
    <h2 class="text-2xl text-gray-700 mt-4">找到類似的作品</h2>
    <img src="../assets/flower.png" alt="Flower" class="w-10 h-auto" /> 
  </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div 
          v-for="work in similarWorks" 
          :key="work.id" 
          class="bg-white p-4 rounded-xl shadow hover:shadow-lg cursor-pointer" 
          @click="goToProfile(work.id)"
        >
          <img :src="work.image" class="w-full h-48 object-cover rounded-md mb-3" />
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-[#c68f84]">{{ work.studio }}</h3>
            <p class="text-[#dcb876] text-sm">★ {{ work.rating }}</p>
          </div>
          <p class="text-gray-500 text-sm mb-2">$ {{ work.priceLow }}-{{ work.priceHigh }}</p>
          <div class="mb-2">
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="(tag, index) in work.tags" 
                :key="index" 
                class="bg-[#c68f84] text-white text-xs py-1 px-3 rounded-full"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const uploadedFile = ref(null)        // 暫存原始 file
const uploadedImage = ref(null)       // 圖片預覽
const similarWorks = ref([])          // 類似作品結果
const isLoading = ref(false)

const resetUpload = () => {
  uploadedFile.value = null
  uploadedImage.value = null
  similarWorks.value = []
  isLoading.value = false
}

const router = useRouter()

// 跳轉到 profile 頁面
const goToProfile = (designId) => {
  // 使用 designId 作為參數來進入 profile 頁面
  router.push(`/profile/${designId}`)
}


import design1 from '../assets/temp/design1.jpg'
import design2 from '../assets/temp/design2.jpg'
import design3 from '../assets/temp/design3.jpg'

// const sortedDesign = computed(() => {
//   return [...design].sort((a, b) => b.rating - a.rating)
// })


const handleUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    uploadedFile.value = file
    uploadedImage.value = URL.createObjectURL(file)
    similarWorks.value = []         // 清空結果
  }
}

const searchSimilar  = () => {
  
  if (!uploadedFile.value) return

  isLoading.value = true
  
  // 模擬後端分析圖片花2秒
  setTimeout(() => {
    isLoading.value = false  // 結束 loading
  
    // 假資料
    similarWorks.value = [
      { 
        id: '1', 
        studio: '@waka.nail', 
        rating: 4.9, 
        priceLow: 1000 , priceHigh: 1800,
        tags: ['貓眼', '清新', '日系', '綠色系'], 
        image: design1 },
      { 
        id: '2', 
        studio: '@jolieee_nail', 
        rating: 4.7, 
        priceLow: 1000 , priceHigh: 1500, 
        tags: ['貓眼', '清新', '藍色系'],
        image: design2 },
      { 
        id: '3', 
        studio: '@61.nail', 
        rating: 4.6, 
        priceLow: 1200 , priceHigh: 1500, 
        tags: ['貓眼', '清新', '可愛','粉色系'],
        image: design3 },
      { 
        id: '4', 
        studio: '@test.nail', 
        rating: 4.5, 
        priceLow: 900 , priceHigh: 1600, 
        tags: ['簡約', '清新'],
        image: design1 },
    ]
  }, 2000)
}
</script>
