<template>
  <div class="min-h-screen bg-[#efddda] flex flex-col" @click="closeMenu">
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

    <div class="p-6 max-w-4xl w-full mx-auto">
      <h2 class="text-2xl font-semibold text-[#5f4c47] mb-6">你的評分紀錄</h2>

      <div v-for="review in reviews" :key="review.id" class="bg-white rounded-xl shadow p-4 mb-4 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <img :src="review.avatar" class="w-14 h-14 rounded-full object-cover" />
          <div>
            <p class="font-bold text-[#5f4c47]">{{ review.studio }}</p>
            <div class="flex items-center mt-1">
              <svg
                v-for="n in 5"
                :key="n"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 cursor-pointer"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
                @click="setRating(review.id, n)"
                >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :fill="n <= review.rating ? '#fbbf24' : 'none'"
                    d="M11.48 3.5a.562.562 0 011.04 0l2.125 5.11a.563.563 0 00.475.34l5.518.44c.5.04.7.66.32.99l-4.2 3.6a.563.563 0 00-.18.56l1.29 5.38a.562.562 0 01-.84.61l-4.72-2.88a.563.563 0 00-.59 0l-4.72 2.88a.562.562 0 01-.84-.61l1.29-5.38a.563.563 0 00-.18-.56l-4.2-3.6a.563.563 0 01.32-.99l5.52-.44a.563.563 0 00.47-.34l2.13-5.11z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-500">預約時間</p>
          <p class="font-bold text-[#5f4c47]">{{ formatDate(review.date) }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ review.rating === 0 ? '尚未評論' : '已評論' }}</p>
        </div>
      </div>
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

const reviews = ref([
  { id: 1, studio: 'abc nails💅', avatar: 'https://placehold.co/80x80', date: '2025-03-30 13:30', rating: 0 },
  { id: 2, studio: 'abc nails💅', avatar: 'https://placehold.co/80x80', date: '2025-02-19 15:00', rating: 5 },
  { id: 3, studio: 'abc nails💅', avatar: 'https://placehold.co/80x80', date: '2025-01-10 13:30', rating: 4 }
])

const setRating = (id, value) => {
  const review = reviews.value.find(r => r.id === id)
  if (review) {
    review.rating = value
  }
}

const formatDate = (datetime) => {
  const d = new Date(datetime)
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
}

</script>

<style scoped>
svg:hover {
  transform: scale(1.1);
  transition: transform 0.2s;
}
</style>