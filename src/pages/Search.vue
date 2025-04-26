<template>
  <div class="p-6">
    <!-- 上方固定搜尋美甲師 -->
    <div class="flex items-center mb-6">
      <input v-model="searchName" @keyup.enter="searchByName" placeholder="搜尋美甲師名稱..."
             class="flex-1 border p-2 rounded-lg mr-4" />
      <button @click="searchByName" class="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600">搜尋</button>
    </div>

    <!-- Tabs -->
    <div class="flex space-x-4 mb-6 border-b">
      <button @click="activeTab = 'image'" :class="tabClass('image')">以圖搜尋</button>
      <button @click="activeTab = 'filter'" :class="tabClass('filter')">以條件搜尋</button>
    </div>

    <!-- Tab內容切換 -->
    <div v-if="searchResult.length > 0">
      <!-- 如果有搜尋結果（搜尋名字） -->
      <h2 class="text-2xl font-bold mb-4">搜尋結果</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="artist in searchResult" :key="artist.id" class="bg-white p-4 rounded-xl shadow hover:shadow-lg">
          <img :src="artist.image" class="w-full h-48 object-cover rounded-md mb-3" />
          <h3 class="text-xl font-semibold">{{ artist.name }}</h3>
          <router-link :to="`/profile/${artist.id}`" class="text-pink-500 hover:underline">查看個人頁面</router-link>
        </div>
      </div>
    </div>
    <div v-else>
      <!-- 如果沒有搜尋名字，就切換 tab 顯示 -->
      <ImageSearch v-if="activeTab === 'image'" />
      <FilterSearch v-else />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageSearch from '../components/ImageSearch.vue'
import FilterSearch from '../components/FilterSearch.vue'

const activeTab = ref('image')
const searchName = ref('')
const searchResult = ref([])

const allArtists = [
  { id: 1, name: '小美', image: 'https://source.unsplash.com/featured/?nail' },
  { id: 2, name: 'Grace Nails', image: 'https://source.unsplash.com/featured/?nailsalon' },
  { id: 3, name: 'Momo Studio', image: 'https://source.unsplash.com/featured/?manicure' }
]

const tabClass = (tab) => {
  return [
    'px-4 py-2 font-semibold border-b-2',
    activeTab.value === tab ? 'border-pink-500 text-pink-500' : 'border-transparent text-gray-500 hover:text-pink-400'
  ]
}

const searchByName = () => {
  if (searchName.value.trim() !== '') {
    searchResult.value = allArtists.filter(artist =>
      artist.name.includes(searchName.value.trim())
    )
  } else {
    searchResult.value = []
  }
}
</script>
