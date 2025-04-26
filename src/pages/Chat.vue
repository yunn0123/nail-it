<template>
  <div class="flex h-[calc(100vh-80px)]">
    <!-- 左側聊天對象列表 -->
    <div class="w-1/3 border-r overflow-y-auto p-4">
      <h2 class="text-xl font-bold mb-4">聊天對象</h2>
      <ul>
        <li v-for="(contact, index) in contacts" :key="index" @click="selectContact(contact)"
            :class="['p-3 rounded-lg cursor-pointer', selectedContact.name === contact.name ? 'bg-pink-200' : 'hover:bg-pink-100']">
          {{ contact.name }}
        </li>
      </ul>
    </div>

    <!-- 右側聊天視窗 -->
    <div class="flex-1 flex flex-col p-4">
      <div class="flex-1 overflow-y-auto mb-4">
        <div v-if="selectedContact.name">
          <h2 class="text-2xl font-bold mb-4">{{ selectedContact.name }}</h2>

          <div v-for="(message, index) in selectedContact.messages" :key="index" class="mb-2">
            <div :class="message.from === 'me' ? 'text-right' : 'text-left'">
              <span class="inline-block px-3 py-2 rounded-lg"
                    :class="message.from === 'me' ? 'bg-pink-500 text-white' : 'bg-gray-200'">
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
        <button @click="sendMessage" class="bg-pink-500 text-white px-4 rounded-r-lg hover:bg-pink-600">
          發送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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

const selectContact = (contact) => {
  selectedContact.value = contact
}

const sendMessage = () => {
  if (newMessage.value.trim() !== '') {
    selectedContact.value.messages.push({ from: 'me', text: newMessage.value })
    newMessage.value = ''
  }
}
</script>
