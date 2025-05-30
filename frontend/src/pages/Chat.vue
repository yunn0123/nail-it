<!-- Chat.vue -->
<template>
  <div class="flex h-screen">
    <!-- 左側聊天對象列表 -->
    <div class="w-1/3 border-r overflow-y-auto p-4 custom-scrollbar bg-white">
      <div class="flex items-center mb-4">
        <!-- 返回按鈕 -->
        <button @click="goBack" class="text-gray-500 hover:text-[#c67868] mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 class="text-2xl text-[#c67868] font-bold">聊聊</h2>
      </div>
      <ul>
        <li v-for="contact in sortedContacts" :key="contact.id" @click="selectContact(contact)"
          :class="['p-3 rounded-lg cursor-pointer text-gray-700 flex items-center', 
                selectedContact.name === contact.name ? 
                'bg-[#e0b3a9]' : 
                'hover:bg-[#f4e8e6]']">
          <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3 overflow-hidden border border-[#f4e8e6]">
            <img v-if="contact.image" :src="contact.image" alt="" class="w-full h-full object-cover">
            <div v-else class="w-full h-full bg-[#f4e8e6] flex items-center justify-center">
              <span class="text-[#c68f84] font-semibold">{{ contact.name.charAt(0).toUpperCase() }}</span>
            </div>
          </div>
          <div class="flex-1">
            <!-- 名字 -->
            <div :class="{'font-semibold': selectedContact.name === contact.name, 'font-normal': selectedContact.name !== contact.name}">
              {{ contact.name }}
            </div>
            <!-- 訊息 -->
            <div v-if="contact.messages.length > 0" class="text-xs text-gray-500 truncate font-normal">
              {{ contact.messages[contact.messages.length - 1].text }}
            </div>
          </div>
          <!-- 日期 -->
          <div v-if="contact.messages.length > 0" class="text-xs text-gray-500 ml-2 font-normal">
            {{ formatShortTime(contact.messages[contact.messages.length - 1].time) }}
          </div>
        </li>
      </ul>
    </div>

    <!-- 右側聊天視窗 -->
    <div class="flex-1 flex flex-col bg-[#efddda] p-4">
      <!-- 固定在上方的聊天對象名稱 -->
      <div v-if="selectedContact.name" class="border-b border-white pb-3 mb-4">
        <h2 class="text-2xl text-gray-700 font-bold">{{ selectedContact.name }}</h2>
      </div>
      
      <!-- 可滾動的聊天訊息區域 -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto mb-4 custom-scrollbar">
        <div v-if="selectedContact.name">
          <!-- 依據日期分組顯示消息 -->
          <template v-for="(group, groupIndex) in groupedMessages" :key="groupIndex">
            <!-- 日期分隔線 -->
            <div class="text-center my-3">
              <span class="bg-[#e0b3a9] text-white text-xs px-2 py-1 rounded-full">
                {{ formatMessageDate(group.date) }}
              </span>
            </div>
            
            <!-- 該日期的消息 -->
            <div v-for="(message, msgIndex) in group.messages" :key="`${groupIndex}-${msgIndex}`" class="mb-2">
              <div :class="message.from === 'me' ? 'text-right' : 'text-left'">
                <span class="inline-block px-3 py-2 rounded-lg"
                      :class="message.from === 'me' ? 'bg-[#c68f84] text-white' : 'bg-white text-gray-700'">
                  {{ message.text }}
                </span>
                <div class="text-xs text-gray-500 mt-1">{{ formatTime(message.time || new Date()) }}</div>
              </div>
            </div>
          </template>
        </div>
        <div v-else class="flex flex-col items-center justify-center h-full text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          請選擇聊天對象或開始新的對話
        </div>
      </div>

      <div v-if="selectedContact.name" class="flex">
        <input v-model="newMessage" type="text" placeholder="輸入訊息"
               class="flex-1 border rounded-l-lg p-2" @keyup.enter="sendMessage" />
        <button @click="sendMessage" class="bg-[#c68f84] text-white px-4 rounded-r-lg hover:bg-[#c67868]">
          發送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'


const route = useRoute()
const router = useRouter()

const chatContainer = ref(null)

// 聊天對象列表(假資料)

import work1 from '../assets/temp/work1.jpg'
import design2 from '../assets/temp/design2.jpg'
import design3 from '../assets/temp/design3.jpg'

const contacts = ref([
  {
    id: '1',
    name: 'waka.nail',
    type: 'artist', // 添加類型標識
    image: work1, // 直接使用導入的圖片
    createdAt: new Date('2025-01-01'),
    messages: [
      { from: 'me', text: '你好，請問有空檔嗎？', time: new Date(2024, 3, 20, 14, 30) },
      { from: '她', text: '哈囉～可以喔！', time: new Date(2024, 3, 20, 14, 32) },
      { from: 'me', text: '那我要預約下週的服務', time: new Date(2024, 3, 20, 14, 35) },
      { from: '她', text: '可以哦！', time: new Date(2024, 3, 20, 14, 40) },
      { from: 'me', text: '謝謝，下週見！', time: new Date(2024, 3, 20, 14, 42) },
      { from: 'me', text: '不好意思，我想確認一下預約的時間', time: new Date(2024, 4, 13, 10, 15) },
      { from: '她', text: '您好，您的預約是明天下午三點。', time: new Date(2024, 4, 13, 10, 20) },
      { from: 'me', text: '好的，明天見！', time: new Date(2024, 4, 14, 9, 30) }
    ]
  },
  {
    id: '2',
    name: 'jolieee_nail',
    type: 'artist', // 美甲師
    image: design2, // 直接使用導入的圖片
    createdAt: new Date('2025-05-02'),
    messages: [
      { from: '她', text: '有什麼需要幫忙的嗎？', time: new Date(2024, 4, 9, 10, 15) }
    ]
  },
  {
    id: '3',
    name: '61.nail',
    type: 'artist', // 美甲師
    image: design3, // 直接使用導入的圖片
    createdAt: new Date('2024-04-03'),
    messages: []
  }
])

// 根據最近消息時間排序的聯絡人列表
const sortedContacts = computed(() => {
  return [...contacts.value].sort((a, b) => {
    // 獲取最近一條消息的時間
    const aLastMessage = a.messages.length > 0 ? a.messages[a.messages.length - 1].time : a.createdAt;
    const bLastMessage = b.messages.length > 0 ? b.messages[b.messages.length - 1].time : b.createdAt;
    
    // 按時間降序排列（最新的在前）
    return bLastMessage - aLastMessage;
  });
});

const selectedContact = ref({})
const newMessage = ref('')

// 格式化時間的函數 (HH:MM)
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 將消息按日期分組
const groupedMessages = computed(() => {
  if (!selectedContact.value || !selectedContact.value.messages) {
    return [];
  }
  
  const groups = [];
  const messagesByDate = {};
  
  // 將消息按日期分組
  selectedContact.value.messages.forEach(message => {
    const date = new Date(message.time);
    const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    
    if (!messagesByDate[dateString]) {
      messagesByDate[dateString] = {
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        messages: []
      };
    }
    
    messagesByDate[dateString].messages.push(message);
  });
  
  // 轉換為數組並按日期排序
  Object.values(messagesByDate).forEach(group => {
    groups.push(group);
  });
  
  // 按日期升序排序
  return groups.sort((a, b) => a.date - b.date);
});

// 格式化消息分組日期的函數
const formatMessageDate = (date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // 今天
  if (date.getTime() === today.getTime()) {
    return '今天';
  }
  
  // 昨天
  if (date.getTime() === yesterday.getTime()) {
    return '昨天';
  }
  
  // 本週內
  const weekDay = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  const dayDiff = Math.floor((today - date) / (24 * 60 * 60 * 1000));
  if (dayDiff < 7) {
    return weekDay[date.getDay()];
  }
  
  // 本年內
  if (date.getFullYear() === now.getFullYear()) {
    return `${(date.getMonth() + 1)}月${date.getDate()}日`;
  }
  
  // 其他年份
  return `${date.getFullYear()}年${(date.getMonth() + 1)}月${date.getDate()}日`;
};

// 格式化簡短時間的函數（今天顯示時間，其他顯示日期）
const formatShortTime = (date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // 如果是今天的消息
  if (messageDate.getTime() === today.getTime()) {
    return formatTime(date);
  }
  
  // 如果是昨天的消息
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (messageDate.getTime() === yesterday.getTime()) {
    return '昨天';
  }
  
  // 如果是今年的消息
  if (date.getFullYear() === now.getFullYear()) {
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  }
  
  // 其他情況
  return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
};

// 滾動到底部
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// 返回上一頁
const goBack = () => {
  router.back()
}

const selectContact = (contact) => {
  console.log('Selecting contact:', contact.name, contact.id)
  selectedContact.value = contact
  // 切換聊天對象時也滾動到底部
  nextTick(() => {
    scrollToBottom()
  })
}

const sendMessage = async () => {
  if (newMessage.value.trim() !== '') {
    const currentTime = new Date();
    
    selectedContact.value.messages.push({
      from: 'me',
      text: newMessage.value,
      time: currentTime
    })
    newMessage.value = ''

    await nextTick()
    scrollToBottom()
    
    // 只有美甲師才會自動回覆，顧客不會
    if (selectedContact.value.type === 'artist') {
      setTimeout(() => {
        selectedContact.value.messages.push({
          from: '她',
          text: '收到您的訊息，我會盡快回覆！',
          time: new Date()
        })
        
        nextTick(() => {
          scrollToBottom()
        })
      }, 1000)
    }
  }
}


onMounted(() => {
  // 移除原來的動態導入代碼，因為我們已經在上面直接設置了
  
  // 檢查 URL 查詢參數
  const artistId = route.query.artistId
  const artistName = route.query.artistName
  const artistImage = route.query.artistImage
  
  if (artistId && artistName) {
    console.log('Received contact info:', artistId, artistName)
    
    // 檢查聯絡人列表中是否已存在該聯絡人
    let existingContact = contacts.value.find(contact => contact.id === artistId)
    
    if (existingContact) {
      // 如果已存在，選擇該聯絡人
      console.log('Found existing contact:', existingContact.name)
      selectContact(existingContact)
    } else {
      // 如果不存在，創建新的聯絡人並添加到列表
      console.log('Creating new contact for:', artistName)
      
      // 判斷這是美甲師還是顧客
      // 如果是從 Profile 預約管理來的，則是顧客
      const isCustomer = route.query.fromBooking === 'true' || 
                        !contacts.value.some(c => c.id === artistId && c.type === 'artist')
      
      let contactImage = null
      if (artistImage && artistImage !== 'null') {
        contactImage = artistImage
      }
      
      const newContact = {
        id: artistId,
        name: artistName,
        type: isCustomer ? 'customer' : 'artist', // 設置類型
        image: contactImage,
        messages: []
      }
      
      // 添加到聯絡人列表最前面
      contacts.value.unshift(newContact)
      
      // 選擇這個新聯絡人
      selectContact(newContact)
      
      // 只有美甲師才自動發送歡迎訊息
      if (newContact.type === 'artist') {
        setTimeout(() => {
          newContact.messages.push({
            from: '她',
            text: `您好！我是${artistName}，很高興為您服務。請問有什麼可以幫助您的嗎？`,
            time: new Date()
          })
          nextTick(() => {
            scrollToBottom()
          })
        }, 500)
      }
    }
  } else {
    // 如果沒有特定聯絡人，預設選擇第一個聯絡人（如果有的話）
    if (contacts.value.length > 0) {
      selectContact(contacts.value[0])
    }
  }
})


// 監聽 selectedContact.messages 的變化
watch(() => selectedContact.value.messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })
</script>

<style>
/* 隱藏滾動軸但保持滾動功能 */
.custom-scrollbar {
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none; 
}

.custom-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>