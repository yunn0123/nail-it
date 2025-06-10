<!-- Booking.vue -->
<template>
  <div class="p-4">
    <!-- 檢查中的載入狀態 -->
    <div v-if="isCheckingSchedule" class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c68f84] mx-auto mb-4"></div>
      <p class="text-gray-600">檢查美甲師時段中...</p>
    </div>

    <!-- 沒有設定時段 -->
    <div v-else-if="hasAvailableSchedule === false" class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-xl font-medium text-gray-700 mb-2">暫時無法預約</h3>
      <p class="text-gray-600 mb-4">{{ artistName }} 尚未設定營業時段</p>
      <p class="text-sm text-gray-600 mb-6">請稍後再試，或透過「聊聊」功能直接聯繫美甲師</p>
      <button @click="$emit('close')" class="px-6 py-2 bg-[#c68f84] text-white rounded-lg hover:bg-[#c67868]">
        關閉
      </button>
    </div>

    <!-- 載入中 -->
    <div v-else-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c68f84] mx-auto mb-2"></div>
      <p class="text-gray-600">載入中...</p>
    </div>

    <!-- 有設定時段，顯示預約表單 -->
    <div v-else-if="hasAvailableSchedule === true && !showSuccess">
      <h2 class="text-2xl text-gray-700 font-bold mb-6">預約 {{ artistName }}</h2>

      <form @submit.prevent="submitBooking" class="space-y-6">
        <div>
          <label class="block text-gray-700 mb-2">選擇日期</label>
          <!-- 使用日期選擇组件 -->
          <div class="date-selector border rounded-lg p-4">
            <!-- 月份顯示 -->
            <div class="flex justify-between items-center mb-4">
              <button 
                @click="changeMonth(-1)" 
                class="text-gray-500 hover:text-gray-700"
                :disabled="!canGoToPrevMonth"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 class="text-lg font-medium">{{ currentMonthName }} {{ currentYear }}</h3>
              <button 
                @click="changeMonth(1)" 
                class="text-gray-500 hover:text-gray-700"
                :disabled="!canGoToNextMonth"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <!-- 星期標題 -->
            <div class="grid grid-cols-7 gap-2 mb-2 text-center">
              <div v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" class="text-sm font-medium">
                {{ day }}
              </div>
            </div>
            
            <!-- 日期網格 -->
            <div class="grid grid-cols-7 gap-2">
              <div v-for="n in firstDayOfMonth" :key="`empty-${n}`" class="text-center py-2"></div>
              
              <!-- 實際日期 -->
                <div
                  v-for="dateObj in daysInCurrentMonth"
                  :key="dateObj.dateString"
                  class="text-center py-2 rounded cursor-pointer text-sm relative"
                  :class="{
                    'bg-[#f3d7d3] text-[#c67868] font-bold': dateObj.dateString === selectedDate,
                    'bg-gray-100 text-gray-400 cursor-not-allowed': dateObj.isPastDate || !dateObj.isBusinessDay,
                    'hover:bg-[#f9e7e4]': !dateObj.isPastDate && dateObj.isBusinessDay && dateObj.dateString !== selectedDate
                  }"
                  @click="(!dateObj.isPastDate && dateObj.isBusinessDay) && selectDate(dateObj.dateString)"
                >
                  {{ dateObj.day }}
                </div>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-gray-700 mb-2">選擇時間</label>
          <div v-if="isLoadingSlots" class="text-center py-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#c68f84] mx-auto mb-2"></div>
            <p class="text-gray-600 text-sm">載入時段中...</p>
          </div>
          <div v-else-if="availableTimeSlots.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              v-for="timeSlot in availableTimeSlots"
              :key="timeSlot.time"
              type="button"
              class="text-center py-2 px-3 rounded text-sm border border-gray-200"
              :class="{
                'bg-[#f3d7d3] text-[#c67868] font-bold border-[#c67868]': timeSlot.time === selectedTime,
                'hover:bg-[#f9e7e4]': timeSlot.time !== selectedTime
              }"
              @click="selectTime(timeSlot.time)"
            >
              {{ timeSlot.time }}
            </button>
          </div>
          <div v-else-if="selectedDate" class="text-gray-500 text-center py-4">
            此日期沒有可用時段
          </div>
          <div v-else class="text-gray-500 text-center py-4">
            請先選擇日期以查看可用時段
          </div>
        </div>

        <div>
          <label class="block text-gray-700 mb-2">備註（可選）</label>
          <textarea v-model="notes" class="border p-2 w-full rounded-lg" rows="4" placeholder="例如：想做法式、希望偏粉色系..."></textarea>
        </div>

        <div class="flex gap-2">
          <button type="button" @click="$emit('close')" class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
            取消
          </button>
          <button 
            type="submit" 
            class="flex-1 bg-[#c68f84] text-white py-2 rounded-lg hover:bg-[#c67868]" 
            :disabled="!selectedDate || !selectedTime || isLoading"
          >
            {{ isLoading ? '預約中...' : '送出預約' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 預約成功提示 -->
    <div v-if="showSuccess" class="bg-white rounded-xl p-6 max-w-md mx-auto text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-[#c68f84] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <h3 class="text-xl font-bold mb-2">預約成功！</h3>
      <p class="mb-4">您已成功申請預約 {{ artistName }} 的服務，請稍待美甲師確認</p>
      <p class="text-gray-700 mb-4">
        日期：{{ formatDisplayDate(selectedDate) }}<br>
        時間：{{ selectedTime }}<br>
        備註：{{ notes || '無' }}
      </p>
      <button @click="finishBooking" class="px-6 py-2 bg-[#c68f84] text-white rounded hover:bg-[#c67868]">
        確定
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiRequest } from '../config/api.js'

const router = useRouter()
const emit = defineEmits(['close'])
const artistAvailability = ref({})


const props = defineProps({
  artistId: {
    type: String,
    required: true
  },
  hasSchedule: {
    type: Boolean,
    default: null
  }
})

// 狀態管理
const artistName = ref('')
const selectedDate = ref('')
const selectedTime = ref('')
const notes = ref('')
const showSuccess = ref(false)
const isLoading = ref(false)
const isLoadingSlots = ref(false)
const isCheckingSchedule = ref(true)
const hasAvailableSchedule = ref(null) // null=檢查中, true=有時段, false=無時段

// 日曆相關狀態
const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const currentMonthName = computed(() => {
  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  return months[currentMonth.value]
})

// 計算當前月的第一天是星期幾
const firstDayOfMonth = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  return firstDay
})

// 當前月份的天數 - 移除基於 weeklySchedule 的邏輯
const daysInCurrentMonth = computed(() => {
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0) 
  
  const days = []
  const weekdayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    const isPastDate = date < today
    const weekdayName = weekdayMap[date.getDay()]
    const hasAvailableSlots = artistAvailability.value[weekdayName]?.length > 0
    
    days.push({
      date: date,
      dateString: dateString,
      day: i,
      isPastDate: isPastDate,
      isBusinessDay: hasAvailableSlots
    })
  }
  
  return days
})

// 是否可以切換到上個月（不能選擇過去的月份）
const canGoToPrevMonth = computed(() => {
  const today = new Date()
  const prevMonth = new Date(currentYear.value, currentMonth.value - 1)
  return prevMonth.getMonth() >= today.getMonth() || prevMonth.getFullYear() > today.getFullYear()
})

// 是否可以切換到下個月（限制最多只能預約3個月內）
const canGoToNextMonth = computed(() => {
  const today = new Date()
  const nextMonth = new Date(currentYear.value, currentMonth.value + 1)
  const threeMonthsLater = new Date(today.getFullYear(), today.getMonth() + 3)
  return nextMonth < threeMonthsLater
})

// 切換月份
const changeMonth = (delta) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + delta)
  currentDate.value = newDate
  // 切換月份時清空選擇
  selectedDate.value = ''
  selectedTime.value = ''
  availableTimeSlots.value = []
}

// 可用時間段
const availableTimeSlots = ref([])

// 載入美甲師資料
const loadArtistData = async () => {
  try {
    console.log('載入美甲師資料，artistId:', props.artistId)
    
    const [artistResult, availabilityResult] = await Promise.all([
      apiRequest(`/artists/${props.artistId}`),
      apiRequest(`/artists/${props.artistId}/availability`)
    ])
    
    if (artistResult.success) {
      const artistData = artistResult.data.artist
      artistName.value = artistData.studio
      console.log('美甲師資料載入成功:', artistData)
    }

    // 載入 availability 資料用於日曆顯示
    if (availabilityResult.success) {
      const availability = availabilityResult.data?.data?.availability || availabilityResult.data?.availability
      artistAvailability.value = availability || {}
      console.log('📅 載入的 availability:', artistAvailability.value)
    }
  } catch (error) {
    console.error('載入資料錯誤:', error)
    artistName.value = '未知美甲師'
  }
}

// 檢查美甲師是否有設定任何時段
// 簡化的檢查函數
const checkIfHasAnyAvailableSlots = async () => {
  try {
    console.log('🔍 檢查美甲師是否有設定時段...')
    
    // 如果父組件已經傳遞了 hasSchedule，直接使用
    if (props.hasSchedule !== null) {
      console.log('📋 使用父組件傳遞的時段資訊:', props.hasSchedule)
      hasAvailableSchedule.value = props.hasSchedule
      return
    }
    
    // 否則進行 API 檢查（保留原邏輯作為備案）
    const result = await apiRequest(`/artists/${props.artistId}/availability`)
    console.log('📋 Availability API 回應:', result)
    
    if (result.success) {
      const availability = result.data?.data?.availability || result.data?.availability
      console.log('📅 Availability 資料:', availability)
      
      if (availability && typeof availability === 'object') {
        const hasAnyTimeSlots = Object.values(availability).some(daySlots => 
          Array.isArray(daySlots) && daySlots.length > 0
        )
        hasAvailableSchedule.value = hasAnyTimeSlots
      } else {
        hasAvailableSchedule.value = false
      }
    } else {
      hasAvailableSchedule.value = false
    }
  } catch (error) {
    console.error('❌ 檢查時段錯誤:', error)
    hasAvailableSchedule.value = false
  } finally {
    isCheckingSchedule.value = false
  }
}

// 根據選擇的日期更新可用時段
const updateTimeSlotAvailability = async (dateString) => {
  try {
    isLoadingSlots.value = true
    console.log('查詢可用時段:', dateString)
    
    const result = await apiRequest(`/artists/${props.artistId}/slots?date=${dateString}`)
    
    if (result.success) {
      const availableSlots = result.data.availableSlots || []
      console.log('可用時段:', availableSlots)
      
      // 轉換為前端需要的格式
      availableTimeSlots.value = availableSlots.map(time => ({
        time: `${time}-${getEndTime(time)}` // 轉換為 "10:00-12:00" 格式
      }))
    } else {
      console.error('載入時段失敗:', result.error)
      availableTimeSlots.value = []
    }
  } catch (error) {
    console.error('載入時段錯誤:', error)
    availableTimeSlots.value = []
  } finally {
    isLoadingSlots.value = false
  }
}

// 輔助函數 - 計算結束時間
const getEndTime = (startTime) => {
  const [hours, minutes] = startTime.split(':').map(Number)
  const endHours = hours + 2 // 假設每個時段2小時
  return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// 選擇日期
const selectDate = (dateString) => {
  selectedDate.value = dateString
  selectedTime.value = '' // 重置時間選擇
  updateTimeSlotAvailability(dateString)
}

// 選擇時間
const selectTime = (time) => {
  selectedTime.value = time
}

// 格式化日期顯示
const formatDisplayDate = (dateString) => {
  if (!dateString) return ''
  
  const [year, month, day] = dateString.split('-')
  return `${year}/${month}/${day}`
}

// 提交預約
const submitBooking = async () => {
  if (!selectedDate.value || !selectedTime.value) {
    alert('請選擇日期和時間')
    return
  }

  try {
    isLoading.value = true
    
    // 獲取當前登入的顧客 ID
    const customerId = localStorage.getItem('userId')
    if (!customerId) {
      alert('請先登入')
      router.push('/login')
      return
    }
    
    // 從時間格式中提取開始時間 "10:00-12:00" -> "10:00"
    const startTime = selectedTime.value.split('-')[0]
    
    const bookingData = {
      customerId: customerId,
      artistId: props.artistId,
      date: selectedDate.value,
      time: startTime,
      note: notes.value || ''
    }
    
    console.log('提交預約資料:', bookingData)
    
    const result = await apiRequest('/reservations/book', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    })
    
    if (result.success) {
      console.log('預約成功:', result)
      showSuccess.value = true
    } else {
      console.error('預約失敗:', result.error)
      alert(`預約失敗：${result.error}`)
    }
  } catch (error) {
    console.error('預約錯誤:', error)
    alert('預約時發生錯誤，請稍後再試')
  } finally {
    isLoading.value = false
  }
}

const finishBooking = () => {
  // 關閉成功提示並通知關閉彈窗/側邊欄
  showSuccess.value = false
  emit('close')
}

onMounted(async () => {
  console.log('🚀 Booking 組件載入，hasSchedule prop:', props.hasSchedule)
  
  // 同時載入美甲師資料和檢查時段
  await Promise.all([
    loadArtistData(),
    checkIfHasAnyAvailableSlots()
  ])
  
  // 設置當前日期為今天
  currentDate.value = new Date()
})

</script>

<style scoped>
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.date-selector {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 日期選擇樣式 */
.date-selector .grid > div {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 時間選擇樣式 */
.time-selector button {
  transition: all 0.2s ease;
}
</style>