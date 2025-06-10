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
        <li><a @click="handleLogout" class="hover:text-[#c68f84] cursor-pointer">登出</a></li>
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
              {{ isWithinDeadline(review.date) ? (review.rating === 0 ? '可評分' : '已評分') : '已過評分期限' }}
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

  <!-- Toast 通知區域 -->
  <div
    v-if="toast.visible"
    :class="`fixed bottom-6 right-6 bg-gray-400 text-white px-4 py-2 rounded-lg shadow transition-opacity duration-500 ${toast.visible ? 'opacity-100' : 'opacity-0'}`"
  >
    {{ toast.message }}
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useLogout } from '../auth.js'
import { onMounted } from 'vue'
import { apiRequest } from '../config/api.js'

const { handleLogout } = useLogout()
const router = useRouter()
const showMenu = ref(false)
const toggleMenu = () => (showMenu.value = !showMenu.value)
const closeMenu = () => (showMenu.value = false)
const editMode = reactive({})
const reviews = ref([])
const toast = reactive({
  message: '',
  visible: false
})

const showToast = (msg, duration = 3000) => {
  toast.message = msg
  toast.visible = true

  setTimeout(() => {
    toast.visible = false
  }, duration)
}

const setRating = (id, value) => {
  const review = reviews.value.find(r => r.id === id)
  if (review && isWithinDeadline(review.date)) {
    review.rating = value
  }
}

const originalData = reactive({})  // 🔥 新增

onMounted(async () => {
  const customerId = localStorage.getItem('userId') || '1'
  const res = await apiRequest(`/reviews/pending/${customerId}`)

  if (res.success) {
    reviews.value = res.data.reviews.map(r => {
      originalData[r.appointmentId] = {
        rating: r.rating,
        comment: r.comment
      }
      const editable = r.rating === 0 && r.comment.trim() === ''
      if (editable) editMode[r.appointmentId] = true

      return {
        id: r.appointmentId,
        studio: r.studio,
        avatar: r.avatar,
        date: r.date,
        rating: r.rating,
        comment: r.comment
      }
    })
  }
})



const submitReview = async (id) => {
  const review = reviews.value.find(r => r.id === id)
  if (!review) return

  if (review.rating === 0) {
    showToast('請給予評分星等才能送出評論')
    return
  }

  const res = await apiRequest(`/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      rating: review.rating,
      review_text: review.comment
    })
  })

  if (res.success) {
    showToast('評分已成功送出！')
    editMode[id] = false
    originalData[id] = {
      rating: review.rating,
      comment: review.comment
    }
  } else {
    showToast('評分送出失敗：' + res.error)
  }

if (res.success) {
  console.log('✅ 評分送出成功')
  editMode[id] = false

  // 同步更新原始資料
  originalData[id] = {
    rating: review.rating,
    comment: review.comment
  }
} else {
  console.error('❌ 送出失敗：', res.error)
  alert('評論送出失敗：' + res.error)
}
}

const cancelEdit = (id) => {
  const original = originalData[id]
  const r = reviews.value.find(r => r.id === id)

  if (!r || !original) return

  // 🔥 核心：如果真的什麼都沒填，就留在空白狀態
  const isEmpty = r.rating === 0 && r.comment.trim() === ''
  const wasEmpty = original.rating === 0 && original.comment.trim() === ''

  if (wasEmpty && isEmpty) {
    // 沒編輯過 → 不還原 → 保持空白
    editMode[id] = false
    return
  }

  // 有填過 → 還原
  r.rating = original.rating
  r.comment = original.comment
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


const formatDate = (datetime) => {
  const d = new Date(datetime)
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
}

const isWithinDeadline = (datetime) => {
  const now = new Date()
  const deadline = new Date(datetime)
  deadline.setDate(deadline.getDate() + 30)
  return now <= deadline
}
</script>

<style scoped>
svg:hover {
  transform: scale(1.1);
  transition: transform 0.2s;
}
</style>