<template>
  <div class="min-h-screen flex items-center justify-center bg-pink-100">
    <div class="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">登入 Nail It!</h1>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Email</label>
          <input v-model="email" type="email" class="w-full px-4 py-2 border rounded-xl" required />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">密碼</label>
          <input v-model="password" type="password" class="w-full px-4 py-2 border rounded-xl" required />
        </div>
        <button type="submit" class="w-full bg-pink-500 text-white py-2 rounded-xl hover:bg-pink-600">登入</button>
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
