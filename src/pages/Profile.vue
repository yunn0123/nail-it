<template>
  <div class="p-6">
    <div class="flex flex-col md:flex-row md:items-center mb-8">
      <img :src="artist.image" alt="avatar" class="w-32 h-32 object-cover rounded-full mb-4 md:mb-0 md:mr-6 shadow-lg">
      <div>
        <h2 class="text-3xl font-bold">{{ artist.name }}</h2>
        <p class="text-gray-600 mt-2">地點：{{ artist.location }}</p>
        <p class="text-gray-600 mt-1">{{ artist.bio }}</p>
        <button @click="goBooking" class="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600">預約這位美甲師</button>
      </div>
    </div>

    <div class="mb-8">
      <h3 class="text-2xl font-semibold mb-4">作品展示</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <img v-for="(work, index) in artist.works" :key="index" :src="work" class="rounded-lg object-cover h-40 w-full shadow">
      </div>
    </div>

    <div>
      <h3 class="text-2xl font-semibold mb-4">顧客評價</h3>
      <div v-for="(review, index) in artist.reviews" :key="index" class="bg-white p-4 rounded-xl shadow mb-4">
        <p class="font-semibold">{{ review.reviewer }}</p>
        <p class="text-gray-500 text-sm">{{ review.comment }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 模擬資料
const artists = [
  {
    id: '1',
    name: '小美',
    location: '台北市',
    bio: '專精於手繪藝術與流行款式，細心且耐心。',
    image: 'https://source.unsplash.com/featured/?nail,art',
    works: [
      'https://source.unsplash.com/featured/?nail1',
      'https://source.unsplash.com/featured/?nail2',
      'https://source.unsplash.com/featured/?nail3',
      'https://source.unsplash.com/featured/?nail4',
    ],
    reviews: [
      { reviewer: 'Joyce', comment: '超級細心又溫柔，成品超美！' },
      { reviewer: 'Angela', comment: '環境舒服，款式也很專業！' }
    ]
  },
  {
    id: '2',
    name: 'Grace Nails',
    location: '新北市',
    bio: '主打簡約美甲與護甲療程，溫柔又高質感。',
    image: 'https://source.unsplash.com/featured/?nailsalon',
    works: [
      'https://source.unsplash.com/featured/?nail5',
      'https://source.unsplash.com/featured/?nail6',
    ],
    reviews: [
      { reviewer: 'Sandy', comment: '好喜歡這裡！一定會再來！' }
    ]
  }
]

// 找到這位美甲師的資料
const artist = ref({})

onMounted(() => {
  const id = route.params.id
  const found = artists.find(a => a.id === id)
  if (found) {
    artist.value = found
  } else {
    router.push('/home') // 如果找不到就回首頁
  }
})

const goBooking = () => {
  router.push(`/booking/${artist.value.id}`)
}
</script>
