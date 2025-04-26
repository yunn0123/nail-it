<template>
  <div>
    <h2 class="text-xl font-bold mb-4">依條件快速篩選</h2>

    <div class="flex flex-wrap gap-2 mb-4">
      <button v-for="city in cities" :key="city" @click="toggleCity(city)"
              :class="buttonClass(selectedCities.includes(city))">
        {{ city }}
      </button>
    </div>

    <div class="flex flex-wrap gap-2 mb-4">
      <button v-for="price in prices" :key="price" @click="togglePrice(price)"
              :class="buttonClass(selectedPrices.includes(price))">
        {{ price }}
      </button>
    </div>

    <div class="flex flex-wrap gap-2 mb-6">
      <button v-for="rating in ratings" :key="rating" @click="toggleRating(rating)"
              :class="buttonClass(selectedRatings.includes(rating))">
        {{ rating }}
      </button>
    </div>

    <button @click="search" class="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 mb-6">OK</button>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div v-for="(work, index) in filteredWorks" :key="index" class="bg-white p-4 rounded-xl shadow">
        <img :src="work.image" class="w-full h-40 object-cover rounded mb-2" />
        <p class="font-semibold">{{ work.title }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const cities = ['台北市', '新北市', '桃園市', '台南市']
const prices = ['0-1000', '1000-2000', '2000-3000']
const ratings = ['4.0★', '4.5★', '5.0★']

const selectedCities = ref([])
const selectedPrices = ref([])
const selectedRatings = ref([])

const works = [
  { title: '秋日溫柔風', image: 'https://source.unsplash.com/featured/?nail4' },
  { title: '日系簡約', image: 'https://source.unsplash.com/featured/?nail5' }
]

const filteredWorks = ref([])

const buttonClass = (selected) => {
  return selected ? 'px-3 py-1 bg-pink-400 text-white rounded-full' : 'px-3 py-1 bg-gray-200 rounded-full'
}

const toggleCity = (city) => {
  const index = selectedCities.value.indexOf(city)
  if (index > -1) selectedCities.value.splice(index, 1)
  else selectedCities.value.push(city)
}

const togglePrice = (price) => {
  const index = selectedPrices.value.indexOf(price)
  if (index > -1) selectedPrices.value.splice(index, 1)
  else selectedPrices.value.push(price)
}

const toggleRating = (rating) => {
  const index = selectedRatings.value.indexOf(rating)
  if (index > -1) selectedRatings.value.splice(index, 1)
  else selectedRatings.value.push(rating)
}

const search = () => {
  filteredWorks.value = works // 先呈現假資料，直接展示全部
}
</script>
