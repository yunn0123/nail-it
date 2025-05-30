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
    <div v-if="uploadedImage && similarWorks.length">
      <h2 class="text-xl font-semibold text-gray-600 mb-4">找到類似的作品</h2>
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

const uploadedImage = ref(null)
const similarWorks = ref([])

const handleUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    uploadedImage.value = URL.createObjectURL(file)
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

  }
}
</script>
