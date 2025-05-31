<template>
  <div class="flex flex-col items-center bg-white p-6 rounded-xl shadow hover:shadow-lg">
    <div class="max-w-7xl mx-auto">
      <!-- 標題 + icon -->
      <h2 class="text-2xl font-medium text-gray-600 mb-6 flex items-center">
        <img src="../assets/flower.png" alt="Flower" class="w-10 h-auto mr-2" /> 
          依條件快速篩選
      </h2>

      <!-- 縣市 -->
      <div class="mb-4">
        <p class="text-gray-600 font-medium mb-2">縣市</p>
        <select
          v-model="selectedCity"
          class="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#c68f84] bg-white"
        >
          <option value="">請選擇縣市</option>
          <option v-for="city in cities" :key="city.name" :value="city.name">
            {{ city.name }}
          </option>
        </select>
      </div>

      <!-- 區域（根據選到的縣市顯示） -->
      <div v-if="selectedCityData" class="mb-4">
        <p class="text-gray-600 font-medium mb-2">
          區域
        </p>
        <div class="relative" ref="dropdownRef">
          <div 
            @click="dropdownOpen = !dropdownOpen" 
            class="border border-gray-300 px-4 py-2 rounded cursor-pointer bg-white text-gray-600 hover:border-[#c68f84] transition-colors min-h-[42px] flex items-center justify-between"
          >
            <span class="truncate">
              {{ selectedDistricts.length ? selectedDistricts.join(', ') : '請選擇區域（可多選）' }}
            </span>
            <svg 
              class="w-4 h-4 ml-2 transform transition-transform"
              :class="{ 'rotate-180': dropdownOpen }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>

          <div 
            v-if="dropdownOpen" 
            class="absolute bg-white border border-gray-300 mt-1 max-h-60 overflow-y-auto rounded shadow-lg z-10 w-full"
          >
            <!-- 全選/清空按鈕 -->
            <div class="px-4 py-2 border-b bg-gray-50 flex justify-between">
              <button 
                @click="selectAllDistricts" 
                class="text-sm text-[#c68f84] hover:underline"
              >
                全選
              </button>
              <button 
                @click="clearAllDistricts" 
                class="text-sm text-gray-500 hover:underline"
              >
                清空
              </button>
            </div>
            
            <div 
              v-for="district in selectedCityData?.districts || []" 
              :key="district" 
              class="px-4 py-2 hover:bg-[#f3e4e1] cursor-pointer flex items-center"
            >
              <input 
                type="checkbox" 
                :checked="selectedDistricts.includes(district)" 
                @change="toggleDistrict(district)"
                class="mr-3 accent-[#c68f84]"
              />
              <span @click="toggleDistrict(district)" class="flex-1 cursor-pointer">{{ district }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 價格 -->
      <div class="mb-4">
        <p class="text-gray-600 font-medium mb-2">
          價格區間（NT$ {{ formatPrice(priceMin) }} - {{ formatPrice(priceMax) }}）
        </p>
        <div class="flex gap-4 items-center">
          <div class="flex-1">
            <input 
              type="number" 
              v-model.number="priceMin"
              @input="onNumberInput($event, 'min')" 
              placeholder="最低價格"
              min="0"
              max="99999"
              step="100"
              class="w-full border border-gray-300 rounded px-4 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#c68f84]"
            />
          </div>
          <span class="text-gray-400">至</span>
          <div class="flex-1">
            <input 
              type="number" 
              v-model.number="priceMax"
              @input="onNumberInput($event, 'max')" 
              placeholder="最高價格"
              min="0"
              max="99999"
              step="100"
              class="w-full border border-gray-300 rounded px-4 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#c68f84]"
            />
          </div>
        </div>
        <div class="flex gap-2 mt-2">
          <button 
            v-for="preset in pricePresets" 
            :key="preset.label"
            @click="setPriceRange(preset.min, preset.max)"
            class="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-[#f3e4e1] transition"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <!-- 評價 -->
      <div class="mb-6">
        <p class="text-gray-600 font-medium mb-2">評分</p>
        <div class="flex flex-wrap gap-3">
          <button 
            v-for="rating in ratings" 
            :key="rating.value" 
            @click="selectedRating = selectedRating === rating.value ? null : rating.value"
            :class="buttonClass(selectedRating === rating.value)"
          >
            {{ rating.label }}
          </button>
        </div>
      </div>

      <!-- 多分類選擇區塊 -->
      <div class="mb-4 relative" ref="categoryDropdownRef">
        <p class="text-gray-600 font-medium mb-2">
          風格標籤分類
        </p>
        <div 
          @click="toggleCategoryDropdown" 
          class="border border-gray-300 px-4 py-2 rounded cursor-pointer bg-white text-gray-600 hover:border-[#c68f84] transition-colors min-h-[42px] flex items-center justify-between"
        >
          <span class="truncate">
            {{ selectedCategories.length ? selectedCategories.map(c => categoryLabels[c]).join(', ') : '請選擇類別（可多選）' }}
          </span>
          <svg 
            class="w-4 h-4 ml-2 transform transition-transform"
            :class="{ 'rotate-180': categoryDropdownOpen }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>

        <div 
          v-if="categoryDropdownOpen" 
          ref="categoryDropdownMenu"
          :class="[
            'absolute z-50 bg-white border border-gray-300 rounded shadow-lg w-full max-h-60 overflow-y-auto',
            dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
          ]"
        >
          <!-- 全選/清空按鈕 -->
          <div class="px-4 py-2 border-b bg-gray-50 flex justify-between">
            <button 
              @click.stop="selectAllCategories" 
              class="text-sm text-[#c68f84] hover:underline"
            >
              全選
            </button>
            <button 
              @click.stop="clearAllCategories" 
              class="text-sm text-gray-500 hover:underline"
            >
              清空
            </button>
          </div>
          
          <div 
            v-for="(label, key) in categoryLabels" 
            :key="key" 
            class="px-4 py-2 hover:bg-[#f3e4e1] cursor-pointer flex items-center"
          >
            <input 
              type="checkbox" 
              :value="key" 
              :checked="selectedCategories.includes(key)"
              @change="toggleCategory(key)"
              class="accent-[#c68f84] mr-3"
            />
            <span @click="toggleCategory(key)" class="flex-1 cursor-pointer">{{ label }}</span>
          </div>
        </div>
      </div>

      <!-- 展示已選分類底下的 tags -->
      <div v-if="selectedCategories.length > 0" class="mb-4">
        
        <div 
          v-for="category in selectedCategories" 
          :key="category" 
          class="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
        >
          <div class="flex items-center justify-between mb-3">
            <p class="text-gray-700 ">
              {{ categoryLabels[category] }}
              <span v-if="selectedTags[category] && selectedTags[category].length" class="text-sm text-[#c68f84] font-normal">
                (已選 {{ selectedTags[category].length }} 個)
              </span>
            </p>
            <div class="flex gap-2">
              <button 
                @click="selectAllTags(category)"
                class="text-xs text-[#c68f84] hover:underline"
              >
                全選
              </button>
              <button 
                @click="clearCategoryTags(category)"
                class="text-xs text-gray-500 hover:underline"
              >
                清空
              </button>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in tagCategories[category] || []"
              :key="tag"
              @click="toggleTag(category, tag)"
              :class="tagButtonClass(selectedTags[category] && selectedTags[category].includes(tag))"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </div>

      <!-- 已選標籤總覽 -->
      <div v-if="allSelectedTags.length" class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <p class="text-gray-600 text-sm">
            已選擇標籤
          </p>
          <button 
            @click="clearAllTags"
            class="text-xs text-gray-500 hover:underline"
          >
            清空所有標籤
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="(tag, index) in allSelectedTags" 
            :key="`${tag}-${index}`"
            class="inline-flex items-center bg-[#f1e4e2] text-gray-600 rounded-full px-3 py-1 text-sm"
          >
            {{ tag }}
            <button 
              @click="removeTag(tag)"
              class="ml-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </span>
        </div>
      </div>

      <!-- 按鈕 -->
      <div class="flex justify-center gap-4 mb-8">
        <button 
          @click="reset"
          class="px-6 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
        >
          重置
        </button>
        <button 
          @click="search" 
          class="px-6 py-2 rounded-full bg-[#c68f84] text-white hover:bg-[#a96c60] transition-colors"
        >
          搜尋
        </button>
      </div>

      <!-- 搜尋結果 -->
      <div v-if="filteredWorks.length">
      <!-- 搜尋結果標題 -->
  <div ref="searchResults" class="flex items-center mb-5">
    <h2 class="text-2xl text-gray-700 mr-2">搜尋結果</h2>
    <img src="../assets/flower.png" alt="Flower" class="w-10 h-auto" /> 
  </div>
      <div  class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        
        <div 
          v-for="design in filteredWorks" 
          :key="design.id" 
          class="bg-white p-4 rounded-xl shadow hover:shadow-lg cursor-pointer transition-shadow" 
          @click="goToProfile(design.id)"
        >
          
          <img :src="design.image" class="w-full h-48 object-cover rounded-md mb-3" />
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-[#c68f84] font-medium">{{ design.studio }}</h3>
            <p class="text-[#dcb876]  text-sm">★ {{ design.rating }}</p>
          </div>
          <p class="text-gray-500 text-sm mb-2">$ {{ design.priceLow }} - {{ design.priceHigh }}</p>
          <div class="mb-2">
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="(tag, index) in design.tags" 
                :key="index" 
                class="bg-[#c68f84] text-white text-xs py-1 px-3 rounded-full"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchResults = ref(null)

// 價格預設選項
const pricePresets = [
  { label: '1000以下', min: 0, max: 1000 },
  { label: '1000-2000', min: 1000, max: 2000 },
  { label: '2000-3000', min: 2000, max: 3000 },
  { label: '3000以上', min: 3000, max: 99999 }
]

const setPriceRange = (min, max) => {
  priceMin.value = min
  priceMax.value = max
}

const formatPrice = (price) => {
  return isNaN(price) ? 0 : price.toLocaleString()
}

// 全選/清空功能
const selectAllDistricts = () => {
  selectedDistricts.value = [...(selectedCityData.value?.districts || [])]
}

const clearAllDistricts = () => {
  selectedDistricts.value = []
}

const selectAllCategories = () => {
  selectedCategories.value = Object.keys(categoryLabels)
}

const clearAllCategories = () => {
  selectedCategories.value = []
  // 同時清空所有標籤
  Object.keys(selectedTags).forEach(category => {
    selectedTags[category] = []
  })
}

const selectAllTags = (category) => {
  selectedTags[category] = [...tagCategories[category]]
}

const clearCategoryTags = (category) => {
  selectedTags[category] = []
}

const clearAllTags = () => {
  Object.keys(selectedTags).forEach(category => {
    selectedTags[category] = []
  })
}

const removeTag = (tagToRemove) => {
  Object.keys(selectedTags).forEach(category => {
    const index = selectedTags[category].indexOf(tagToRemove)
    if (index > -1) {
      selectedTags[category].splice(index, 1)
    }
  })
}

const toggleCategory = (key) => {
  const index = selectedCategories.value.indexOf(key)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
    // 移除該分類的所有標籤
    selectedTags[key] = []
  } else {
    selectedCategories.value.push(key)
  }
}

const allSelectedTags = computed(() => {
  return Object.values(selectedTags).flat()
})

// 跳轉到 profile 頁面
const goToProfile = (designId) => {
  router.push(`/profile/${designId}`)
}

// 自動滾動到搜尋結果
const scrollToResults = () => {
  if (searchResults.value) {
    searchResults.value.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }
}

const reset = () => {
  selectedCity.value = ''
  selectedDistricts.value = []
  selectedRating.value = null
  filteredWorks.value = []
  priceMin.value = 0
  priceMax.value = 5000
  selectedCategories.value = []
  categoryDropdownOpen.value = false
  Object.keys(selectedTags).forEach(category => {
    selectedTags[category] = []
  })
}

//===================縣市&區域===================
const cities = [
  { name: '新北市', districts: ['萬里區', '金山區', '板橋區', '汐止區', '深坑區', '石碇區', '瑞芳區', '平溪區', '雙溪區', '貢寮區', '新店區', '坪林區', '烏來區', '永和區', '中和區', '土城區', '三峽區', '樹林區', '鶯歌區', '三重區', '新莊區', '泰山區', '林口區', '蘆洲區', '五股區', '八里區', '淡水區', '三芝區', '石門區'] },
  { name: '臺北市', districts: ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'] },
  { name: '桃園市', districts: ['中壢區', '平鎮區', '龍潭區', '楊梅區', '新屋區', '觀音區', '桃園區', '龜山區', '八德區', '大溪區', '復興區', '大園區', '蘆竹區'] },
  { name: '臺中市', districts: ['中區', '東區', '南區', '西區', '北區', '北屯區', '西屯區', '南屯區', '太平區', '大里區', '霧峰區', '烏日區', '豐原區', '后里區', '石岡區', '東勢區', '和平區', '新社區', '潭子區', '大雅區', '神岡區', '大肚區', '沙鹿區', '龍井區', '梧棲區', '清水區', '大甲區', '外埔區', '大安區'] },
  { name: '臺南市', districts: ['中西區', '東區', '南區', '北區', '安平區', '安南區', '永康區', '歸仁區', '新化區', '左鎮區', '玉井區', '楠西區', '南化區', '仁德區', '關廟區', '龍崎區', '官田區', '麻豆區', '佳里區', '西港區', '七股區', '將軍區', '學甲區', '北門區', '新營區', '後壁區', '白河區', '東山區', '六甲區', '下營區', '柳營區', '鹽水區', '善化區', '大內區', '山上區', '新市區', '安定區'] },
  { name: '高雄市', districts: ['新興區', '前金區', '苓雅區', '鹽埕區', '鼓山區', '旗津區', '前鎮區', '三民區', '楠梓區', '小港區', '左營區', '仁武區', '大社區', '岡山區', '路竹區', '阿蓮區', '田寮區', '燕巢區', '橋頭區', '梓官區', '彌陀區', '永安區', '湖內區', '鳳山區', '大寮區', '林園區', '鳥松區', '大樹區', '旗山區', '美濃區', '六龜區', '內門區', '杉林區', '甲仙區', '桃源區', '那瑪夏區', '茂林區', '茄萣區'] },
  { name: '基隆市', districts: ['仁愛區', '信義區', '中正區', '中山區', '安樂區', '暖暖區', '七堵區'] },
  { name: '新竹市', districts: ['東區', '北區', '香山區'] },
  { name: '嘉義市', districts: ['東區', '西區'] },
  { name: '宜蘭縣', districts: ['宜蘭市', '頭城鎮', '礁溪鄉', '壯圍鄉', '員山鄉', '羅東鎮', '三星鄉', '大同鄉', '五結鄉', '冬山鄉', '蘇澳鎮', '南澳鄉'] },
  { name: '新竹縣', districts: ['竹北市', '湖口鄉', '新豐鄉', '新埔鎮', '關西鎮', '芎林鄉', '寶山鄉', '竹東鎮', '五峰鄉', '橫山鄉', '尖石鄉', '北埔鄉', '峨眉鄉'] },
  { name: '苗栗縣', districts: ['竹南鎮', '頭份市', '三灣鄉', '南庄鄉', '獅潭鄉', '後龍鎮', '通霄鎮', '苑裡鎮', '苗栗市', '造橋鄉', '頭屋鄉', '公館鄉', '大湖鄉', '泰安鄉', '銅鑼鄉', '三義鄉', '西湖鄉', '卓蘭鎮'] },
  { name: '彰化縣', districts: ['彰化市', '芬園鄉', '花壇鄉', '秀水鄉', '鹿港鎮', '福興鄉', '線西鄉', '和美鎮', '伸港鄉', '員林市', '社頭鄉', '永靖鄉', '埔心鄉', '溪湖鎮', '大村鄉', '埔鹽鄉', '田中鎮', '北斗鎮', '田尾鄉', '埤頭鄉', '溪州鄉', '竹塘鄉', '二林鎮', '大城鄉', '芳苑鄉', '二水鄉'] },
  { name: '南投縣', districts: ['南投市', '中寮鄉', '草屯鎮', '國姓鄉', '埔里鎮', '仁愛鄉', '名間鄉', '集集鎮', '水里鄉', '魚池鄉', '信義鄉', '竹山鎮', '鹿谷鄉'] },
  { name: '雲林縣', districts: ['斗南鎮', '大埤鄉', '虎尾鎮', '土庫鎮', '褒忠鄉', '東勢鄉', '臺西鄉', '崙背鄉', '麥寮鄉', '斗六市', '林內鄉', '古坑鄉', '莿桐鄉', '西螺鎮', '二崙鄉', '北港鎮', '水林鄉', '口湖鄉', '四湖鄉', '元長鄉'] },
  { name: '嘉義縣', districts: ['番路鄉', '梅山鄉', '竹崎鄉', '阿里山鄉', '中埔鄉', '大埔鄉', '水上鄉', '鹿草鄉', '太保市', '朴子市', '東石鄉', '六腳鄉', '新港鄉', '民雄鄉', '大林鎮', '溪口鄉', '義竹鄉', '布袋鎮'] },
  { name: '屏東縣', districts: ['屏東市', '三地門鄉', '霧臺鄉', '瑪家鄉', '九如鄉', '里港鄉', '高樹鄉', '鹽埔鄉', '長治鄉', '麟洛鄉', '竹田鄉', '內埔鄉', '萬丹鄉', '潮州鎮', '泰武鄉', '來義鄉', '萬巒鄉', '崁頂鄉', '新埤鄉', '南州鄉', '林邊鄉', '東港鎮', '琉球鄉', '佳冬鄉', '新園鄉', '枋寮鄉', '枋山鄉', '春日鄉', '獅子鄉', '車城鄉', '牡丹鄉', '恆春鎮', '滿州鄉'] },
  { name: '臺東縣', districts: ['臺東市', '綠島鄉', '蘭嶼鄉', '延平鄉', '卑南鄉', '鹿野鄉', '關山鎮', '海端鄉', '池上鄉', '東河鄉', '成功鎮', '長濱鄉', '太麻里鄉', '金峰鄉', '大武鄉', '達仁鄉'] },
  { name: '花蓮縣', districts: ['花蓮市', '新城鄉', '秀林鄉', '吉安鄉', '壽豐鄉', '鳳林鎮', '光復鄉', '豐濱鄉', '瑞穗鄉', '萬榮鄉', '玉里鎮', '卓溪鄉', '富里鄉'] },
  { name: '澎湖縣', districts: ['馬公市', '西嶼鄉', '望安鄉', '七美鄉', '白沙鄉', '湖西鄉'] },
  { name: '金門縣', districts: ['金沙鎮', '金湖鎮', '金寧鄉', '金城鎮', '烈嶼鄉', '烏坵鄉'] },
  { name: '連江縣', districts: ['南竿鄉', '北竿鄉', '莒光鄉', '東引鄉'] }
]

const selectedCity = ref('')
const selectedDistricts = ref([])

const selectedCityData = computed(() =>
  cities.find(city => city.name === selectedCity.value)
)

watch(selectedCity, () => {
  selectedDistricts.value = []
})

const dropdownOpen = ref(false)
const dropdownRef = ref(null)

const toggleDistrict = (district) => {
  const idx = selectedDistricts.value.indexOf(district)
  if (idx > -1) {
    selectedDistricts.value.splice(idx, 1)
  } else {
    selectedDistricts.value.push(district)
  }
}

// 點外面收起下拉選單
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false
  }
  if (categoryDropdownRef.value && !categoryDropdownRef.value.contains(event.target)) {
    categoryDropdownOpen.value = false
  }
}

// 監聽視窗滾動和調整大小，自動收起選單
const handleScroll = () => {
  if (categoryDropdownOpen.value) {
    categoryDropdownOpen.value = false
  }
  if (dropdownOpen.value) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', handleScroll)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleScroll)
})

//===================價格區間===================
const priceMin = ref(0)
const priceMax = ref(5000)

const onNumberInput = (event, type) => {
  const value = event.target.value
  const numericValue = value.replace(/[^\d]/g, '')
  const cleanValue = Number(numericValue)
  if (isNaN(cleanValue)) return

  if (type === 'min') priceMin.value = cleanValue
  if (type === 'max') priceMax.value = cleanValue
}

watch([priceMin, priceMax], ([min, max]) => {
  if (min > max) {
    priceMin.value = max
    priceMax.value = min
  }
})

//===================評分===================
const ratings = [
  { label: '4.0★以上', value: 4.0 },
  { label: '4.5★以上', value: 4.5 },
  { label: '5.0★', value: 5.0 }
]
const selectedRating = ref(null)

//=================風格標籤=================
const selectedCategories = ref([])
const categoryDropdownOpen = ref(false)
const categoryDropdownRef = ref(null)
const categoryDropdownMenu = ref(null)
const dropdownDirection = ref('down')

// 智能判斷下拉選單展開方向
const toggleCategoryDropdown = () => {
  if (!categoryDropdownOpen.value) {
    // 計算選單應該向上還是向下展開
    const rect = categoryDropdownRef.value.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const dropdownHeight = 240 // max-h-60 約等於 240px
    const spaceBelow = windowHeight - rect.bottom
    const spaceAbove = rect.top
    
    // 如果下方空間不足但上方空間充足，則向上展開
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      dropdownDirection.value = 'up'
    } else {
      dropdownDirection.value = 'down'
    }
  }
  categoryDropdownOpen.value = !categoryDropdownOpen.value
}

const tagButtonClass = (selected) => {
  return selected 
    ? 'px-3 py-1 bg-[#c68f84] text-white rounded-full transition-colors'
    : 'px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-[#f3e4e1] transition-colors'
}

const tagCategories = {
  Style: [
    "跳色",
    "單色",
    "手繪",
    "法式",
    "漸層",
    "貓眼",
    "鏡面",
    "雕花",
    "亮片"
  ],
  Shape: [
    "圓形",
    "尖形",
    "方圓形",
    "方形",
    "橢圓形",
  ],
  Color: [
    "裸粉色",
    "粉色",
    "白色",
    "紅色",
    "橙色",
    "黃色",
    "綠色",
    "藍色",
    "紫色",
    "灰色",
    "黑色",
    "棕色",
    "酒紅色",
    "咖啡色",
    "金屬銀",
    "銀色",
    "亮片"
  ],
  Texture: [
    "亮面",
    "霧面",
    "亮片",
    "珠光",
    "砂糖感",
    "金屬箔"
  ],
  Decorations: [
    "水鑽",
    "貼紙",
    "印章",
    "貝殼",
    "金屬飾片",
    "金屬箔",
    "雕花",
    "亮片"
  ],
  Theme: [
    "優雅",
    "簡約",
    "可愛",
    "繽紛",
    "日常",
    "日系",
    "歐美風",
    "春",
    "夏",
    "秋",
    "冬",
    "韓系"
  ]
}

const selectedTags = reactive({
  Style: [],
  Shape: [],
  Color: [],
  Texture: [],
  Decorations: [],
  Theme: []
})

const categoryLabels = {
  Style: '款式',
  Shape: '甲型',
  Color: '顏色',
  Texture: '質地',
  Decorations: '裝飾',
  Theme: '風格'
}

const toggleTag = (category, tag) => {
  const index = selectedTags[category].indexOf(tag)
  if (index > -1) selectedTags[category].splice(index, 1)
  else selectedTags[category].push(tag)
}

// 假資料：你可能會喜歡
import design1 from '../assets/temp/design1.jpg'
import design2 from '../assets/temp/design2.jpg'
import design3 from '../assets/temp/design3.jpg'

const filteredWorks = ref([])

const buttonClass = (selected) => {
  return selected 
    ? 'px-4 py-1 bg-[#c68f84] text-white rounded-full transition-colors'
    : 'px-4 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-[#f3e4e1] transition-colors'
}

const search = () => {
  filteredWorks.value = [
    { 
      id: '1', 
      studio: '@waka.nail', 
      rating: 4.9, 
      priceLow: 1000, priceHigh: 1800,
      tags: ['貓眼', '清新', '日系', '綠色系'], 
      image: design1 
    },
    { 
      id: '2', 
      studio: '@jolieee_nail', 
      rating: 4.7, 
      priceLow: 1000, priceHigh: 1500, 
      tags: ['貓眼', '清新', '藍色系'],
      image: design2 
    },
    { 
      id: '3', 
      studio: '@61.nail', 
      rating: 4.6, 
      priceLow: 1200, priceHigh: 1500, 
      tags: ['貓眼', '清新', '可愛','粉色系'],
      image: design3 
    },
    { 
      id: '4', 
      studio: '@test.nail', 
      rating: 4.5, 
      priceLow: 900, priceHigh: 1600, 
      tags: ['簡約', '清新'],
      image: design1 
    },
  ]
  
  // 搜尋完成後自動滾動到結果
  nextTick(() => {
    scrollToResults()
  })
}
</script>