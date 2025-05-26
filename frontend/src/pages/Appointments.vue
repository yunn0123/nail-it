<template>
  <div class="min-h-screen bg-[#efddda] flex flex-col" @click="closeMenu">
    <!-- Navbar -->
    <div class="flex items-center justify-between bg-[#efddda] p-3 mx-4">
      <!-- 左側：Logo 和漢堡選單 -->
      <div class="flex items-center">
          <button @click.stop="toggleMenu" class="text-[#c68f84] text-5xl">&#9776;</button>
          <img 
            src="../assets/logo.png" 
            alt="Logo" 
            class="w-60 h-auto cursor-pointer" 
            @click="router.push('/home')" 
          />
        </div>

      <!-- 假搜尋欄，但其實是 router link -->
      <div 
        @click="router.push('/search')" 
        class="w-2/3 cursor-pointer bg-white rounded-lg py-2 px-4 text-gray-400 shadow-sm border hover:shadow transition"
      >
        搜尋美甲師或作品...
      </div>

      <!-- 右側：點擊回到自己的 profile -->
      <div 
          @click="goToSelfProfile" 
          class="w-10 h-10 bg-[#c68f84] rounded-full cursor-pointer hover:bg-[#c67868] transition-colors"
        ></div>
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

    <!-- 預約紀錄內容 -->
    <div class="p-6">
      <h1 class="text-2xl font-semibold text-[#5f4c47]  mb-4 border-b border-[#c68f84] pb-2">
        預約紀錄
      </h1>

      <!-- 新的預約 -->
      <section class="mb-6">
        <h2 class="text-sm text-gray-500 uppercase mb-2">新的預約</h2>
        <div class="bg-white rounded-xl p-4 flex items-center justify-between shadow">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div>
              <p class="text-gray-800 font-semibold">abc nails💅</p>
              <p class="text-gray-500 text-sm">$ 1000 - 1500</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-500">預約時間</p>
            <p class="text-lg font-bold text-[#5f4c47]">2025-04-17 13:30</p>
          </div>
        </div>
      </section>

      <!-- 歷史預約 -->
      <section>
        <h2 class="text-sm text-gray-500 uppercase mb-2">歷史預約</h2>
        <div
          v-for="(item, index) in pastReservations"
          :key="index"
          class="bg-white rounded-xl p-4 flex items-center justify-between shadow mb-3 opacity-70"
        >
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div>
              <p class="text-gray-800 font-semibold">abc nails💅</p>
              <p class="text-gray-500 text-sm">$ 1000 - 1500</p>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-xs text-gray-500">預約時間</p>
              <p class="text-md font-semibold text-gray-600">{{ item }}</p>
            </div>

            <!-- 替換打勾的部分，新增按鈕 -->
            <button
              @click="goToReview(item)"
              class="bg-[#c68f84] text-white text-sm px-4 py-1 rounded-full hover:bg-[#a96c60] transition"
            >
              查看評分
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToReview = (reservationDate) => {
  // 如果要傳參數過去，也可以改成 router.push({ path: '/reviews', query: { date: reservationDate } })
  router.push('/reviews')
}

const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

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

// 點其他地方要關掉選單
const closeMenu = () => {
  showMenu.value = false
}

const pastReservations = [
  '2025-03-30 13:30',
  '2025-02-19 15:00'
]
</script>

<style scoped>
</style>
