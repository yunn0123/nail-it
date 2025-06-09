<!-- Home.vue -->
<template>
  <div class="min-h-screen flex flex-col bg-[#efddda]" @click="closeMenu">
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
  
      <!-- 靈感牆 -->
      <div class="flex-1 overflow-y-auto p-7 mx-5 mr-8">
        <div class="flex items-center mb-5">
          <h2 class="text-2xl text-gray-700 mr-2">靈感牆</h2>
          <img src="../assets/flower.png" alt="Flower" class="w-10 h-auto" /> 
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div v-for="work in sortedWorks" :key="work.id" class="bg-white p-4 rounded-xl shadow hover:shadow-lg">
            <img :src="work.image" class="w-full h-48 object-cover rounded-md mb-3" />
            <h3 class="text-xl text-gray-700 ">{{ work.title }}</h3>
            <!--<p class="text-yellow-500 text-sm">⭐ {{ work.rating }}</p>--> <!-- 先註解掉 -->
          </div>
        </div>
      </div>
  
      <!-- designers you may like -->
      <div class="flex-1 overflow-y-auto p-7 mx-5 mr-8">
      <div class="flex items-center mb-5">
        <h2 class="text-2xl text-gray-700 mr-2">你可能會喜歡</h2>
        <img src="../assets/flower.png" alt="Flower" class="w-10 h-auto" /> 
      </div>

      <!-- 🔥 新增 loading 狀態 -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="n" class="bg-white p-4 rounded-xl shadow animate-pulse">
          <div class="w-full h-48 bg-gray-200 rounded-md mb-3"></div>
          <div class="h-4 bg-gray-200 rounded mb-2"></div>
          <div class="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
          <div class="flex gap-2">
            <div class="h-6 bg-gray-200 rounded-full w-12"></div>
            <div class="h-6 bg-gray-200 rounded-full w-16"></div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div 
          v-for="design in sortedDesign" 
          :key="design.id" 
          class="bg-white p-4 rounded-xl shadow hover:shadow-lg cursor-pointer" 
          @click="goToProfile(design.id)"
        >
          <img :src="design.image" class="w-full h-48 object-cover rounded-md mb-3" />
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-[#c68f84]">{{ design.studio }}</h3>
            <p class="text-[#dcb876] text-sm">★ {{ design.rating }}</p>
          </div>
          <p class="text-gray-500 text-sm mb-2">$ {{ design.priceLow }}-{{ design.priceHigh }}</p>
          <div class="mb-2">
            <div class="flex flex-wrap gap-2">
              <span v-for="(tag, index) in design.tags" :key="index" class="bg-[#c68f84] text-white text-xs py-1 px-3 rounded-full">
                {{ cleanTag(tag) }}
              </span>
            </div>
          </div>
        </div>
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

  console.log('測試環境變數:', import.meta.env.VITE_BACKEND_API_URL)
  
  const router = useRouter()
  
  const showMenu = ref(false)
  const searchKeyword = ref('')
  
  // 當前登入的美甲師ID (在實際應用中這會來自認證系統)
  const currentUserId = ref('1') // 假設當前登入用戶是ID為1的美甲師
  
  const toggleMenu = () => {
    showMenu.value = !showMenu.value
  }
  
  // 檢查點擊是否在選單外部，並在外部點擊時關閉選單
  const closeMenu = (event) => {
    // 確保點擊的是選單外部區域，否則不關閉選單
    if (!event.target.closest('.fixed') && showMenu.value) {
      showMenu.value = false
    }
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
  
  // 跳轉到 profile 頁面
  const goToProfile = (designId) => {
    // 使用 designId 作為參數來進入 profile 頁面
    router.push(`/profile/${designId}`)
  }
  
  // 假資料：靈感牆作品
  import work1 from '../assets/temp/work1.jpg'
  import work2 from '../assets/temp/work2.jpg'
  import work3 from '../assets/temp/work3.jpg'
  
  const works = [
    { id: 1, title: '日系簡約', rating: 4.9, image: work1},
    { id: 2, title: '秋日溫柔風', rating: 4.7, image: work3},
    { id: 3, title: '粉嫩法式', rating: 4.8, image: work2 },
  ]
  
  const sortedWorks = computed(() => {
    return [...works].sort((a, b) => b.rating - a.rating)
  })

  const cleanTag = (tag) => {
  if (!tag) return ''
  // 移除英文括號和中文括號內的內容，只保留中文部分
  return tag.replace(/\s*[\(（][^)）]*[\)）]\s*/g, '').trim()
}
  
  // 假資料：你可能會喜歡
  import design1 from '../assets/temp/design1.jpg'
  import design2 from '../assets/temp/design2.jpg'
  import design3 from '../assets/temp/design3.jpg'
  
  const design = ref([]) // ← 改成 ref
  const isLoading = ref(true) // ← 新增

// 載入推薦美甲師資料（只顯示有作品的美甲師）
const loadRecommendedArtists = async () => {
  try {
    isLoading.value = true
    
    // 步驟1：獲取更多美甲師來篩選
    const result = await apiRequest('/artists/recommended?limit=12') // 🔥 增加數量以便篩選
    
    console.log('🔍 完整 API 回應:', result)
    
    const artists = result.data?.data?.artists || result.data?.artists
    
    if (result.success && artists && artists.length > 0) {
      
      // 步驟2：為每個美甲師獲取作品，並過濾出有作品的
      const artistsWithWorks = []
      
      for (const artist of artists) {
        try {
          console.log(`🔍 正在檢查美甲師:`, artist.studio)
          
          // 獲取該美甲師的作品
          const worksResult = await apiRequest(`/works/artist/${artist.user_id}?limit=1`)
          
          // 🔥 檢查是否有作品
          const works = worksResult.data?.works || []
          
          if (worksResult.success && Array.isArray(works) && works.length > 0) {
            const representativeWork = works[0]
            const workTags = representativeWork.tags || []
            const workImage = representativeWork.image || artist.image || design1
            
            artistsWithWorks.push({
              id: artist.user_id,
              studio: artist.studio,
              rating: artist.rating,
              priceLow: artist.priceLow,
              priceHigh: artist.priceHigh,
              city: artist.city,
              district: artist.district,
              image: workImage,
              tags: workTags.slice(0, 6)
            })
            
            console.log(`✅ 美甲師 ${artist.studio} 有作品，已加入列表`)
            
            // 🔥 當我們有足夠的有作品美甲師時就停止
            if (artistsWithWorks.length >= 6) {
              break
            }
          } else {
            console.log(`⚠️ 美甲師 ${artist.studio} 沒有作品，跳過`)
          }
          
        } catch (error) {
          console.warn(`檢查美甲師 ${artist.user_id} 作品失敗:`, error)
        }
      }
      
      design.value = artistsWithWorks
      
      console.log('✅ 最終顯示的有作品美甲師:', design.value.length, '位')
      console.log('詳細資訊:', design.value)
      
      // 🔥 如果有作品的美甲師太少，顯示警告
      if (artistsWithWorks.length < 3) {
        console.warn('⚠️ 有作品的美甲師數量較少，考慮增加美甲師總數或放寬篩選條件')
      }
      
    } else {
      console.warn('⚠️ API 回應格式不正確或無資料:', result)
      loadFallbackData()
    }
  } catch (error) {
    console.error('💥 載入推薦美甲師失敗:', error)
    loadFallbackData()
  } finally {
    isLoading.value = false
  }
}

// 備用假資料
const loadFallbackData = () => {
  design.value = [
    { 
      id: 'e4408908-bc53-4f33-880e-f2c289d37e2f', 
      studio: 'waka.nail', 
      rating: 4.9, 
      priceLow: 1000, priceHigh: 1800,
      tags: ['貓眼', '清新', '日系', '綠色系'], 
      image: design1
    }
    // ... 其他假資料
  ]
}
  
const sortedDesign = computed(() => {
  return [...design.value].sort((a, b) => b.rating - a.rating) // ← 加入 .value
})


onMounted(() => {
  loadRecommendedArtists()
})


  </script>