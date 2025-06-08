<!-- Appointments.vue -->
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
        <li><a @click="goToSelfProfile" class="hover:text-[#c68f84] cursor-pointer">個人檔案</a></li>
        <li><router-link to="/chat" class="hover:text-[#c68f84]">聊聊</router-link></li>
        <li><router-link to="/appointments" class="hover:text-[#c68f84]">預約紀錄</router-link></li>
        <li><router-link to="/reviews" class="hover:text-[#c68f84]">評分紀錄</router-link></li>
        <li><router-link to="/settings" class="hover:text-[#c68f84]">隱私設定</router-link></li>
        <li><a @click="handleLogout" class="hover:text-[#c68f84] cursor-pointer">登出</a></li>
      </ul>
    </div>
 
    <!-- 預約紀錄內容 -->
    <div class="p-6">
      <h1 class="text-2xl font-semibold text-gray-700 mb-4 border-b border-[#c68f84] pb-2">
        預約紀錄
      </h1>
 
      <!-- 新的預約（待確認 + 已確認） -->
      <section v-if="upcomingAppointments.length > 0" class="mb-6">
        <h2 class="text-sm text-gray-500 uppercase mb-2">新的預約</h2>
        <div
          v-for="appointment in upcomingAppointments"
          :key="appointment.id"
          class="bg-white rounded-xl p-4 flex items-center justify-between shadow mb-3"
        >
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-full overflow-hidden relative bg-gray-300">
                <img 
                  v-if="appointment.artistImage"
                  :src="appointment.artistImage" 
                  alt="" 
                  class="w-full h-full object-cover" 
                  @error="$event.target.style.display = 'none'"
                />
              </div>
            <div>
              <p class="text-gray-700 font-semibold">{{ appointment.artistName }}</p>
              <p class="text-gray-500 text-sm">{{ formatDate(appointment.date) }} {{ formatTime(appointment.time) }}</p>
              <!-- 狀態顯示 -->
              <p v-if="appointment.status === 'pending'" class="text-[#c68f84] text-xs mt-1">
                請待美甲師確認，如需取消請聯絡美甲師
              </p>
              <p v-else-if="appointment.status === 'confirmed'" class="text-[#c68f84] text-xs mt-1">
                美甲師已確認，如需取消請聯絡美甲師
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <!-- 聊聊按鈕 -->
            <button 
              @click="chatWithArtist(appointment)"
              class="bg-white border border-[#c68f84] text-[#c68f84] px-3 py-1 rounded-lg hover:bg-[#f9e7e4] text-sm"
            >
              聊聊
            </button>
            
          </div>
        </div>
      </section>
 
      <!-- 已完成預約 -->
      <section v-if="completedAppointments.length > 0" class="mb-6">
        <h2 class="text-sm text-gray-500 uppercase mb-2">已完成預約</h2>
        <div
          v-for="appointment in completedAppointments"
          :key="appointment.id"
          class="bg-white rounded-xl p-4 flex items-center justify-between shadow mb-3 opacity-80"
        >
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-full overflow-hidden relative bg-gray-300">
                <img 
                  v-if="appointment.artistImage"
                  :src="appointment.artistImage" 
                  alt="" 
                  class="w-full h-full object-cover" 
                  @error="$event.target.style.display = 'none'"
                />
              </div>
            <div>
              <p class="text-gray-800 font-semibold">{{ appointment.artistName }}</p>
              <p class="text-gray-500 text-sm">{{ formatDate(appointment.date) }} {{ formatTime(appointment.time) }}</p>
              <p class="text-gray-600 text-xs mt-1">已完成</p>
            </div>
          </div>
 
          <div class="flex items-center space-x-4">
            <!-- 查看評分按鈕 -->
            <button
              @click="goToReview(appointment)"
              class="bg-[#c68f84] text-white text-sm px-4 py-1 rounded-full hover:bg-[#a96c60] transition"
            >
              查看評分
            </button>
          </div>
        </div>
      </section>
 
      <!-- 已取消預約 -->
      <section v-if="cancelledAppointments.length > 0" class="mb-6">
        <h2 class="text-sm text-gray-500 uppercase mb-2">已取消預約</h2>
        <div
          v-for="appointment in cancelledAppointments"
          :key="appointment.id"
          class="bg-white rounded-xl p-4 flex items-center justify-between shadow mb-3 opacity-60"
        >
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-full overflow-hidden relative bg-gray-300">
              <img 
                v-if="appointment.artistImage"
                :src="appointment.artistImage" 
                alt="" 
                class="w-full h-full object-cover" 
                @error="$event.target.style.display = 'none'"
              />
            </div>
            <div>
              <p class="text-gray-800 font-semibold">{{ appointment.artistName }}</p>
              <p class="text-gray-500 text-sm">{{ formatDate(appointment.date) }} {{ formatTime(appointment.time) }}</p>
              <p class="text-red-500 text-xs mt-1">❌ 已取消</p>
            </div>
          </div>
        </div>
      </section>
 
      <!-- 無預約時顯示 -->
      <div v-if="allAppointments.length === 0" class="text-center py-8">
        <p class="text-gray-500 mb-4">目前沒有預約紀錄</p>
        <button 
          @click="router.push('/search')"
          class="bg-[#c68f84] text-white px-6 py-2 rounded-lg hover:bg-[#c67868]"
        >
          尋找美甲師
        </button>
      </div>
    </div>
  </div>
 </template>
 
 <script setup>
 import { ref, computed, onMounted } from 'vue'
 import { useRouter } from 'vue-router'
 import { apiRequest } from '../config/api.js'
 import { useLogout } from '../auth.js'
 
 const { handleLogout } = useLogout()
 const router = useRouter()
 
 const showMenu = ref(false)
 const allAppointments = ref([])
 
 // 計算屬性分類預約
 const upcomingAppointments = computed(() => 
  allAppointments.value.filter(apt => ['pending', 'confirmed'].includes(apt.status))
 )
 
 const completedAppointments = computed(() =>
  allAppointments.value.filter(apt => apt.status === 'completed')
 )
 
 const cancelledAppointments = computed(() =>
  allAppointments.value.filter(apt => apt.status === 'cancelled')
 )
 
 // 格式化日期和時間
 const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
 }
 
 const formatTime = (timeString) => {
  if (!timeString) return ''
  if (timeString.includes(':')) {
    return timeString.substring(0, 5)
  }
  return timeString
 }
 
 const loadCustomerAppointments = async () => {
  try {
    const customerId = localStorage.getItem('userId')
    console.log('🚀 準備載入預約，customerId:', customerId)
    
    const result = await apiRequest(`/reservations/customer/${customerId}`)
    
    console.log('🎯 前端收到的完整回應:', result)
    console.log('🎯 result.data:', result.data)
    console.log('🎯 result.data.appointments:', result.data.appointments)
    
    if (result.data && result.data.success) {
      allAppointments.value = result.data.appointments
      console.log('✅ 設定到 allAppointments:', allAppointments.value)
      console.log('🖼️ 第一個預約的 artistImage:', allAppointments.value[0]?.artistImage) // ← 加這行
    } else {
      console.error('❌ 載入預約資料失敗:', result.error)
    }
  } catch (error) {
    console.error('💥 載入預約資料錯誤:', error)
  }
}
 
 // 與美甲師聊聊
 const chatWithArtist = (appointment) => {
  router.push({
    path: '/chat',
    query: { 
      artistId: appointment.artistId,
      artistName: appointment.artistName
    }
  })
 }
 
 // 查看評分
 const goToReview = (appointment) => {
  router.push({
    path: '/reviews',
    query: { 
      appointmentId: appointment.id 
    }
  })
 }
 
 const toggleMenu = () => {
  showMenu.value = !showMenu.value
 }
 
 const goToSelfProfile = () => {
  const userType = localStorage.getItem('userType') || 'artist'
  const userId = localStorage.getItem('userId') || '1'
  
  if (userType === 'customer') {
    router.push(`/profile/customer/${userId}`)
  } else {
    router.push(`/profile/${userId}`)
  }
 }
 
 const closeMenu = () => {
  showMenu.value = false
 }
 
 onMounted(() => {
  loadCustomerAppointments()
 })
 </script>
 
 <style scoped>
 </style>