<template>
  <div class="flex h-screen">
    <!-- 左側聊天對象列表 -->
    <div class="w-1/3 border-r overflow-y-auto p-4 custom-scrollbar">
      <h2 class="text-2xl text-[#c67868] font-bold mb-4">聊聊</h2>
      <ul>
        <li v-for="(contact, index) in contacts" :key="index" @click="selectContact(contact)"
          :class="['p-3 rounded-lg cursor-pointer text-gray-700', 
                selectedContact.name === contact.name ? 
                'bg-[#e0b3a9] font-semibold text-gray-700' : 
                'hover:bg-[#f4e8e6] text-gray-700']">
          {{ contact.name }}
        </li>
      </ul>
    </div>

    <!-- 右側聊天視窗 -->
    <div class="flex-1 flex flex-col bg-[#efddda] p-4">
      <!-- 固定在上方的聊天對象名稱 -->
      <div v-if="selectedContact.name" class="border-b border-white pb-2 mb-4">
        <h2 class="text-2xl text-gray-700 font-bold">{{ selectedContact.name }}</h2>
      </div>
      
      <!-- 可滾動的聊天訊息區域 -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto mb-4 custom-scrollbar">
        <div v-if="selectedContact.name">
          <div v-for="(message, index) in selectedContact.messages" :key="index" class="mb-2">
            <div :class="message.from === 'me' ? 'text-right' : 'text-left'">
              <span class="inline-block px-3 py-2 rounded-lg"
                    :class="message.from === 'me' ? 'bg-[#c68f84] text-white' : 'bg-white text-gray-700'">
                {{ message.text }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-400">請選擇聊天對象</div>
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
import { ref, nextTick, watch } from 'vue'

// 聊天容器元素引用
const chatContainer = ref(null)

// 聊天對象列表
const contacts = ref([
  {
    name: '小美',
    messages: [
      { from: 'me', text: '你好，請問有空檔嗎？' },
      { from: '她', text: '哈囉～可以喔！' }
    ]
  },
  {
    name: 'Grace Nails',
    messages: [
      { from: '她', text: '有什麼需要幫忙的嗎？' }
    ]
  }
])

const selectedContact = ref({})
const newMessage = ref('')

// 滾動到底部的函數
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const selectContact = (contact) => {
  selectedContact.value = contact
  // 切換聊天對象時也滾動到底部
  nextTick(() => {
    scrollToBottom()
  })
}

const sendMessage = async () => {
  if (newMessage.value.trim() !== '') {
    selectedContact.value.messages.push({ from: 'me', text: newMessage.value })
    newMessage.value = ''

    // 使用 Vue 的 nextTick 確保 DOM 更新完成後滾動
    await nextTick()
    scrollToBottom()
  }
}

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
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.custom-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
</style>