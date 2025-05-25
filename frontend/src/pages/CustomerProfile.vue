<!-- CustomerProfile.vue -->
<template>
    <div class="min-h-screen flex flex-col bg-[#efddda]" @click="closeMenu">
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
          <li><router-link to="/login" class="hover:text-[#c68f84]">登出</router-link></li>
        </ul>
      </div>
  
      <div class="p-6 mx-5 mr-8">
        <div class="flex flex-col md:flex-row md:items-center mb-8">
          
          <!-- 頭像 -->
          <div class="avatar-container w-32 h-32 rounded-full mb-4 md:mb-0 md:mr-6 overflow-hidden relative" style="background-color: #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <img 
              :src="customer.image" 
              alt="" 
              class="w-full h-full object-cover" 
              @error="handleImageError"
              v-show="!showFallback"
            />
            <!-- 默認頭像 -->
            <div v-if="showFallback" class="absolute inset-0 flex items-center justify-center">
              <svg width="100" height="100" viewBox="0 0 100 100" class="w-30 h-30" fill="none" stroke="#c68f84" stroke-width="4">
                <circle cx="50" cy="35" r="15" />
                <path d="M20,85 C20,60 80,60 80,85" />
              </svg>
            </div>
            <!-- 編輯模式下的頭像上傳按鈕 -->
            <div v-if="editMode" class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer" @click="triggerImageUpload">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input ref="imageInput" type="file" accept="image/*" @change="handleImageUpload" class="hidden" />
          </div>
          
          <div class="flex-1">
            <!-- 顧客名稱 -->
            <div v-if="!editMode">
              <h2 class="text-3xl text-gray-700 font-bold">{{ customer.name }}</h2>
            </div>
            <div v-else class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">顧客名稱</label>
              <input 
                v-model="editData.name" 
                class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c68f84] focus:border-transparent"
                placeholder="請輸入名稱"
              />
            </div>
  
            <!-- 地址 -->
            <div v-if="!editMode">
              <p class="text-gray-700 mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c68f84] mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>      
                {{ customer.city }} {{ customer.district }}
              </p>
            </div>
            <div v-else class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">地址</label>
              <!-- 縣市選擇 -->
              <div class="mb-2">
                <select v-model="editData.city" @change="updateDistricts" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c68f84] focus:border-transparent">
                  <option value="">請選擇縣市</option>
                  <option v-for="(city, index) in cities" :key="index" :value="city.name">{{ city.name }}</option>
                </select>
              </div>
              <!-- 區域選擇 -->
              <div v-if="editData.city">
                <select v-model="editData.district" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c68f84] focus:border-transparent">
                  <option value="">請選擇區域</option>
                  <option v-for="(district, index) in districts" :key="index" :value="district">{{ district }}</option>
                </select>
              </div>
            </div>
  
            <!-- 編輯按鈕群組 -->
            <div class="mt-4 flex space-x-3">
              <div v-if="!editMode">
                <button @click="startEdit" class="bg-[#c68f84] text-white px-4 py-2 rounded-lg hover:bg-[#c67868]">編輯資料</button>
              </div>
              <div v-if="editMode" class="flex space-x-3">
                <button @click="saveChanges" class="bg-[#c68f84] text-white px-4 py-2 rounded-lg hover:bg-[#c67868]">儲存</button>
                <button @click="cancelEdit" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">取消</button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 近期預約 -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center">
              <h3 class="text-2xl text-gray-700 mr-2">近期預約</h3>
              <img src="../assets/flower.png" alt="Flower" class="w-10 h-auto" /> 
            </div>
          </div>
          
          <!-- 近期預約列表 -->
          <div class="space-y-4">
            <div v-for="(appointment, index) in upcomingAppointments" :key="index" class="bg-white rounded-xl p-4 shadow flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                  <img :src="appointment.artistImage" alt="Artist" class="w-full h-full object-cover" @error="$event.target.style.display='none'" />
                </div>
                <div>
                  <p class="text-gray-700 font-medium">{{ appointment.artistName }}</p>
                  <p class="text-gray-500 text-sm">$ {{ appointment.price }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">預約時間</p>
                <p class="text-lg font-bold text-[#5f4c47]">{{ formatDate(appointment.date) }} {{ appointment.time }}</p>
              </div>
            </div>
            
            <div v-if="upcomingAppointments.length === 0" class="text-center py-8 bg-white rounded-xl shadow">
              <p class="text-gray-500">目前沒有近期預約</p>
              <button 
                @click="router.push('/search')" 
                class="mt-4 px-6 py-2 bg-[#c68f84] text-white rounded-lg hover:bg-[#c67868]"
              >
                探索美甲師
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import work1 from '../assets/temp/work1.jpg'
  import work2 from '../assets/temp/work2.jpg'
  
  const route = useRoute()
  const router = useRouter()
  
  const showMenu = ref(false)
  const editMode = ref(false)
  const showFallback = ref(false)
  
  // 當前登入的顧客ID (在實際應用中這會來自認證系統)
  const currentUserId = ref('customer1')
  
  // 縣市資料
  const cities = [
    { name: '新北市', districts: ['萬里區', '金山區', '板橋區', '汐止區', '深坑區', '石碇區', '瑞芳區', '平溪區', '雙溪區', '貢寮區', '新店區', '坪林區', '烏來區', '永和區', '中和區', '土城區', '三峽區', '樹林區', '鶯歌區', '三重區', '新莊區', '泰山區', '林口區', '蘆洲區', '五股區', '八里區', '淡水區', '三芝區', '石門區'] },
    { name: '臺北市', districts: ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'] },
    // 其他縣市... (已省略)
  ]
  const districts = ref([])
  
  // 模擬顧客資料
  const customer = ref({
    id: 'customer1',
    name: 'Lily Chen',
    city: '臺北市',
    district: '大安區',
    image: work1
  })
  
  // 編輯資料
  const editData = ref({})
  const originalData = ref({})
  
  // 模擬近期預約資料
  const upcomingAppointments = ref([
    {
      id: 'apt1',
      artistId: '1',
      artistName: 'waka.nail',
      artistImage: work1,
      date: '2025-05-25',
      time: '14:00-16:00',
      price: '1200'
    },
    {
      id: 'apt2',
      artistId: '2',
      artistName: 'jolieee_nail',
      artistImage: work2,
      date: '2025-06-05',
      time: '10:00-12:00',
      price: '1000'
    }
  ])
  
  // 方法
  const toggleMenu = () => {
    showMenu.value = !showMenu.value
  }
  
  const closeMenu = (event) => {
    if (!event.target.closest('.fixed') && showMenu.value) {
      showMenu.value = false
    }
  }
  
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
  
  const handleImageError = () => {
    showFallback.value = true
  }
  
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-')
    return `${year}/${month}/${day}`
  }
  
  // 編輯相關方法
  const startEdit = () => {
    editMode.value = true
    originalData.value = JSON.parse(JSON.stringify(customer.value))
    editData.value = JSON.parse(JSON.stringify(customer.value))
    updateDistricts()
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
  
  const saveChanges = () => {
    // 驗證必填欄位
    if (!editData.value.name?.trim()) {
      alert('請輸入名稱')
      return
    }
    
    // 更新資料
    customer.value = JSON.parse(JSON.stringify(editData.value))
    
    // 在實際應用中，這裡會發送API請求到後端
    console.log('儲存資料:', customer.value)
    
    editMode.value = false
    editData.value = {}
    
    alert('資料已成功更新！')
  }
  
  // 頭像上傳
  const imageInput = ref(null)
  
  const triggerImageUpload = () => {
    imageInput.value?.click()
  }
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        editData.value.image = e.target.result
        showFallback.value = false
      }
      reader.readAsDataURL(file)
    }
  }
  
  onMounted(() => {
    // 從API獲取顧客資料
    console.log('載入顧客檔案')
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