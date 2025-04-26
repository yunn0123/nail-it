<template>
  <div class="min-h-screen flex items-center justify-center bg-pink-100">
    <div class="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">註冊 Nail It!</h1>

      <!-- 選身分 -->
      <div v-if="!role">
        <button @click="selectRole('user')" class="w-full bg-pink-400 text-white py-2 rounded-lg mb-4 hover:bg-pink-500">
          我是一般用戶
        </button>
        <button @click="selectRole('artist')" class="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700">
          我是美甲師
        </button>
      </div>

      <!-- 用戶註冊 -->
      <form v-else-if="role === 'user'" @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Email</label>
          <input v-model="email" type="email" class="w-full px-4 py-2 border rounded-xl" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-1">密碼</label>
          <input v-model="password" type="password" class="w-full px-4 py-2 border rounded-xl" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-1">確認密碼</label>
          <input v-model="confirmPassword" type="password" class="w-full px-4 py-2 border rounded-xl" required />
        </div>

        <button type="submit" class="w-full bg-pink-500 text-white py-2 rounded-xl hover:bg-pink-600">
          註冊
        </button>

        <p class="text-gray-600 text-center text-sm mt-4">
          已經有帳號？<router-link to="/login" class="text-pink-500 hover:underline">登入</router-link>
        </p>
      </form>

      <!-- 美甲師註冊 -->
      <form v-else @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Email</label>
          <input v-model="email" type="email" class="w-full px-4 py-2 border rounded-xl" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-1">密碼</label>
          <input v-model="password" type="password" class="w-full px-4 py-2 border rounded-xl" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-1">確認密碼</label>
          <input v-model="confirmPassword" type="password" class="w-full px-4 py-2 border rounded-xl" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-1">工作室名稱</label>
          <input v-model="studio" type="text" class="w-full px-4 py-2 border rounded-xl" />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-1">地區</label>
          <input v-model="location" type="text" class="w-full px-4 py-2 border rounded-xl" />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-1">專長風格</label>
          <input v-model="style" type="text" class="w-full px-4 py-2 border rounded-xl" />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-1">自我介紹</label>
          <textarea v-model="bio" rows="3" class="w-full px-4 py-2 border rounded-xl"></textarea>
        </div>

        <button type="submit" class="w-full bg-pink-600 text-white py-2 rounded-xl hover:bg-pink-700">
          註冊
        </button>

        <p class="text-gray-600 text-center text-sm mt-4">
          已經有帳號？<router-link to="/login" class="text-pink-500 hover:underline">登入</router-link>
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
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const studio = ref('')
const location = ref('')
const style = ref('')
const bio = ref('')

const selectRole = (selectedRole) => {
  role.value = selectedRole
}

const handleRegister = () => {
  if (password.value !== confirmPassword.value) {
    alert('密碼與確認密碼不一致！')
    return
  }
  alert(`註冊成功！您是${role.value === 'user' ? '一般用戶' : '美甲師'}！`)
  router.push('/login')
}
</script>
