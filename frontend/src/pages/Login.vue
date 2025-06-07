<template>
  <div class="min-h-screen flex items-center justify-center bg-[#efddda]">
    <div class="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-6">
        <img src="../assets/logo.png" alt="Logo" class="mx-auto w-128 h-auto" />
      </div>
      <h1 class="text-2xl mb-6 text-center">登入</h1>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Email</label>
          <input v-model="email" type="email" class="w-full px-4 py-2 border rounded-xl" required />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">密碼</label>
          <input v-model="password" type="password" class="w-full px-4 py-2 border rounded-xl" required />
        </div>
        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-[#c68f84] text-white py-2 rounded-xl hover:bg-[#c67868] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
          {{ isLoading ? '登入中...' : '登入' }}
        </button>
        <p class="text-gray-600 text-center text-sm mt-4">
          還沒有帳號？<router-link to="/register" class="text-[#c68f84] hover:underline">註冊</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()

// API 設定
const API_BASE_URL = 'http://localhost:4000/api'
const isLoading = ref(false)

// API 請求函數
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('API Request Error:', error)
    return { success: false, error: error.message }
  }
}

// 修改後的 handleLogin 函數
const handleLogin = async () => {
  // 基本驗證
  if (!email.value || !password.value) {
    alert('請輸入帳號密碼')
    return
  }

  // 設定載入狀態
  isLoading.value = true

  try {
    // 呼叫登入 API
    const result = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    if (result.success) {
      console.log('登入成功:', result.data)
      alert('登入成功！')
      
      // 可以在這裡儲存用戶資訊
      // localStorage.setItem('userEmail', email.value)
      // localStorage.setItem('isLoggedIn', 'true')
      
      // 清空表單
      email.value = ''
      password.value = ''
      
      // 跳轉到首頁
      router.push('/home')
    } else {
      alert(`登入失敗：${result.error}`)
    }

  } catch (error) {
    console.error('登入錯誤:', error)
    alert('登入過程中發生錯誤，請稍後再試。')
  } finally {
    isLoading.value = false
  }
}
</script>
