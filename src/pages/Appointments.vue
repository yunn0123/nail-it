<template>
  <div class="min-h-screen flex flex-col bg-[#efddda]">
    <!-- Navbar -->
    <div class="flex items-center justify-between bg-[#efddda] p-3 mx-4">
      <!-- 左側：Logo 和漢堡選單 -->
      <div class="flex items-center">
        <button @click.stop="toggleMenu" class="text-[#c68f84] text-5xl">&#9776;</button>
        <img src="../assets/logo.png" alt="Logo" class="w-60 h-auto" />
      </div>

      <!-- 假搜尋欄，但其實是 router link -->
      <div 
        @click="router.push('/search')" 
        class="w-2/3 cursor-pointer bg-white rounded-lg py-2 px-4 text-gray-400 shadow-sm border hover:shadow transition"
      >
        搜尋美甲師或作品...
      </div>

      <!-- 右側（保留未來可以放頭像） -->
      <div class="w-10 h-10 bg-[#c68f84] rounded-full"></div>
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
      <h1 class="text-2xl font-semibold text-gray-800 mb-4 border-b border-[#c68f84] pb-2">
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
          <div class="text-right">
            <p class="text-xs text-gray-500">預約時間</p>
            <p class="text-md font-semibold text-gray-600">{{ item }}</p>
          </div>
          <svg
            class="w-6 h-6 text-gray-400 ml-2"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
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
