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

</style><template>
  <div class="p-4">
    <!-- 只在未顯示成功提示時顯示預約表單 -->
    <div v-if="!showSuccess">
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
                  'bg-gray-100 text-gray-400 cursor-not-allowed': !dateObj.available,
                  'hover:bg-[#f9e7e4]': dateObj.available && dateObj.dateString !== selectedDate,
                  'opacity-50': dateObj.isPastDate
                }"
                @click="!dateObj.isPastDate && dateObj.available && selectDate(dateObj.dateString)"
              >
                {{ dateObj.day }}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-gray-700 mb-2">選擇時間</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              v-for="timeSlot in availableTimeSlots"
              :key="timeSlot.time"
              type="button"
              class="text-center py-2 px-3 rounded text-sm border border-gray-200"
              :class="{
                'bg-[#f3d7d3] text-[#c67868] font-bold border-[#c67868]': timeSlot.time === selectedTime,
                'bg-gray-100 text-gray-400 cursor-not-allowed': !timeSlot.available,
                'hover:bg-[#f9e7e4]': timeSlot.available && timeSlot.time !== selectedTime
              }"
              :disabled="!timeSlot.available"
              @click="timeSlot.available && selectTime(timeSlot.time)"
            >
              {{ timeSlot.time }}
            </button>
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
          <button type="submit" class="flex-1 bg-[#c68f84] text-white py-2 rounded-lg hover:bg-[#c67868]" :disabled="!selectedDate || !selectedTime">
            送出預約
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
      <p class="mb-4">您已成功預約 {{ artistName }} 的服務</p>
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

const router = useRouter()
const emit = defineEmits(['close'])

// 接收 artist-id 
const props = defineProps({
  artistId: {
    type: String,
    required: true
  }
})

const artistName = ref('')
const selectedDate = ref('')
const selectedTime = ref('')
const notes = ref('')
const showSuccess = ref(false)

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

// 當前月份的天數
const daysInCurrentMonth = computed(() => {
  // 獲取當前月份的天數
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0) 
  
  const days = []
  
  // 模擬不可預約的日期
  const unavailableDates = [
    // 每週日和特定日期
    0, // 星期日
    // 其他特定日期
    5, 12, 13, 20, 27
  ]
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    // 檢查是否是不可預約日期
    const dayOfWeek = date.getDay()
    const isUnavailable = unavailableDates.includes(dayOfWeek) || unavailableDates.includes(i)
    
    // 檢查是否是過去的日期
    const isPastDate = date < today
    
    days.push({
      date: date,
      dateString: dateString,
      day: i,
      available: !isUnavailable && !isPastDate,
      isPastDate: isPastDate
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
}

// 獲取美甲師的可用時間段(假資料)
const availableTimeSlots = ref([
  { time: '10:00 - 12:00', available: true },
  { time: '12:00 - 14:00', available: true },
  { time: '14:00 - 16:00', available: true },
  { time: '16:00 - 18:00', available: true },
  { time: '18:00 - 20:00', available: true }
])

// 設置時段可用性，模擬根據選擇的日期不同時段的可用性
const updateTimeSlotAvailability = (dateString) => {
  // 根據具體日期調整時段的可用性
  const dateObj = new Date(dateString)
  const dayOfWeek = dateObj.getDay() // 0是週日，6是週六
  const day = dateObj.getDate()
  
  // 重置所有時段為可用
  availableTimeSlots.value.forEach(slot => {
    slot.available = true
  })
  
  // 根據星期幾設置不同的可用性
  if (dayOfWeek === 1) { // 週一
    availableTimeSlots.value[0].available = false // 10:00-12:00不可用
  } else if (dayOfWeek === 3) { // 週三
    availableTimeSlots.value[2].available = false // 14:00-16:00不可用
    availableTimeSlots.value[3].available = false // 16:00-18:00不可用
  } else if (dayOfWeek === 5) { // 週五
    availableTimeSlots.value[4].available = false // 18:00-20:00不可用
  } else if (dayOfWeek === 6) { // 週六
    // 周六全部可預約
  }
  
  // 模擬特定日期的特殊安排
  if (day % 5 === 0) { // 每個月5、10、15、20、25、30號
    availableTimeSlots.value[1].available = false // 12:00-14:00不可用
  }
  
  // 模擬一些隨機的已約滿時段
  if (day % 7 === 0) {
    availableTimeSlots.value[2].available = false
  }
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

onMounted(() => {
  // 根據傳入的 Id 設置美甲師名稱
  if (props.artistId === '1') {
    artistName.value = 'waka.nail'
  } else if (props.artistId === '2') {
    artistName.value = 'jolieee_nail'
  } else if (props.artistId === '3') {
    artistName.value = '61.nail'
  } else {
    artistName.value = '未知美甲師'
  }
  
  // 設置當前日期為今天
  currentDate.value = new Date()
})

const submitBooking = () => {
  if (selectedDate.value && selectedTime.value) {
    // 顯示預約成功提示
    showSuccess.value = true
  }
}

const finishBooking = () => {
  // 關閉成功提示並通知關閉彈窗/側邊欄
  showSuccess.value = false
  emit('close')
}
</script>

<style scoped>
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>