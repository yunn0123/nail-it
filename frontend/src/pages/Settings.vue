<template>
    <div class="min-h-screen bg-[#efddda] flex flex-col" @click="closeMenu">
        <!-- Navbar -->
        <div class="flex items-center justify-between p-3 mx-4">
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

            <!-- 假搜尋欄 -->
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

        <!-- 真正的內容區塊 -->
        <div class="flex flex-col items-center justify-start px-6 pt-8">
            <!-- 標題 -->
            <h2 class="text-3xl text-gray-700 font-semibold mb-8">隱私設定</h2>

            <!-- 表單區塊 -->
            <div class="bg-white shadow rounded-2xl flex flex-col md:flex-row p-6 max-w-4xl w-full">
                <!-- 左側：頭像與帳號 -->
                <div class="flex flex-col items-center md:w-1/3 mb-6 md:mb-0">
                    <label class="cursor-pointer">
                    <div class="w-40 h-40 rounded-full bg-gray-200 mb-4 overflow-hidden">
                        <img :src="user.image || defaultImage" alt="avatar" class="w-full h-full object-cover" />
                    </div>
                    <input type="file" class="hidden" accept="image/*" @change="handleImageUpload" />
                    </label>
                    <p class="text-xl font-semibold text-gray-700 bg-[#f5f5f5] px-4 py-1 rounded-full">{{ user.username }}</p>
                </div>
            

                <!-- 右側：基本資料表單 -->
                <div class="flex-1 ml-0 md:ml-8">
                    <h3 class="text-xl font-bold text-gray-600 mb-4">編輯資訊</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="text-sm text-gray-600">email</label>
                            <input type="email" v-model="user.email" disabled
                            class="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-500" />
                        </div>
                        <div>
                            <label class="text-sm text-gray-600">用戶 ID</label>
                            <input type="text" v-model="user.id" disabled
                            class="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-500" />
                        </div>
                        <div>
                            <label class="text-sm text-gray-600">用戶名稱</label>
                            <input type="text" v-model="user.username" class="w-full border rounded-md px-3 py-2"
                            :class="{ 'border-red-400': errors.username }" />
                            <p v-if="errors.username" class="text-red-500 text-sm mt-1">{{ errors.username }}</p>
                        </div>
                        <div>
                            <label class="text-sm text-gray-600">電話號碼</label>
                            <input type="text" v-model="user.phone" class="w-full border rounded-md px-3 py-2"
                            :class="{ 'border-red-400': errors.phone }" />
                            <p v-if="errors.phone" class="text-red-500 text-sm mt-1">{{ errors.phone }}</p>
                        </div>
                    </div>

                    <!-- 按鈕 -->
                    <div class="mt-6 flex justify-end">
                        <button @click="save" class="bg-[#c68f84] text-white px-6 py-2 rounded-lg hover:bg-[#a96c60]">
                            儲存設定
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast -->
        <div v-if="showToast" class="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow">
            儲存成功！
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLogout } from '../auth.js'

const { handleLogout } = useLogout()

const router = useRouter()

const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

// 點其他地方要關掉選單
const closeMenu = () => {
  showMenu.value = false
}

const user = ref({
  email: 'def5678@gmail.com',
  id: '@def_5678',
  username: 'def_customer',
  phone: '+886 910203040',
  image: ''
})

const defaultImage = 'https://via.placeholder.com/150'
const showToast = ref(false)
const errors = ref({ username: '', phone: '' })

const validate = () => {
  errors.value.username = ''
  errors.value.phone = ''

  if (!user.value.username || user.value.username.length < 3) {
    errors.value.username = '使用者名稱至少 3 個字'
  }
  const phoneRegex = /^\+886\s9\d{2}\d{6}$/
  if (!phoneRegex.test(user.value.phone)) {
    errors.value.phone = '手機號碼格式錯誤（範例：+886 912345678）'
  }

  return !errors.value.username && !errors.value.phone
}

const save = () => {
  if (!validate()) return
  showToast.value = true
  setTimeout(() => showToast.value = false, 2000)
}

const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    user.value.image = reader.result
  }
  reader.readAsDataURL(file)
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
</script>
