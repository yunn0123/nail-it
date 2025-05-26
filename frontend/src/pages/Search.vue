<template>
  <div class="min-h-screen flex flex-col bg-[#efddda]" @click="closeMenu">
    <!-- Navbar -->
    <div class="relative bg-[#efddda] p-3 shadow-md w-full">
      <!-- 左右貼邊的容器 -->
      <div class="flex items-center justify-between px-4">
        <!-- 左：漢堡 -->
        <button @click.stop="toggleMenu" class="text-[#c68f84] text-4xl">&#9776;</button>

        <!-- 右：頭像 點擊回到自己的 profile-->
        <div 
          @click="goToSelfProfile" 
          class="w-10 h-10 bg-[#c68f84] rounded-full cursor-pointer hover:bg-[#c67868] transition-colors">
        </div>
      </div>

      <!-- 中間：Logo（置中） -->
      <div class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <img src="../assets/logo.png" alt="Logo" class="w-52 h-auto" />
      </div>
    </div>

    

    <!-- 左側選單 -->
    <div v-if="showMenu" class="fixed top-7 left-0 w-48 h-auto bg-white shadow-lg p-6 z-50" @click.stop>
      <ul class="space-y-4">
        <li><router-link to="/profile/self" class="hover:text-[#c68f84]">個人檔案</router-link></li>
        <li><router-link to="/chat" class="hover:text-[#c68f84]">聊聊</router-link></li>
        <li><router-link to="/appointments" class="hover:text-[#c68f84]">預約紀錄</router-link></li>
        <li><router-link to="/reviews" class="hover:text-[#c68f84]">評分紀錄</router-link></li>
        <li><router-link to="/settings" class="hover:text-[#c68f84]">隱私設定</router-link></li>
        <li><router-link to="/login" class="hover:text-[#c68f84]">登出</router-link></li>
      </ul>
    </div>

    <!-- Tabs 區塊 -->
    <div class="flex justify-center mb-6">
      <div class="flex space-x-6 border-b border-[#c68f84]">
        <button @click="activeTab = 'name'" :class="tabClass('name')">以名稱搜尋</button>
        <button @click="activeTab = 'image'" :class="tabClass('image')">以圖搜尋</button>
        <button @click="activeTab = 'filter'" :class="tabClass('filter')">以條件搜尋</button>
      </div>
    </div>

    <!-- 卡片包裹內容 -->
    <div class="bg-white rounded-2xl shadow p-6">
      <!-- 名稱搜尋區塊 -->
      <div v-if="activeTab === 'name'">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <div class="flex flex-1 items-center space-x-4">
            <input 
              v-model="searchName" 
              @keyup.enter="searchByName" 
              placeholder="搜尋美甲師名稱..."
              class="flex-1 border p-2 rounded-lg border-[#c68f84] focus:ring-2 focus:ring-[#c68f84]" 
            />
            <button 
              @click="searchByName" 
              class="bg-[#c68f84] text-white px-4 py-2 rounded-lg hover:bg-[#a96c60]"
            >
              搜尋
            </button>
          </div>
        </div>

        <!-- 搜尋結果 -->
        <div v-if="searchResult.length > 0">
          <h2 class="text-2xl text-[#5f4c47] mb-4">搜尋結果</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div 
              v-for="artist in searchResult" 
              :key="artist.id" 
              class="bg-white p-4 rounded-xl shadow hover:shadow-lg"
            >
              <img :src="artist.image" class="w-full h-48 object-cover rounded-md mb-3" />
              <h3 class="text-xl text-[#5f4c47]">{{ artist.name }}</h3>
              <router-link :to="`/profile/${artist.id}`" class="text-[#c68f84] hover:underline">
                查看個人頁面
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 以圖搜尋 -->
      <ImageSearch v-if="activeTab === 'image'" />

      <!-- 以條件搜尋 -->
      <FilterSearch v-if="activeTab === 'filter'" />
    </div>
  </div>
</template>



<script setup>
import { ref } from 'vue'
import ImageSearch from '../components/ImageSearch.vue'
import FilterSearch from '../components/FilterSearch.vue'

// 前往自己的個人檔案
const goToSelfProfile = () => {
// 判斷用戶類型
  const userType = localStorage.getItem('userType') || 'artist'
  const userId = localStorage.getItem('userId') || '1'

  if (userType === 'customer') {
    router.push(`/profile/customer/${userId}`)
  } else {
    router.push(`/profile/${userId}`)
}
}

const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

// 點其他地方要關掉選單
const closeMenu = () => {
  showMenu.value = false
}

const activeTab = ref('image')
const searchName = ref('')
const searchResult = ref([])

const allArtists = [
  { id: 1, name: '小美', image: 'https://source.unsplash.com/featured/?nail' },
  { id: 2, name: 'Grace Nails', image: 'https://source.unsplash.com/featured/?nailsalon' },
  { id: 3, name: 'Momo Studio', image: 'https://source.unsplash.com/featured/?manicure' }
]

const tabClass = (tab) => {
  return [
    'px-4 py-2 border-b-2 transition-colors duration-200',
    activeTab.value === tab
      ? 'border-[#c68f84] text-[#c68f84]'
      : 'border-transparent text-gray-500 hover:text-[#c68f84]'
  ]
}


const searchByName = () => {
  if (searchName.value.trim() !== '') {
    searchResult.value = allArtists.filter(artist =>
      artist.name.includes(searchName.value.trim())
    )
  } else {
    searchResult.value = []
  }
}
</script>
