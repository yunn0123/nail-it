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
    <div class="p-6 mx-5 mr-8">
      <div class="flex flex-col md:flex-row md:items-center mb-8">
        
        <!-- 頭像 -->
        <div class="avatar-container w-32 h-32 rounded-full mb-4 md:mb-0 md:mr-6 overflow-hidden relative" style="background-color: #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <img 
            :src="artist.image" 
            alt="" 
            class="w-full h-full object-cover" 
            @error="handleImageError"
            v-show="!showFallback"
          >
          <!-- 默認頭像 -->
          <div v-if="showFallback" class="absolute inset-0 flex items-center justify-center">
            <svg width="100" height="100" viewBox="0 0 100 100" class="w-30 h-30" fill="none" stroke="#c68f84" stroke-width="4">
              <circle cx="50" cy="35" r="15" />
              <path d="M20,85 C20,60 80,60 80,85" />
            </svg>
          </div>
        </div>
        
        <div>
          <h2 class="text-3xl text-gray-700 font-bold">{{ artist.studio }} </h2>

          <!--rating-->
          <p class="text-gray-700 mt-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c68f84] mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            {{ artist.rating }}
          </p>
          
          <!--location-->
          <p class="text-gray-700 mt-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c68f84] mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>      
            {{ artist.city }} {{ artist.district }}
          </p>
          <!--price-->
          <p class="text-gray-700 mt-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c68f84] mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ artist.priceLow }} - {{ artist.priceHigh }}
          </p>
          <!--bio-->
          <p class="text-gray-700 mt-2 flex items-start">
            {{ artist.bio }}
          </p>
          <!-- 擅長風格標籤 -->
          <p class="text-gray-500 text-sm mt-2">
            <span v-for="(style, index) in artist.styles" :key="index" class="mr-2">
              #{{ style }}
            </span>
          </p>
          <!--按鈕群組-->
          <div class="mt-4 flex space-x-3">
            <button @click="openBookingModal" class="bg-[#c68f84] text-white px-4 py-2 rounded-lg hover:bg-[#c67868]">預約</button>
            <button @click="navigateToChat" class="bg-white border border-[#c68f84] text-[#c68f84] px-4 py-2 rounded-lg  hover:border-[#c67868] hover:text-[#c67868] hover:font-semibold">
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                聊聊
              </span>
            </button>
          </div>
        </div>
      </div>
  
      <div class="mb-8">
        <div class="flex items-center mb-5">
          <h3 class="text-2xl text-gray-700 mr-2">作品牆</h3>
          <img src="../assets/flower.png" alt="Flower" class="w-10 h-auto" /> 
        </div>
        
        <!-- 作品牆 -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mx-auto">
          <div 
            v-for="work in sortedWorks" 
            :key="work.id" 
            class="bg-white rounded-xl shadow overflow-hidden flex flex-col"
          >
            <img :src="work.image" class="w-full h-44 object-cover" @error="handleWorkImageError($event)" />
            <div class="p-3 flex flex-col flex-grow">
              <p class="text-gray-500 text-sm mb-1">{{ formatDate(work.date) }}</p>
              <p class="text-gray-700 text-sm mb-2 line-clamp-2 flex-grow">{{ work.description }}</p>
              <div class="flex flex-wrap gap-1 mt-auto">
                <span v-for="(tag, index) in work.tags" :key="index" class="bg-[#c68f84] text-white text-xs py-1 px-3 rounded-full">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 顧客評價 -->
      <div>
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center">
            <h3 class="text-2xl text-gray-700 mr-2">顧客評價</h3>
            <img src="../assets/flower.png" alt="Flower" class="w-10 h-auto" /> 
          </div>
          <!-- 排序 -->
          <div class="flex items-center">
            <span class="text-sm text-gray-700 mr-2">排序方式：</span>
            <select v-model="reviewSortOption" class="py-1 px-2 rounded-md border text-sm bg-white">
              <option value="date-desc">最新</option>
              <option value="date-asc">最舊</option>
              <option value="rating-desc">評分高至低</option>
              <option value="rating-asc">評分低至高</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mx-auto">
          <div v-for="(review, index) in sortedReviews" :key="index" class="bg-white p-4 rounded-xl shadow flex flex-col">
            <div class="flex justify-between items-start mb-1">
              <p class="font-semibold">{{ review.reviewer }}</p>
              <!-- 星星 -->
              <div class="text-[#dcb876]">
                <div class="flex">
                  <template v-for="i in 5" :key="i">
                    <svg v-if="i <= Math.floor(review.rating)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                      <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  </template>
                </div>
              </div>
            </div>
            <p class="text-gray-600 text-sm mb-2 line-clamp-2 flex-grow">{{ review.comment }}</p>
            <p class="text-gray-400 text-xs text-right mt-auto">{{ formatDate(review.date) }}</p>
          </div>
        </div>
      </div>
    </div>
  
    <!-- 預約彈窗模式 -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <BookingView 
          :artist-id="artist.id" 
          @close="showModal = false"
        />
      </div>
    </div>
    
    <!-- 預約側邊欄模式 -->
    <div v-if="showSidebar" 
         class="fixed top-0 right-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 z-40 flex flex-col"
         :class="{'translate-x-0': showSidebar, 'translate-x-full': !showSidebar}">
      <div class="flex-1 overflow-y-auto">
        <BookingView 
          :artist-id="artist.id" 
          @close="showSidebar = false"
        />
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BookingView from './Booking.vue' 

const route = useRoute()
const router = useRouter()

const showMenu = ref(false)
const searchKeyword = ref('')

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

// 控制是否顯示圖片備用內容
const showFallback = ref(false);

// 處理頭像圖片加載失敗
const handleImageError = () => {
  showFallback.value = true;
};

// 處理作品圖片加載失敗
const handleWorkImageError = (event) => {
  // 默認背景色
  event.target.style.display = 'none';
  event.target.parentElement.style.backgroundColor = '#f3f4f6'; 
};

// 格式化日期 YYYY/MM/DD
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
};

// 模擬資料
import design1 from '../assets/temp/design1.jpg'
import design2 from '../assets/temp/design2.jpg'
import design3 from '../assets/temp/design3.jpg'

import work1 from '../assets/temp/work1.jpg'
import work2 from '../assets/temp/work2.jpg'
import work3 from '../assets/temp/work3.jpg'

const artists = [
  {
    id: '1',
    studio: 'waka.nail',
    city: '台北市',
    district: '大安區',
    rating: 4.9, 
    priceLow: 1000, 
    priceHigh: 1800,
    bio: '專精於手繪藝術與流行款式，細心且耐心。',
    styles: ['貓眼', '漸層', '法式', '手繪', '暈染', '日系清新', '金屬光感'],
    image: work1,
    works: [
      {
        id: 1,
        description: '簡約的日系漸變設計，適合各種場合。',
        date: '2024-05-10',
        image: design1,
        tags: ['日系', '簡約', '漸變', '白色系']
      },
      {
        id: 2,
        description: '柔和的粉色法式設計，充滿少女感。',
        date: '2024-05-08',
        image: design2,
        tags: ['粉色', '法式', '少女', '浪漫']
      },
      {
        id: 3,
        description: '暖色調的秋季設計，散發溫柔氣息。',
        date: '2024-05-05',
        image: design3,
        tags: ['秋季', '暖色調', '溫柔', '大地色']
      },
      {
        id: 4,
        description: '閃耀吸睛的貓眼設計，派對必備款。',
        date: '2024-05-01',
        image: work1,
        tags: ['貓眼', '閃亮', '派對', '特殊效果']
      },
      {
        id: 5,
        description: '清涼的水彩暈染效果，展現夏日氛圍。',
        date: '2024-04-28',
        image: work2,
        tags: ['水彩', '暈染', '夏日', '藍色系']
      }
    ],
    reviews: [
      { reviewer: 'Joyce', comment: '超級細心又溫柔，成品超美！喜歡美甲師的建議，完全符合我的風格，下次還會再訪。', rating: 5, date: '2024-05-01' },
      { reviewer: 'Angela', comment: '環境舒服，款式也很專業！', rating: 4, date: '2024-04-28' },
      { reviewer: 'Lily', comment: '非常推薦這位設計師，為我設計了很適合我的款式，而且手法輕柔不傷指甲。', rating: 4, date: '2024-04-15' },
      { reviewer: 'Abby', comment: '很推薦這位美甲師！', rating: 5, date: '2024-04-15' }
    ]
  },
  {
    id: '2',
    studio: 'jolieee_nail',
    city: '新北市',
    district: '板橋區',
    rating: 4.7,
    priceLow: 800,
    priceHigh: 1500,
    bio: '主打簡約美甲與護甲療程，溫柔又高質感。',
    styles: ['護甲', '簡約風', '水鑽', '跳色', '大理石紋'],
    image: 'https://source.unsplash.com/featured/?nailsalon',
    works: [
      {
        id: 1,
        description: '高質感的大理石紋理設計，優雅又時尚。',
        date: '2024-05-12',
        image: work3,
        tags: ['大理石', '質感', '優雅', '黑白灰']
      },
      {
        id: 2,
        description: '精緻的手繪花卉圖案，春日氣息滿滿。',
        date: '2024-05-07',
        image: design1,
        tags: ['花卉', '手繪', '春季', '多彩']
      }
    ],
    reviews: [
      { reviewer: 'Sandy', comment: '好喜歡這裡！一定會再來！設計師有豐富的藝術感，推薦給所有重視品質的顧客。', rating: 4.7, date: '2024-05-03' },
      { reviewer: 'Jenny', comment: '美甲品質很好，但等待時間比預期長了一點。', rating: 4.0, date: '2024-04-20' }
    ]
  },
  {
    id: '3',
    studio: '61.nail',
    city: '高雄市',
    district: '鼓山區',
    rating: 4.6,
    priceLow: 1200,
    priceHigh: 1500,
    bio: '主打簡約美甲與護甲療程，溫柔又高質感。',
    styles: ['金屬質感', '鏡面', '幾何', '極簡', '韓風'],
    image: 'https://source.unsplash.com/featured/?nailsalon',
    works: [
      {
        id: 1,
        description: '閃亮的金屬光澤設計，打造前衛感。',
        date: '2024-05-11',
        image: design2,
        tags: ['金屬', '光澤', '前衛', '特殊效果']
      }
    ],
    reviews: [
      { reviewer: 'Sandy', comment: '金屬光澤效果超出預期，美甲師技術精湛！', rating: 4.8, date: '2024-05-10' }
    ]
  }
]



const artist = ref({})

// 根據日期排序的作品
const sortedWorks = computed(() => {
  if (!artist.value || !artist.value.works) return [];
  
  return [...artist.value.works].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
});

// 評論排序選項
const reviewSortOption = ref('date-desc');

// 根據選擇的排序選項來排序評論
const sortedReviews = computed(() => {
  if (!artist.value || !artist.value.reviews) return [];
  
  return [...artist.value.reviews].sort((a, b) => {
    switch (reviewSortOption.value) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'rating-desc':
        return b.rating - a.rating;
      case 'rating-asc':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });
});

onMounted(() => {
  const id = route.params.id
  const found = artists.find(a => a.id === id)
  if (found) {
    artist.value = found
  } else {
    router.push('/home') // 如果找不到就回首頁
  }
  
  // 頁面載入時自動滾動到頂部
  window.scrollTo(0, 0)
})

// 控制彈窗和側邊欄顯示
const showModal = ref(false)
const showSidebar = ref(false)

// 打開預約彈窗 (可以根據需要選擇彈窗或側邊欄)
const openBookingModal = () => {
  console.log('Opening booking modal/sidebar') // 用於調試
  
  // 使用彈窗
  showModal.value = true
  
  // 或者使用側邊欄 (取消下面的註釋並註釋掉上面)
  // showSidebar.value = true
}

// 導航到聊天頁面的函數
const navigateToChat = () => {
  // 儲存當前美甲師信息到本地存儲或 Vuex/Pinia，以便在聊天頁面使用
  if (artist.value && artist.value.id) {
    console.log('Navigating to chat with:', artist.value.studio, artist.value.id)
    // 導航到聊天頁面，並將美甲師ID，名稱和頭像作為參數傳遞
    router.push({
      path: '/chat',
      query: { 
        artistId: artist.value.id,
        artistName: artist.value.studio,
        artistImage: artist.value.image
      }
    })
  }
}
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

.work-image-container {
  background-color: #f9fafb; 
}

/* 使用line-clamp限制文本行數 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>