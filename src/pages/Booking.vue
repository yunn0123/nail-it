<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h2 class="text-3xl font-bold mb-6">預約美甲師：{{ artistName }}</h2>

    <form @submit.prevent="submitBooking" class="space-y-6">
      <div>
        <label class="block text-gray-700 mb-2">選擇日期</label>
        <input type="date" v-model="date" class="border p-2 w-full rounded-lg" required />
      </div>

      <div>
        <label class="block text-gray-700 mb-2">選擇時間</label>
        <select v-model="time" class="border p-2 w-full rounded-lg" required>
          <option value="">請選擇時段</option>
          <option>10:00</option>
          <option>11:00</option>
          <option>13:00</option>
          <option>14:00</option>
          <option>15:00</option>
          <option>16:00</option>
        </select>
      </div>

      <div>
        <label class="block text-gray-700 mb-2">備註（可選）</label>
        <textarea v-model="notes" class="border p-2 w-full rounded-lg" rows="4" placeholder="例如：想做法式、希望偏粉色系..."></textarea>
      </div>

      <button type="submit" class="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600">
        送出預約
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const artistName = ref('') // 顯示用

const date = ref('')
const time = ref('')
const notes = ref('')

onMounted(() => {
  const artistId = route.params.id
  if (artistId === '1') {
    artistName.value = '小美'
  } else if (artistId === '2') {
    artistName.value = 'Grace Nails'
  } else {
    artistName.value = '未知美甲師'
  }
})

const submitBooking = () => {
  if (date.value && time.value) {
    alert(`成功預約！\n日期：${date.value}\n時間：${time.value}\n備註：${notes.value || '無'}`)
    router.push('/home') // 完成後回首頁
  } else {
    alert('請選擇日期和時間！')
  }
}
</script>
