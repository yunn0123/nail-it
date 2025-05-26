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

    <div class="p-6 max-w-4xl w-full mx-auto">
      <h2 class="text-2xl font-semibold text-gray-700 mb-6">評分紀錄</h2>

      <div v-for="review in reviews" :key="review.id" class="bg-white rounded-xl shadow p-4 mb-4">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-4">
            <img :src="review.avatar" class="w-14 h-14 rounded-full object-cover" />
            <div>
              <p class="font-bold text-gray-700">{{ review.studio }}</p>
              <div class="flex items-center mt-1">
                <svg
                  v-for="n in 5"
                  :key="n"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#dcb876"
                  stroke-width="1.5"
                  @click="editMode[review.id] && setRating(review.id, n)"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    :fill="n <= review.rating ? '#dcb876' : 'none'"
                    d="M11.48 3.5a.562.562 0 011.04 0l2.125 5.11a.563.563 0 00.475.34l5.518.44c.5.04.7.66.32.99l-4.2 3.6a.563.563 0 00-.18.56l1.29 5.38a.562.562 0 01-.84.61l-4.72-2.88a.563.563 0 00-.59 0l-4.72 2.88a.562.562 0 01-.84-.61l1.29-5.38a.563.563 0 00-.18-.56l-4.2-3.6a.563.563 0 01.32-.99l5.52-.44a.563.563 0 00.47-.34l2.13-5.11z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">預約時間</p>
            <p class="font-bold text-gray-700">{{ formatDate(review.date) }}</p>
            <p class="text-xs text-gray-400 mt-1">
              {{ isWithinDeadline(review.date) ? (review.rating === 0 ? '可評論' : '已評論') : '已過評論期限' }}
            </p>
          </div>
        </div>

        <!-- 留言與操作按鈕 -->
        <div v-if="isWithinDeadline(review.date)" class="mt-4">
          <div v-if="editMode[review.id]">
            <textarea
              v-model="review.comment"
              class="w-full border rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c68f84]"
              rows="2"
              maxlength="50"
              placeholder="留下最多50字的評論..."
            ></textarea>
            <p class="text-right text-xs text-gray-400 mt-1">{{ review.comment.length }}/50</p>
            <div class="flex justify-end gap-2 mt-2">
              <button
                @click="submitReview(review.id)"
                class="px-4 py-1 bg-[#c68f84] text-white text-sm rounded-full hover:bg-[#a96c60]"
              >提交</button>
              <button
                @click="cancelEdit(review.id)"
                class="px-4 py-1 bg-gray-200 text-sm rounded-full hover:bg-gray-300"
              >取消</button>
            </div>
          </div>
          <div v-else class="text-sm text-gray-700 mt-2">
            {{ review.comment || '尚未留下評論' }}
            <button
              v-if="isWithinDeadline(review.date)"
              @click="editMode[review.id] = true"
              class="ml-4 text-xs text-[#c68f84] underline hover:opacity-80"
            >編輯</button>
          </div>
        </div>

        <!-- 評論已過期但仍顯示內容 -->
        <div v-else class="text-sm text-gray-700 mt-2">
          {{ review.comment || '（無評論內容）' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const showMenu = ref(false)
const toggleMenu = () => (showMenu.value = !showMenu.value)
const closeMenu = () => (showMenu.value = false)

const reviews = ref([
  { id: 1, studio: 'abc nails💅', avatar: 'https://placehold.co/80x80', date: '2025-05-21 13:30', rating: 5, comment: '1232424' },
  { id: 2, studio: 'abc nails💅', avatar: 'https://placehold.co/80x80', date: '2025-02-19 15:00', rating: 5, comment: '完美體驗！' },
  { id: 3, studio: 'abc nails💅', avatar: 'https://placehold.co/80x80', date: '2025-01-10 13:30', rating: 4, comment: '不錯但等太久' }
])

const editMode = reactive({})

const setRating = (id, value) => {
  const review = reviews.value.find(r => r.id === id)
  if (review && isWithinDeadline(review.date)) {
    review.rating = value
  }
}

// const submitReview = (id) => {
//   editMode[id] = false
//   // 模擬送出 API
//   console.log('已送出', reviews.value.find(r => r.id === id))
// }

const submitReview = (id) => {
  const review = reviews.value.find(r => r.id === id)
  if (review) {
    review.comment = review.tempComment
    review.rating = review.tempRating
  }
  editMode[id] = false
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

const cancelEdit = (id) => {
  editMode[id] = false
}

const formatDate = (datetime) => {
  const d = new Date(datetime)
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
}

const isWithinDeadline = (datetime) => {
  const now = new Date()
  const deadline = new Date(datetime)
  deadline.setDate(deadline.getDate() + 7)
  return now <= deadline
}
</script>

<style scoped>
svg:hover {
  transform: scale(1.1);
  transition: transform 0.2s;
}
</style>