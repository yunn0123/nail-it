<!-- CustomerProfile.vue -->
<template>
  <!-- 載入狀態 -->
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-[#efddda]">
    <div class="text-center">
      <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-[#c68f84] mx-auto"></div>
      <p class="mt-4 text-gray-600">載入中...</p>
    </div>
  </div>

  <!-- 主要內容 -->
  <div v-else class="min-h-screen flex flex-col bg-[#efddda]" @click="closeMenu">
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

    <div class="p-6 mx-5 mr-8">
      <div class="flex flex-col md:flex-row md:items-center mb-8">
        
        <!-- 修正頭像區塊 -->
        <div class="avatar-container w-32 h-32 rounded-full mb-4 md:mb-0 md:mr-6 overflow-hidden relative" style="background-color: #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <img 
            :key="customer.avatar_url"
            :src="customer.avatar_url" 
            alt="" 
            class="w-full h-full object-cover" 
            @error="handleImageError"
            v-show="!showFallback && customer.avatar_url"
            @load="showFallback = false"
          />
          <!-- 默認頭像 -->
          <div v-if="showFallback || !customer.avatar_url" class="absolute inset-0 flex items-center justify-center">
            <svg width="100" height="100" viewBox="0 0 100 100" class="w-30 h-30" fill="none" stroke="#c68f84" stroke-width="4">
              <circle cx="50" cy="35" r="15" />
              <path d="M20,85 C20,60 80,60 80,85" />
            </svg>
          </div>
          
          <!-- 編輯模式下的頭像上傳按鈕 -->
          <div v-if="editMode" class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer" @click="triggerImageUpload">
            <!-- 上傳中顯示載入動畫 -->
            <div v-if="isUploadingAvatar" class="text-white">
              <svg class="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" class="opacity-75"></path>
              </svg>
            </div>
            <!-- 一般狀態顯示相機圖示 -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          
          <!-- 隱藏的檔案輸入 -->
          <input 
            ref="imageInput" 
            type="file" 
            accept="image/*" 
            @change="handleImageUpload" 
            class="hidden" 
          />
        </div>
        
        <div class="flex-1">
          <!-- 顧客名稱 -->
          <div v-if="!editMode">
            <h2 class="text-3xl text-gray-700 font-bold">{{ customer.name || '載入中...' }}</h2>
            <p class="text-gray-400 text-sm mt-2">加入時間：{{ formatJoinDate(customer.created_at) }}</p>
          </div>
          <div v-else class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">顧客名稱</label>
            <input 
              v-model="editData.name" 
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c68f84] focus:border-transparent"
              placeholder="請輸入名稱"
            />
          </div>

          <!-- 編輯按鈕群組 -->
          <div class="mt-4 flex space-x-3">
            <div v-if="!editMode">
              <button @click="startEdit" class="bg-[#c68f84] text-white px-4 py-2 rounded-lg hover:bg-[#c67868]">編輯資料</button>
            </div>
            <div v-if="editMode" class="flex space-x-3">
              <button 
                @click="saveChanges" 
                :disabled="isUpdating"
                class="bg-[#c68f84] text-white px-4 py-2 rounded-lg hover:bg-[#c67868] disabled:bg-gray-400"
              >
                {{ isUpdating ? '儲存中...' : '儲存' }}
              </button>
              <button 
                @click="cancelEdit" 
                :disabled="isUpdating"
                class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:bg-gray-400"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 近期預約 -->
<div class="mb-8">
  <div class="flex items-center justify-between mb-5">
    <div class="flex items-center">
      <h3 class="text-2xl text-gray-700 mr-2">即將到來的預約</h3>
      <img src="../assets/flower.png" alt="Flower" class="w-10 h-auto" /> 
    </div>
  </div>
  
  <!-- 近期預約列表 -->
  <div v-if="upcomingAppointments.length > 0" class="space-y-3">
    <div 
      v-for="appointment in upcomingAppointments" 
      :key="appointment.id" 
      class="bg-white rounded-xl p-4 shadow flex items-center justify-between"
    >
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 rounded-full overflow-hidden relative bg-gray-300 cursor-pointer hover:opacity-80 transition-opacity" @click="goToArtistProfile(appointment)">
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
          <p class="text-gray-500 text-sm">{{ formatAppointmentDate(appointment.date) }} {{ formatAppointmentTime(appointment.time) }}</p>
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
  </div>
  
  <div v-else class="text-center py-8 bg-white rounded-xl shadow">
    <p class="text-gray-500 mb-4">目前沒有近期預約</p>
    <button 
      @click="router.push('/search')" 
      class="bg-[#c68f84] text-white px-6 py-2 rounded-lg hover:bg-[#c67868]"
    >
      尋找美甲師
    </button>
  </div>
</div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiRequest } from '../config/api.js' 
import { useLogout } from '../auth.js'

// 跳轉到美甲師頁面
const goToArtistProfile = (appointment) => {
  router.push(`/profile/${appointment.artistId}`)
}

const { handleLogout } = useLogout()

const route = useRoute()
const router = useRouter()

const showMenu = ref(false)
const editMode = ref(false)
const showFallback = ref(false)
const isLoading = ref(false)
const isUpdating = ref(false)

// 在 CustomerProfile.vue 的 script setup 中加入這些

// 新增變數
const isUploadingAvatar = ref(false)
const imageInput = ref(null)

// 觸發圖片上傳
const triggerImageUpload = () => {
  if (isUploadingAvatar.value) {
    alert('正在上傳中，請稍候...')
    return
  }
  imageInput.value?.click()
}

// 處理頭像上傳
const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 檢查檔案大小（限制 5MB）
  if (file.size > 5 * 1024 * 1024) {
    alert('圖片檔案不能超過 5MB')
    return
  }

  // 檢查檔案類型
  if (!file.type.startsWith('image/')) {
    alert('請選擇圖片檔案')
    return
  }

  try {
    isUploadingAvatar.value = true

    // 轉換為 base64
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64Data = e.target.result

      try {
        // 上傳到後端
        const result = await apiRequest(`/customers/${customer.value.id}/avatar`, {
          method: 'PUT',
          body: JSON.stringify({
            imageData: base64Data
          })
        })

        if (result.success) {
        // 🔥 加入時間戳記避免快取問題
        const newAvatarUrl = `${result.data.avatarUrl}?t=${Date.now()}`
        
        // 更新本地圖片 URL
        customer.value.avatar_url = newAvatarUrl
        if (editData.value) {
          editData.value.avatar_url = newAvatarUrl
        }
        
        showFallback.value = false
        
        // 🔥 強制重新載入圖片
        const imgElements = document.querySelectorAll('.avatar-container img')
        imgElements.forEach(img => {
          img.src = newAvatarUrl
        })
        
        alert('頭像已成功更新！')
        
        console.log('✅ 頭像更新成功，新 URL:', newAvatarUrl)
      } else {
        console.error('頭像上傳失敗:', result.error)
        alert(`頭像上傳失敗：${result.error}`)
      }
      } catch (error) {
        console.error('頭像上傳錯誤:', error)
        alert('頭像上傳時發生錯誤')
      } finally {
        isUploadingAvatar.value = false
      }
    }

    reader.onerror = () => {
      alert('讀取圖片失敗')
      isUploadingAvatar.value = false
    }

    reader.readAsDataURL(file)

  } catch (error) {
    console.error('處理圖片錯誤:', error)
    alert('處理圖片時發生錯誤')
    isUploadingAvatar.value = false
  }
}

// 從路由參數或 localStorage 取得當前用戶 ID
const currentUserId = ref(route.params.id || localStorage.getItem('userId') || '946e489b-4c38-446a-b3ca-75a5d0ec3a30')

// 縣市資料（保持原有的）
const cities = [
  { name: '新北市', districts: ['萬里區', '金山區', '板橋區', '汐止區', '深坑區', '石碇區', '瑞芳區', '平溪區', '雙溪區', '貢寮區', '新店區', '坪林區', '烏來區', '永和區', '中和區', '土城區', '三峽區', '樹林區', '鶯歌區', '三重區', '新莊區', '泰山區', '林口區', '蘆洲區', '五股區', '八里區', '淡水區', '三芝區', '石門區'] },
  { name: '臺北市', districts: ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'] },
  // 可以根據需要添加更多縣市
]
const districts = ref([])

// 真實的顧客資料
const customer = ref({
  id: '',
  name: '',
  email: '',
  avatar_url: '',
  created_at: ''
})

// 編輯資料
const editData = ref({})
const originalData = ref({})

// 預約資料
const upcomingAppointments = ref([])

// 載入顧客資料
const loadCustomerData = async () => {
  isLoading.value = true
  
  try {
    const result = await apiRequest(`/customers/${currentUserId.value}`)
    
    if (result.success) {
      const customerData = result.data.customer
      customer.value = {
        id: customerData.id,
        name: customerData.name,
        email: customerData.email,
        avatar_url: customerData.avatar_url,
        created_at: customerData.created_at
      }
      console.log('顧客資料載入成功:', customer.value)
    } else {
      console.error('載入顧客資料失敗:', result.error)
      alert(`載入資料失敗：${result.error}`)
    }
  } catch (error) {
    console.error('載入顧客資料錯誤:', error)
    alert('載入資料時發生錯誤')
  } finally {
    isLoading.value = false
  }
}

// 載入預約資料
const loadAppointments = async () => {
  try {
    const result = await apiRequest(`/reservations/customer/${currentUserId.value}`)
    
    if (result.data && result.data.success) {
      const allAppointments = result.data.appointments
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // 篩選：未來的預約 + 未完成狀態
      upcomingAppointments.value = allAppointments
        .filter(apt => {
          // 只要待確認和已確認的
          if (!['pending', 'confirmed'].includes(apt.status)) return false
          
          // 只要今天或未來的預約
          const appointmentDate = new Date(apt.date)
          return appointmentDate >= today
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))  // 按日期排序
        .slice(0, 3)  // 最多顯示3筆最近的
        
      console.log('預約資料載入成功:', upcomingAppointments.value)
    } else {
      upcomingAppointments.value = []
    }
  } catch (error) {
    console.error('載入預約資料錯誤:', error)
    upcomingAppointments.value = []
  }
}

// 更新顧客資料
const updateCustomerData = async (updateData) => {
  isUpdating.value = true
  
  try {
    const result = await apiRequest(`/customers/${currentUserId.value}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
    
    if (result.success) {
      console.log('顧客資料更新成功')
      return true
    } else {
      console.error('更新顧客資料失敗:', result.error)
      alert(`更新失敗：${result.error}`)
      return false
    }
  } catch (error) {
    console.error('更新顧客資料錯誤:', error)
    alert('更新資料時發生錯誤')
    return false
  } finally {
    isUpdating.value = false
  }
}

// 方法（保持大部分原有的，但修改相關部分）
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const closeMenu = (event) => {
  if (!event.target.closest('.fixed') && showMenu.value) {
    showMenu.value = false
  }
}

const goToSelfProfile = () => {
  const userType = localStorage.getItem('userType') || 'customer'
  const userId = localStorage.getItem('userId') || currentUserId.value
  
  if (userType === 'customer') {
    router.push(`/profile/customer/${userId}`)
  } else {
    router.push(`/profile/${userId}`)
  }
}

const forceReloadAvatar = () => {
  if (customer.value.avatar_url) {
    // 移除時間戳參數
    const baseUrl = customer.value.avatar_url.split('?')[0]
    // 加入新的時間戳
    customer.value.avatar_url = `${baseUrl}?t=${Date.now()}`
    
    // 重置錯誤狀態
    showFallback.value = false
    
    console.log('🔄 強制重新載入頭像:', customer.value.avatar_url)
  }
}

const handleImageError = (event) => {
  console.error('頭像載入失敗:', event.target.src)
  showFallback.value = true
}

const formatDate = (dateString) => {
  const [year, month, day] = dateString.split('-')
  return `${year}/${month}/${day}`
}

const formatJoinDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// 編輯相關方法
const startEdit = () => {
  editMode.value = true
  originalData.value = JSON.parse(JSON.stringify(customer.value))
  editData.value = JSON.parse(JSON.stringify(customer.value))
}

const updateDistricts = () => {
  const city = cities.find(city => city.name === editData.value.city)
  if (city) {
    districts.value = city.districts
  } else {
    districts.value = []
  }
}

const cancelEdit = () => {
  editMode.value = false
  customer.value = JSON.parse(JSON.stringify(originalData.value))
  editData.value = {}
}

const saveChanges = async () => {
  // 驗證必填欄位
  if (!editData.value.name?.trim()) {
    alert('請輸入名稱')
    return
  }
  
  // 準備更新資料
  const updateData = {
    name: editData.value.name.trim()
  }
  
  // 發送更新請求
  const success = await updateCustomerData(updateData)
  
  if (success) {
    // 更新本地資料
    customer.value = JSON.parse(JSON.stringify(editData.value))
    editMode.value = false
    editData.value = {}
    alert('資料已成功更新！')
  }
}

// 格式化日期和時間（和 Appointments.vue 一樣）
const formatAppointmentDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
}

const formatAppointmentTime = (timeString) => {
  if (!timeString) return ''
  if (timeString.includes(':')) {
    return timeString.substring(0, 5)
  }
  return timeString
}

// 與美甲師聊聊
const chatWithArtist = (appointment) => {
  if (appointment.artistLineUrl) {
    window.open(appointment.artistLineUrl, '_blank')
  } else {
    alert('此美甲師尚未提供 LINE 聯絡方式')
  }
}

// 頁面載入時獲取資料
onMounted(async () => {
  console.log('載入顧客檔案，用戶 ID:', currentUserId.value)
  await loadCustomerData()
  await loadAppointments()
})
</script>
  
<style scoped>
.avatar-container {
  position: relative;
}

.avatar-fallback {
  position: absolute;
  top: 0;
  left: 0;
}
</style>