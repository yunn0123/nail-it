<template>
  <div class="min-h-screen flex items-center justify-center bg-[#efddda]">
    <div class="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-6">
        <img src="../assets/logo.png" alt="Logo" class="mx-auto w-128 h-auto" />
      </div>
      
      <h1 class="text-2xl mb-6 text-center">註冊</h1>

      <!-- 選身分 -->
      <div v-if="!role">
        <button @click="selectRole('user')" class="w-full border border-black text-black py-2 rounded-lg mb-4 hover:border-[#c68f84] hover:text-[#c68f84]">
          我是一般用戶
        </button>
        <button @click="selectRole('artist')" class="w-full border border-black text-black py-2 rounded-lg mb-4 hover:border-[#c68f84] hover:text-[#c68f84]">
          我是美甲師
        </button>
      </div>

      <!-- 用戶註冊 -->
      <form v-else-if="role === 'user'" @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">使用者名稱*</label>
          <input v-model="username" type="text" class="w-full px-4 py-2 border rounded-xl" required/>
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Email*</label>
          <input v-model="email" type="email" class="w-full px-4 py-2 border rounded-xl" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-1">密碼*</label>
          <input v-model="password" type="password" class="w-full px-4 py-2 border rounded-xl" required/>
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-1">確認密碼*</label>
          <input v-model="confirmPassword" type="password" class="w-full px-4 py-2 border rounded-xl" required/>
        </div>


        <button type="submit" class="w-full bg-[#c68f84] text-white py-2 rounded-xl hover:bg-[#c67868]">
          註冊
        </button>

        <p class="text-gray-600 text-center text-sm mt-4">
          已經有帳號？<router-link to="/login" class="text-[#c68f84] hover:underline">登入</router-link>
        </p>
      </form>

      <!-- 美甲師註冊 -->
      <form v-else @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">工作室名稱*</label>
          <input v-model="studio" type="text" class="w-full px-4 py-2 border rounded-xl" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Email*</label>
          <input v-model="email" type="email" class="w-full px-4 py-2 border rounded-xl" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-1">密碼*</label>
          <input v-model="password" type="password" class="w-full px-4 py-2 border rounded-xl" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-1">確認密碼*</label>
          <input v-model="confirmPassword" type="password" class="w-full px-4 py-2 border rounded-xl" required />
        </div>

        <!-- 縣市 -->
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">縣市</label>
          <select v-model="selectedCity" @change="updateDistricts" class="w-full px-4 py-2 border rounded-xl custom-select" >
            <option value="">請選擇縣市</option>
            <option v-for="(city, index) in cities" :key="index" :value="city.name">{{ city.name }}</option>
          </select>
        </div>

        <!-- 區域 -->
        <div class="mb-4" v-if="selectedCity">
          <label class="block text-gray-700 mb-1">區域</label>
          <select v-model="selectedDistrict" class="w-full px-4 py-2 border rounded-xl">
            <option value="">請選擇區域</option>
            <option v-for="(district, index) in districts" :key="index" :value="district">{{ district }}</option>
          </select>
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-1">專長/風格</label>
          <input v-model="style" type="text" class="w-full px-4 py-2 border rounded-xl" />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-1">自我介紹</label>
          <textarea v-model="bio" rows="3" class="w-full px-4 py-2 border rounded-xl"></textarea>
        </div>

        <button type="submit" class="w-full bg-[#c68f84] text-white py-2 rounded-xl hover:bg-[#c67868]">
          註冊
        </button>

        <p class="text-gray-600 text-center text-sm mt-4">
          已經有帳號？<router-link to="/login" class="text-[#c68f84] hover:underline">登入</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const role = ref('') // user / artist
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const studio = ref('')
const selectedCity = ref('')
const selectedDistrict = ref('')
const style = ref('')
const bio = ref('')

// 縣市資料
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

// 目前選擇的區域資料
const districts = ref([])

// 根據縣市選擇更新區域選項
const updateDistricts = () => {
  const city = cities.find(city => city.name === selectedCity.value)
  if (city) {
    districts.value = city.districts
  } else {
    districts.value = []
  }
}

const selectRole = (selectedRole) => {
  role.value = selectedRole
}

const handleRegister = () => {
  if (password.value !== confirmPassword.value) {
    alert('密碼與確認密碼不一致！')
    return
  }

  const name = role.value === 'user' ? username.value : studio.value
  alert(`註冊成功！歡迎， ${role.value === 'user' ? '用戶' : '美甲師'} ${name}。`)
  router.push('/login')
}
</script>
