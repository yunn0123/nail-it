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
        <button type="submit" class="w-full bg-[#c68f84] text-white py-2 rounded-xl hover:bg-[#c67868]">登入</button>
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

const handleLogin = () => {
  // 模擬登入
  if (email.value && password.value) {
    router.push('/home')
  } else {
    alert('請輸入帳號密碼')
  }
}
</script>
