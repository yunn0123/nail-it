<template>
  <div class="flex flex-col h-screen">
    <!-- Navbar -->
    <div class="flex items-center justify-between bg-pink-100 p-4">
      <!-- 左側：漢堡選單 -->
      <button @click="toggleMenu" class="text-pink-500 text-2xl">&#9776;</button>

      <!-- 中間：搜尋框 -->
      <div class="flex-1 mx-4">
        <input v-model="searchKeyword" @keyup.enter="goSearch" placeholder="搜尋美甲師或作品..."
               class="w-full p-2 border rounded-lg" />
      </div>

      <!-- 右側（保留未來可以放頭像） -->
      <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
    </div>

    <!-- 左側選單 -->
    <div v-if="showMenu" class="fixed top-0 left-0 w-60 h-full bg-white shadow-lg p-6 z-50">
      <h2 class="text-xl font-bold mb-6">選單</h2>
      <ul class="space-y-4">
        <li><router-link to="/profile/self" class="hover:text-pink-500">個人檔案</router-link></li>
        <li><router-link to="/chat" class="hover:text-pink-500">聊天紀錄</router-link></li>
        <li><router-link to="/appointments" class="hover:text-pink-500">預約紀錄</router-link></li>
        <li><router-link to="/reviews" class="hover:text-pink-500">評分紀錄</router-link></li>
        <li><router-link to="/settings" class="hover:text-pink-500">隱私設定</router-link></li>
        <li><router-link to="/login" class="hover:text-pink-500">登出</router-link></li>
      </ul>
    </div>

    <!-- 靈感牆 -->
    <div class="flex-1 overflow-y-auto p-6">
      <h2 class="text-2xl font-bold mb-4">靈感牆 ✨</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="work in sortedWorks" :key="work.id" class="bg-white p-4 rounded-xl shadow hover:shadow-lg">
          <img :src="work.image" class="w-full h-48 object-cover rounded-md mb-3" />
          <h3 class="text-xl font-semibold">{{ work.title }}</h3>
          <p class="text-yellow-500 text-sm">⭐ {{ work.rating }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const showMenu = ref(false)
const searchKeyword = ref('')

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const goSearch = () => {
  router.push('/search')
}

// 假資料：靈感牆作品
const works = [
  { id: 1, title: '日系簡約', rating: 4.9, image: 'https://source.unsplash.com/featured/?nail1' },
  { id: 2, title: '秋日溫柔風', rating: 4.7, image: 'https://source.unsplash.com/featured/?nail2' },
  { id: 3, title: '粉嫩法式', rating: 4.8, image: 'https://source.unsplash.com/featured/?nail3' },
]

const sortedWorks = computed(() => {
  return [...works].sort((a, b) => b.rating - a.rating)
})
</script>
