<template>
    <div class="min-h-screen bg-[#efddda] flex justify-center pt-12 px-4">
      <div class="bg-white p-6 rounded-2xl shadow max-w-xl w-full">
      <!-- 標題 + icon -->
      <h2 class="text-2xl font-semibold text-[#5f4c47] mb-6 flex items-center">
        <img src="../assets/flower.png" alt="Flower" class="w-10 h-auto" /> 
        依條件快速篩選
      </h2>

      <!-- 縣市 -->
      <div class="mb-4">
        <p class="text-[#5f4c47] mb-2">縣市</p>
        <select
          v-model="selectedCity"
          class="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#c68f84]"
        >
          <option value="">請選擇縣市</option>
          <option v-for="city in cities" :key="city.name" :value="city.name">
            {{ city.name }}
          </option>
        </select>
      </div>

      <!-- 區域（根據選到的縣市顯示） -->
      <div v-if="selectedCityData" class="mb-4">
        <p class="text-[#5f4c47] mb-2">區域</p>
        <div class="relative" ref="dropdownRef">
          <div 
            @click="dropdownOpen = !dropdownOpen" 
            class="border px-4 py-2 rounded cursor-pointer bg-white text-[#5f4c47]"
          >
            {{ selectedDistricts.length ? selectedDistricts.join(', ') : '請選擇區域' }}
          </div>

          <ul 
            v-if="dropdownOpen" 
            class="absolute bg-white border mt-1 max-h-60 overflow-y-auto rounded shadow z-10 w-full"
          >
            <li 
              v-for="district in selectedCityData?.districts || []" 
              :key="district" 
              @click="toggleDistrict(district)" 
              class="px-4 py-2 hover:bg-[#f3e4e1] cursor-pointer"
            >
              <input 
                type="checkbox" 
                :checked="selectedDistricts.includes(district)" 
                class="mr-2"
                @click.stop
              />
              {{ district }}
            </li>
          </ul>
        </div>
      </div>

      <!-- 價格 -->
      <div class="mb-4">
        <p class="text-[#5f4c47] mb-2">
          價格區間（NT$ {{ isNaN(priceMin) ? 0 : priceMin }} - {{ isNaN(priceMax) ? 0 : priceMax }}）
        </p>
        <div class="flex gap-4">
          <input 
            type="number" 
            v-model.number="priceMin"
            @input="onNumberInput($event, 'min')" 
            placeholder="最低價格"
            min="0"
            max="99999"
            step="100"
            class="w-full border rounded px-4 py-2 text-[#5f4c47] focus:outline-none focus:ring-2 focus:ring-[#c68f84]"
          />

          <input 
            type="number" 
            v-model.number="priceMax"
            @input="onNumberInput($event, 'max')" 
            placeholder="最高價格"
            min="0"
            max="99999"
            step="100"
            class="w-full border rounded px-4 py-2 text-[#5f4c47] focus:outline-none focus:ring-2 focus:ring-[#c68f84]"
          />
        </div>
      </div>

      <!-- 評價 -->
      <div class="mb-6">
        <p class="text-[#5f4c47] mb-2">評分</p>
        <div class="flex flex-wrap gap-3">
          <button 
            v-for="rating in ratings" 
            :key="rating" 
            @click="toggleRating(rating)"
            :class="buttonClass(selectedRatings.includes(rating))"
          >
            {{ rating }}
          </button>
        </div>
      </div>

      <!-- 按鈕 -->
      <div class="flex justify-center gap-4 mb-8">
        <button 
          @click="reset"
          class="px-6 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-[#5f4c47] transition"
        >
          Reset
        </button>
        <button 
          @click="search" 
          class="px-6 py-2 rounded-full bg-[#c68f84] text-white hover:bg-[#a96c60] transition"
        >
          OK
        </button>
      </div>

      <!-- 搜尋結果 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div 
          v-for="(work, index) in filteredWorks" 
          :key="index" 
          class="bg-white p-4 rounded-xl shadow hover:shadow-lg"
        >
          <img :src="work.image" class="w-full h-40 object-cover rounded-md mb-2" />
          <p class="font-semibold text-[#5f4c47]">{{ work.title }}</p>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount  } from 'vue'

const reset = () => {
  selectedCity.value = ''            // 清空城市選擇
  selectedDistricts.value = []       // 清空行政區
  selectedRatings.value = []         // 清空評價
  filteredWorks.value = []           // 清空結果（或預設資料）
  priceMin.value = 0
  priceMax.value = 5000
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
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
//===================縣市&區域===================

//===================價格區間===================
const priceMin = ref(0)
const priceMax = ref(5000)

const onNumberInput = (event, type) => {
  const value = event.target.value
  const numericValue = value.replace(/[^\d]/g, '') // 移除非數字

  const cleanValue = Number(numericValue)
  if (isNaN(cleanValue)) return

  if (type === 'min') priceMin.value = cleanValue
  if (type === 'max') priceMax.value = cleanValue
}

watch([priceMin, priceMax], ([min, max]) => {
  if (min > max) {
    // 自動交換
    priceMin.value = max
    priceMax.value = min
  }
})
//===================價格區間===================

//===================評分===================
const ratings = ['4.0★', '4.5★', '5.0★']
const selectedRatings = ref([])

const toggleRating = (rating) => {
  const index = selectedRatings.value.indexOf(rating)
  if (index > -1) selectedRatings.value.splice(index, 1)
  else selectedRatings.value.push(rating)
}
//===================評分===================

const works = [
  { title: '秋日溫柔風', image: 'https://source.unsplash.com/featured/?nail4' },
  { title: '日系簡約', image: 'https://source.unsplash.com/featured/?nail5' }
]

const filteredWorks = ref([])

const buttonClass = (selected) => {
  return selected 
    ? 'px-4 py-1 bg-[#c68f84] text-white rounded-full transition'
    : 'px-4 py-1 bg-gray-100 text-[#5f4c47] rounded-full hover:bg-[#f3e4e1] transition'
}

const search = () => {
  filteredWorks.value = works.filter(work => {
    // 模擬價格篩選邏輯，範例中沒資料 source 只是寫死圖片
    const fakePrice = 2500 // 假設每個作品有價格屬性
    return fakePrice >= priceMin.value && fakePrice <= priceMax.value
  })
}
</script>
