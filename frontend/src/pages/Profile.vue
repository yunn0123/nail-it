<!-- Profile.vue -->
<template>
  <!-- 載入狀態 -->
<div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-[#efddda]">
  <div class="text-center">
    <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-[#c68f84] mx-auto"></div>
    <p class="mt-4 text-gray-600">載入中...</p>
  </div>
</div>

  <div v-else class="min-h-screen flex flex-col bg-[#efddda]" @click="closeMenu">
    <!-- Navbar -->
    <div class="flex items-center justify-between bg-[#efddda] p-3 mx-4">
      <!-- 左側：Logo 和漢堡選單 -->
      <div class="flex items-center">
          <button @click.stop="toggleMenu" class="text-[#c68f84] text-5xl">&#9776;</button>
          <img 
            src="../assets/logo.png" 
            alt="Logo" 
            class="w-60 h-auto cursor-pointer" 
            @click="router.push('/home')" 
          />
        </div>

      <!-- 假搜尋欄，但其實是 router link -->
      <div 
        @click="router.push('/search')" 
        class="w-2/3 cursor-pointer bg-white rounded-lg py-2 px-4 text-gray-400 shadow-sm border hover:shadow transition"
      >
        搜尋美甲師或作品...
      </div>

      <!-- 右側：點擊回到自己的 profile -->
      <div 
        @click="goToSelfProfile" 
        class="w-10 h-10 bg-[#c68f84] rounded-full cursor-pointer hover:bg-[#c67868] transition-colors"
      ></div>
      </div>

    <!-- 左側選單 -->
    <div v-if="showMenu" class="fixed top-7 left-0 w-48 h-auto bg-white shadow-lg p-6 z-50" @click.stop>
      <ul class="space-y-4">
        <li><a @click="goToSelfProfile" class="hover:text-[#c68f84] cursor-pointer">個人檔案</a></li>
        <li><router-link to="/chat" class="hover:text-[#c68f84]">聊聊</router-link></li>
        <li><router-link to="/appointments" class="hover:text-[#c68f84]">預約紀錄</router-link></li>
        <li><router-link to="/reviews" class="hover:text-[#c68f84]">評分紀錄</router-link></li>
        <li><router-link to="/settings" class="hover:text-[#c68f84]">隱私設定</router-link></li>
        <li><a @click="handleLogout" class="hover:text-[#c68f84] cursor-pointer">登出</a></li>
      </ul>
    </div>

    <!-- 預覽模式通知條 - 固定在頂部 -->
    <div v-if="isPreviewMode" class="fixed top-3 left-1 right-1 bg-white/80 shadow-md shadow-gray-200 border-l-4 border-[#c68f84] p-4 z-50">
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c68f84] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span class="text-[#c68f84] font-medium">預覽模式：您正在查看顧客視角的頁面樣貌</span>
        </div>
        <button 
          @click="togglePreviewMode"
          class="text-[#c68f84] hover:text-[#c68f84]/80 font-medium transition-colors"
        >
          關閉預覽
        </button>
      </div>
    </div>


    <!-- 浮動大綱按鈕 - 僅在非預覽模式且為自己檔案時顯示 -->
    <div 
      v-if="isOwnProfile && !isPreviewMode"
      class="fixed bottom-6 right-6 z-50"
      @click.stop
    >
      <!-- 大綱小浮窗 -->
      <div 
        v-if="showOutline"
        class="absolute bottom-16 right-0 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 space-y-2 max-h-96 overflow-y-auto transform transition-all duration-200 origin-bottom-right"
        @click.stop
      >
        <!-- 小浮窗標題 -->
        <div class="flex items-center justify-between pb-2 border-b border-gray-200 mb-3">
          <h3 class="text-sm font-semibold text-[#c67868] flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          大綱  
          </h3>
        </div>

        <!-- 大綱內容 -->
        <div class="space-y-1">
          <!-- 基本資訊 -->
          <div 
            @click="scrollToSection('basic-info')" 
            :class="['flex items-center py-2 px-2 rounded-lg cursor-pointer transition-colors text-sm', 
                    activeSection === 'basic-info' ? 'bg-[#f4e8e6] text-[#c67868] font-medium' : 'hover:bg-gray-50 text-gray-700']"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-2 text-[#c68f84]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            基本資訊
          </div>

          <!-- 預約管理 -->
          <div v-if="!isPreviewMode">
            <div 
              @click="scrollToSection('appointment-management')" 
              :class="['flex items-center py-2 px-2 rounded-lg cursor-pointer transition-colors text-sm', 
                      activeSection === 'appointment-management' ? 'bg-[#f4e8e6] text-[#c67868] font-medium' : 'hover:bg-gray-50 text-gray-700']"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-2 text-[#c68f84]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              預約管理
            </div>
          </div>

          <!-- 時段管理 -->
          <div 
            v-if="!isPreviewMode"
            @click="scrollToSection('schedule-management')" 
            :class="['flex items-center py-2 px-2 rounded-lg cursor-pointer transition-colors text-sm', 
                    activeSection === 'schedule-management' ? 'bg-[#f4e8e6] text-[#c67868] font-medium' : 'hover:bg-gray-50 text-gray-700']"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-2 text-[#c68f84]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            營業時段管理
          </div>

          <!-- 作品牆 -->
          <div 
            @click="scrollToSection('portfolio')" 
            :class="['flex items-center py-2 px-2 rounded-lg cursor-pointer transition-colors text-sm', 
                    activeSection === 'portfolio' ? 'bg-[#f4e8e6] text-[#c67868] font-medium' : 'hover:bg-gray-50 text-gray-700']"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-2 text-[#c68f84]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            作品牆
          </div>

          <!-- 顧客評價 -->
          <div 
            @click="scrollToSection('reviews')" 
            :class="['flex items-center py-2 px-2 rounded-lg cursor-pointer transition-colors text-sm', 
                    activeSection === 'reviews' ? 'bg-[#f4e8e6] text-[#c67868] font-medium' : 'hover:bg-gray-50 text-gray-700']"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-2 text-[#c68f84]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            顧客評價
          </div>
        </div>
      </div>

      <!-- 浮動圓形按鈕 -->
      <button 
        @click="toggleOutline" 
        :class="['w-14 h-14 bg-white rounded-full shadow-lg hover:bg-[#f4e8e6] transition-all duration-200 flex items-center justify-center group', 
                showOutline ? 'rotate-45' : 'hover:scale-110']"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#c68f84] transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </button>
    </div>

    <div class="p-6 mx-5 mr-8">
      <div id="basic-info" class="flex flex-col md:flex-row md:items-center mb-8">
        
        <!-- 頭像 -->
        <div class="avatar-container w-32 h-32 rounded-full mb-4 md:mb-0 md:mr-6 overflow-hidden relative" style="background-color: #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <img 
            :src="currentArtist.image" 
            alt="" 
            class="w-full h-full object-cover" 
            @error="handleImageError"
            v-show="!showFallback"
          />
          <!-- 默認頭像 -->
          <div v-if="showFallback" class="absolute inset-0 flex items-center justify-center">
            <svg width="100" height="100" viewBox="0 0 100 100" class="w-30 h-30" fill="none" stroke="#c68f84" stroke-width="4">
              <circle cx="50" cy="35" r="15" />
              <path d="M20,85 C20,60 80,60 80,85" />
            </svg>
          </div>
          <!-- 編輯模式下的頭像上傳按鈕 - 只在編輯模式且非預覽模式顯示 -->
          <div v-if="editMode && !isPreviewMode" class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer" @click="triggerImageUpload">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <input ref="imageInput" type="file" accept="image/*" @change="handleImageUpload" class="hidden" />
        </div>
        
        <div class="flex-1">
          <!-- 工作室名稱 -->
          <div v-if="!editMode || isPreviewMode">
            <h2 class="text-3xl text-gray-700 font-bold">{{ currentArtist.studio }}</h2>
          </div>
          <div v-else class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">工作室名稱</label>
            <input 
              v-model="editData.studio" 
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c68f84] focus:border-transparent"
              placeholder="請輸入工作室名稱"
            />
          </div>

          <!-- 評分 (不可編輯) -->
          <p class="text-gray-700 mt-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c68f84] mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            {{ currentArtist.rating }}
          </p>
          
          <!-- 地址 -->
          <div v-if="!editMode || isPreviewMode">
            <p class="text-gray-700 mt-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c68f84] mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>      
              {{ currentArtist.city }} {{ currentArtist.district }}
            </p>
          </div>
          <div v-else class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">地址</label>
            <!-- 縣市選擇 -->
            <div class="mb-2">
              <select v-model="editData.city" @change="updateDistricts" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c68f84] focus:border-transparent">
                <option value="">請選擇縣市</option>
                <option v-for="(city, index) in cities" :key="index" :value="city.name">{{ city.name }}</option>
              </select>
            </div>
            <!-- 區域選擇 -->
            <div v-if="editData.city">
              <select v-model="editData.district" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c68f84] focus:border-transparent">
                <option value="">請選擇區域</option>
                <option v-for="(district, index) in districts" :key="index" :value="district">{{ district }}</option>
              </select>
            </div>
          </div>

          <!-- 價格 -->
          <div v-if="!editMode || isPreviewMode">
            <p class="text-gray-700 mt-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c68f84] mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ${{ currentArtist.priceLow }} - ${{ currentArtist.priceHigh }}
            </p>
          </div>
          <div v-else class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">價格區間</label>
            <div class="flex items-center space-x-2">
              <input 
                v-model.number="editData.priceLow" 
                type="number"
                class="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c68f84] focus:border-transparent"
                placeholder="最低價格"
              />
              <span class="text-gray-500">-</span>
              <input 
                v-model.number="editData.priceHigh" 
                type="number"
                class="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c68f84] focus:border-transparent"
                placeholder="最高價格"
              />
            </div>
          </div>

          <!-- 簡介 -->
          <div v-if="!editMode || isPreviewMode">
            <p class="text-gray-700 mt-2 flex items-start">
              {{ currentArtist.bio }}
            </p>
          </div>
          <div v-else class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">個人簡介</label>
            <textarea 
              v-model="editData.bio" 
              rows="3"
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c68f84] focus:border-transparent"
              placeholder="介紹一下您的專長和特色..."
            ></textarea>
          </div>

          <!-- 擅長風格標籤 -->
          <div v-if="!editMode || isPreviewMode">
            <p class="text-gray-500 text-sm mt-2">
              <span v-for="(style, index) in currentArtist.styles" :key="index" class="mr-2">
                #{{ style }}
              </span>
            </p>
          </div>
          <div v-else class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">擅長風格</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span 
                v-for="(style, index) in editData.styles" 
                :key="index" 
                class="bg-[#c68f84] text-white text-sm py-1 px-3 rounded-full flex items-center"
              >
                {{ style }}
                <button 
                  @click="removeStyle(index)" 
                  class="ml-2 text-white hover:text-red-200"
                >
                  ×
                </button>
              </span>
            </div>
            <div class="flex space-x-2">
              <input 
                v-model="newStyle" 
                @keyup.enter="addStyle"
                class="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c68f84] focus:border-transparent"
                placeholder="新增風格標籤"
              />
              <button 
                @click="addStyle"
                class="px-4 py-2 bg-[#c68f84] text-white rounded-lg hover:bg-[#c67868]"
              >
                新增
              </button>
            </div>
          </div>

          <!-- 編輯按鈕群組 -->
          <div class="mt-4 flex space-x-3">
            <!-- 只有在查看自己的檔案且非預覽模式時才顯示編輯按鈕 -->
            <div v-if="!editMode && isOwnProfile && !isPreviewMode" class="flex space-x-3">
              <button @click="startEdit" class="bg-[#c68f84] text-white px-4 py-2 rounded-lg hover:bg-[#c67868]">編輯資料</button>
              <button 
                @click="togglePreviewMode"
                class="bg-white border border-[#c68f84] text-[#c68f84] px-4 py-2 rounded-lg hover:shadow-lg transition-shadow flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                預覽顧客視角
              </button>
            </div>
            <!-- 預覽模式下顯示顧客會看到的按鈕 -->
            <div v-if="isPreviewMode" class="flex space-x-3">
              <button @click="openBookingModal" class="bg-[#c68f84] text-white px-4 py-2 rounded-lg hover:bg-[#c67868]">預約</button>
              <button @click="navigateToChat" class="bg-white border border-[#c68f84] text-[#c68f84] px-4 py-2 rounded-lg hover:border-[#c67868] hover:text-[#c67868] hover:font-semibold">
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  聊聊
                </span>
              </button>
            </div>
            <!-- 如果不是自己的檔案且非預覽模式，顯示預約和聊聊按鈕 -->
            <div v-if="!editMode && !isOwnProfile && !isPreviewMode" class="flex space-x-3">
              <button @click="openBookingModal" class="bg-[#c68f84] text-white px-4 py-2 rounded-lg hover:bg-[#c67868]">預約</button>
              <button @click="navigateToChat" class="bg-white border border-[#c68f84] text-[#c68f84] px-4 py-2 rounded-lg hover:shadow-lg transition-shadow">
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  聊聊
                </span>
              </button>
            </div>
            <!-- 編輯模式下的按鈕 -->
            <div v-if="editMode && !isPreviewMode" class="flex space-x-3">
              <button @click="saveChanges" class="bg-[#c68f84] text-white px-4 py-2 rounded-lg hover:bg-[#c67868]">儲存</button>
              <button @click="cancelEdit" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">取消</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 預約管理 - 只有在自己的檔案且非預覽模式才顯示 -->
      <div v-if="isOwnProfile && !isPreviewMode" id="appointment-management" class="mb-8">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center">
            <h3 class="text-2xl text-gray-700 mr-2">預約管理</h3>
            <img src="../assets/flower.png" alt="Flower" class="w-10 h-auto" /> 
          </div>
          <!-- 篩選 -->
          <div class="flex items-center">
            <span class="text-sm text-gray-700 mr-2">狀態：</span>
            <select v-model="appointmentFilter" class="py-1 px-2 rounded-md border text-sm bg-white">
              <option value="all">全部</option>
              <option value="pending">待確認</option>
              <option value="confirmed">已確認</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
        </div>

        <!-- 待確認預約 -->
        <div v-if="filteredAppointments.pending.length > 0" class="mb-4">
          <h4 class="text-lg font-medium text-[#c67868] mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#c67868]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            待確認的預約
          </h4>

          <div class="space-y-3">
            <div 
              v-for="appointment in filteredAppointments.pending" 
              :key="appointment.id" 
              class="bg-white rounded-xl p-4 shadow flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div class="flex items-center space-x-4">
                <!-- 顧客頭像 -->
                <div class="avatar-container w-12 h-12 rounded-full overflow-hidden relative" style="background-color: #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                  <img 
                    :src="appointment.customerImage" 
                    alt="" 
                    class="w-full h-full object-cover" 
                    @error="appointment.showFallback = true"
                    v-show="!appointment.showFallback"
                  />
                  <!-- 默認頭像 -->
                  <div v-if="appointment.showFallback" class="absolute inset-0 flex items-center justify-center">
                    <svg width="100" height="100" viewBox="0 0 100 100" class="w-full h-full" fill="none" stroke="#c68f84" stroke-width="4">
                      <circle cx="50" cy="35" r="15" />
                      <path d="M20,85 C20,60 80,60 80,85" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p class="text-gray-700 font-medium">{{ appointment.customerName }}</p>
                  <p class="text-gray-500 text-sm">{{ formatDate(appointment.date) }} {{ appointment.time }}</p>
                  <p v-if="appointment.notes" class="text-gray-500 text-xs mt-1 italic">備註: {{ appointment.notes }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <!-- 聊聊按鈕 -->
                <button 
                  @click="chatWithCustomer(appointment)"
                  class="bg-white border border-[#c68f84] text-[#c68f84] w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#f9e7e4] transition-colors"
                  title="與顧客聊聊"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <!-- 確認與取消按鈕 -->
                <div class="flex space-x-2">
                  <button 
                    @click="confirmAppointment(appointment.id)"
                    class="bg-[#c68f84] text-white px-3 py-1 rounded-lg hover:bg-[#c67868] text-sm"
                  >
                    確認
                  </button>
                  <button 
                    @click="cancelAppointment(appointment.id)"
                    class="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 已確認預約 -->
        <div v-if="filteredAppointments.confirmed.length > 0" class="mb-4">
          <h4 class="text-lg font-medium text-[#c67868] mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#c67868]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            已確認的預約
          </h4>
          <div class="space-y-3">
            <div 
              v-for="appointment in filteredAppointments.confirmed" 
              :key="appointment.id" 
              class="bg-white rounded-xl p-4 shadow flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div class="flex items-center space-x-4">
                <!-- 顧客頭像 -->
                <div class="avatar-container w-12 h-12 rounded-full overflow-hidden relative" style="background-color: #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                  <img 
                    :src="appointment.customerImage" 
                    alt="" 
                    class="w-full h-full object-cover" 
                    @error="appointment.showFallback = true"
                    v-show="!appointment.showFallback"
                  />
                  <!-- 默認頭像 -->
                  <div v-if="appointment.showFallback" class="absolute inset-0 flex items-center justify-center">
                    <svg width="100" height="100" viewBox="0 0 100 100" class="w-full h-full" fill="none" stroke="#c68f84" stroke-width="4">
                      <circle cx="50" cy="35" r="15" />
                      <path d="M20,85 C20,60 80,60 80,85" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p class="text-gray-700 font-medium">{{ appointment.customerName }}</p>
                  <p class="text-gray-500 text-sm">{{ formatDate(appointment.date) }} {{ appointment.time }}</p>
                  <p v-if="appointment.notes" class="text-gray-500 text-xs mt-1 italic">備註: {{ appointment.notes }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <!-- 聊聊按鈕 -->
                <button 
                  @click="chatWithCustomer(appointment)"
                  class="bg-white border border-[#c68f84] text-[#c68f84] w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#f9e7e4] transition-colors"
                  title="與顧客聊聊"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <!-- 完成與取消按鈕 -->
                <div class="flex space-x-2">
                  <button 
                    @click="completeAppointment(appointment.id)"
                    class="bg-[#c68f84] text-white px-3 py-1 rounded-lg hover:bg-[#c67868] text-sm"
                  >
                    完成
                  </button>
                  <button 
                    @click="cancelAppointment(appointment.id)"
                    class="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 已完成預約 -->
        <div v-if="filteredAppointments.completed.length > 0" class="mb-4">
          <h4 class="text-lg font-medium text-[#c67868] mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#c67868]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            已完成的預約
          </h4>
          <div class="space-y-3">
            <div 
              v-for="appointment in filteredAppointments.completed" 
              :key="appointment.id" 
              class="bg-white rounded-xl p-4 shadow flex items-center justify-between hover:shadow-md transition-shadow opacity-80"
            >
              <div class="flex items-center space-x-4">
                <!-- 顧客頭像 -->
                <div class="avatar-container w-12 h-12 rounded-full overflow-hidden relative" style="background-color: #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                  <img 
                    :src="appointment.customerImage" 
                    alt="" 
                    class="w-full h-full object-cover" 
                    @error="appointment.showFallback = true"
                    v-show="!appointment.showFallback"
                  />
                  <!-- 默認頭像 -->
                  <div v-if="appointment.showFallback" class="absolute inset-0 flex items-center justify-center">
                    <svg width="100" height="100" viewBox="0 0 100 100" class="w-full h-full" fill="none" stroke="#c68f84" stroke-width="4">
                      <circle cx="50" cy="35" r="15" />
                      <path d="M20,85 C20,60 80,60 80,85" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p class="text-gray-700 font-medium">{{ appointment.customerName }}</p>
                  <p class="text-gray-500 text-sm">{{ formatDate(appointment.date) }} {{ appointment.time }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <!-- 聊聊按鈕 -->
                <button 
                  @click="chatWithCustomer(appointment)"
                  class="bg-white border border-[#c68f84] text-[#c68f84] w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#f9e7e4] transition-colors"
                  title="與顧客聊聊"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 已取消預約 -->
        <div v-if="filteredAppointments.cancelled.length > 0" class="mb-4">
          <h4 class="text-lg font-medium text-[#c67868] mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#c67868]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            已取消的預約
          </h4>
          <div class="space-y-3">
            <div 
              v-for="appointment in filteredAppointments.cancelled" 
              :key="appointment.id" 
              class="bg-white rounded-xl p-4 shadow flex items-center justify-between hover:shadow-md transition-shadow opacity-60"
            >
              <div class="flex items-center space-x-4">
                <!-- 顧客頭像 -->
                <div class="avatar-container w-12 h-12 rounded-full overflow-hidden relative" style="background-color: #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                  <img 
                    :src="appointment.customerImage" 
                    alt="" 
                    class="w-full h-full object-cover" 
                    @error="appointment.showFallback = true"
                    v-show="!appointment.showFallback"
                  />
                  <!-- 默認頭像 -->
                  <div v-if="appointment.showFallback" class="absolute inset-0 flex items-center justify-center">
                    <svg width="100" height="100" viewBox="0 0 100 100" class="w-full h-full" fill="none" stroke="#c68f84" stroke-width="4">
                      <circle cx="50" cy="35" r="15" />
                      <path d="M20,85 C20,60 80,60 80,85" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p class="text-gray-700 font-medium">{{ appointment.customerName }}</p>
                  <p class="text-gray-500 text-sm">{{ formatDate(appointment.date) }} {{ appointment.time }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <!-- 聊聊按鈕 -->
                <button 
                  @click="chatWithCustomer(appointment)"
                  class="bg-white border border-[#c68f84] text-[#c68f84] w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#f9e7e4] transition-colors"
                  title="與顧客聊聊"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 無預約時顯示 -->
        <div v-if="Object.values(filteredAppointments).every(arr => arr.length === 0)" class="text-center py-8 bg-white rounded-xl shadow">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-500 mb-2">目前沒有{{ appointmentFilter === 'all' ? '' : appointmentFilter === 'pending' ? '待確認' : appointmentFilter === 'confirmed' ? '已確認' : appointmentFilter === 'completed' ? '已完成' : '已取消' }}預約</p>
        </div>
      </div>    

      <!-- 時段管理 - 只有在自己的檔案且非預覽模式才顯示 -->
      <div v-if="isOwnProfile && !isPreviewMode" id="schedule-management" class="mb-8">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center">
            <h3 class="text-2xl text-gray-700 mr-2">營業時段管理</h3>
            <img src="../assets/flower.png" alt="Flower" class="w-10 h-auto" /> 
          </div>
          <button 
            @click="openScheduleModal"
            class="bg-[#c68f84] text-white px-4 py-2 rounded-lg hover:bg-[#c67868] text-sm"
          >
            設定時段
          </button>
        </div>

        <!-- 🔥 在這裡加入未設定時段提示 -->
        <div v-if="!hasAnySchedule" class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-4">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 class="text-lg font-medium text-yellow-800">尚未設定營業時段</h4>
              <p class="text-yellow-700 text-sm">您需要設定營業時段，顧客才能進行預約。</p>
            </div>
          </div>
        </div>

        <!-- 目前時段顯示 -->
        <div class="bg-white rounded-xl p-6 shadow">
          <h4 class="text-lg font-medium text-gray-700 mb-4">目前營業時段</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(daySchedule, dayName) in weeklySchedule" :key="dayName" class="flex items-center justify-between py-2 border-b border-gray-200">
              <span class="font-medium text-gray-700 w-16">{{ getDayDisplayName(dayName) }}</span>
              <div class="flex-1 ml-4">
                <div v-if="daySchedule.isOpen && daySchedule.timeSlots.length > 0" class="flex flex-wrap gap-2">
                  <span 
                    v-for="slot in daySchedule.timeSlots" 
                    :key="slot"
                    class="bg-[#f3d7d3] text-[#c67868] text-sm px-3 py-1 rounded-full"
                  >
                    {{ slot }}
                  </span>
                </div>
                <span v-else class="text-gray-400 text-sm">休息</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 作品牆管理 -->
      <div id="portfolio" class="mb-8">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center">
            <h3 class="text-2xl text-gray-700 mr-2">作品牆</h3>
            <img src="../assets/flower.png" alt="Flower" class="w-10 h-auto" /> 
          </div>
          <!-- 新增作品按鈕 - 只有在自己的檔案且非預覽模式才顯示 -->
          <button 
            v-if="isOwnProfile && !isPreviewMode" 
            @click="showAddWorkModal = true"
            class="bg-[#c68f84] text-white px-4 py-2 rounded-lg hover:bg-[#c67868] text-sm"
          >
            新增作品
          </button>
        </div>
        
        <!-- 作品牆 -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mx-auto">
          <div 
            v-for="work in sortedWorks" 
            :key="work.id" 
            class="bg-white rounded-xl shadow overflow-hidden flex flex-col relative group"
          >
            <!-- 編輯和刪除按鈕 - 只有在自己的檔案且非預覽模式才顯示 -->
            <div v-if="isOwnProfile && !isPreviewMode" class="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button 
                @click="editWork(work)"
                class="bg-[#c68f84] text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-[#c67868]"
                title="編輯作品"
              >
                ✎
              </button>
              <button 
                @click="removeWork(work.id)"
                class="bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-500"
                title="刪除作品"
              >
                ×
              </button>
            </div>
            <img :src="work.image" class="w-full h-44 object-cover" @error="handleWorkImageError($event)" />
            <div class="p-3 flex flex-col flex-grow">
              <p class="text-gray-500 text-sm mb-1">{{ formatDate(work.date) }}</p>
              <p class="text-gray-700 text-sm mb-2 line-clamp-2 flex-grow">{{ work.description }}</p>
              <div class="flex flex-wrap gap-1 mt-auto">
                <span v-for="(tag, index) in work.tags" :key="index" class="bg-[#c68f84] text-white text-xs py-1 px-3 rounded-full">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 顧客評價 (只顯示，不可編輯) -->
      <div id="reviews">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center">
            <h3 class="text-2xl text-gray-700 mr-2">顧客評價</h3>
            <img src="../assets/flower.png" alt="Flower" class="w-10 h-auto" /> 
          </div>
          <!-- 排序 -->
          <div class="flex items-center">
            <span class="text-sm text-gray-700 mr-2">排序方式：</span>
            <select v-model="reviewSortOption" class="py-1 px-2 rounded-md border text-sm bg-white">
              <option value="date-desc">最新</option>
              <option value="date-asc">最舊</option>
              <option value="rating-desc">評分高至低</option>
              <option value="rating-asc">評分低至高</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mx-auto">
          <div v-for="(review, index) in sortedReviews" :key="index" class="bg-white p-4 rounded-xl shadow flex flex-col">
            <div class="flex justify-between items-start mb-1">
              <p class="font-semibold">{{ review.reviewer }}</p>
              <!-- 星星 -->
              <div class="text-[#dcb876]">
                <div class="flex">
                  <template v-for="i in 5" :key="i">
                    <svg v-if="i <= Math.floor(review.rating)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                      <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  </template>
                </div>
              </div>
            </div>
            <p class="text-gray-600 text-sm mb-2 line-clamp-2 flex-grow">{{ review.comment }}</p>
            <p class="text-gray-400 text-xs text-right mt-auto">{{ formatDate(review.date) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/編輯作品彈窗 - 只在非預覽模式顯示 -->
    <div v-if="(showAddWorkModal || showEditWorkModal) && !isPreviewMode" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-bold text-gray-700 mb-4">
          {{ showEditWorkModal ? '編輯作品' : '新增作品' }}
        </h3>

        <!-- 作品圖片 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">作品圖片</label>
          <div v-if="showEditWorkModal && editingWork.image" class="mb-2">
            <img :src="editingWork.image" alt="當前作品圖片" class="w-20 h-20 object-cover rounded-lg" />
            <p class="text-xs text-gray-500 mt-1">當前圖片（可上傳新圖片替換）</p>
          </div>
          <input 
            ref="workImageInput" 
            type="file" 
            accept="image/*" 
            @change="handleWorkImageUpload"
            class="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <!-- 作品描述 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">作品描述</label>
          <textarea 
            v-model="workFormData.description" 
            rows="3"
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c68f84] focus:border-transparent"
            placeholder="描述這個作品的特色..."
          ></textarea>
        </div>

        <!-- 標籤區塊 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">標籤</label>

          <!-- 已選擇標籤 -->
          <div class="flex flex-wrap gap-2 mb-2">
            <span 
              v-for="(tag, index) in workFormData.tags" 
              :key="index" 
              class="bg-[#c68f84] text-white text-sm py-1 px-3 rounded-full flex items-center"
            >
              {{ tag }}
              <button 
                @click="removeWorkTag(index)" 
                class="ml-2 text-white hover:text-red-200"
              >
                ×
              </button>
            </span>
          </div>

          <!-- AI 建議標籤 -->
          <div v-if="suggestedTags.length" class="mb-2">
            <p class="text-sm text-gray-500 mb-1">AI 建議標籤 (點選加入)：</p>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="(tag, index) in suggestedTags" 
                :key="tag"
                @click="acceptSuggestedTag(tag, index)"
                class="bg-[#f3e4e1] text-[#5f4c47] py-1 px-3 rounded-full text-sm hover:bg-[#e4d1ce] transition"
              >
                {{ tag }} 
              </button>
            </div>
          </div>

          <!-- 手動新增標籤 -->
          <div class="flex space-x-2 mt-2">
            <input 
              v-model="newWorkTag" 
              @keyup.enter="addWorkTag"
              class="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c68f84] focus:border-transparent"
              placeholder="新增標籤"
            />
            <button 
              @click="addWorkTag"
              class="px-4 py-2 bg-[#c68f84] text-white rounded-lg hover:bg-[#c67868]"
            >
              新增
            </button>
          </div>
        </div>

        <!-- 按鈕 -->
        <div class="flex space-x-3">
          <button 
            @click="showEditWorkModal ? updateWork() : addWork()"
            class="flex-1 bg-[#c68f84] text-white py-2 rounded-lg hover:bg-[#c67868]"
          >
            {{ showEditWorkModal ? '更新作品' : '新增作品' }}
          </button>
          <button 
            @click="cancelWorkForm"
            class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
          >
            取消
          </button>
        </div>
      </div>
    </div>


    <!-- 時段管理彈窗 - 只在非預覽模式顯示 -->
    <div v-if="showScheduleModal && !isPreviewMode" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-gray-700">設定營業時段</h3>
          <button @click="closeScheduleModal" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-6">
          <div v-for="(daySchedule, dayName) in tempSchedule" :key="dayName" class="border rounded-lg p-4">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-medium text-gray-700">{{ getDayDisplayName(dayName) }}</h4>
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  v-model="daySchedule.isOpen"
                  @change="updateDayStatus(dayName)"
                  class="mr-2 h-4 w-4 text-[#c68f84] focus:ring-[#c68f84] border-gray-300 rounded"
                />
                <span class="text-sm text-gray-600">營業</span>
              </label>
            </div>

            <div v-if="daySchedule.isOpen" class="space-y-4">
              <!-- 可用時段選擇 -->
              <div>
                <p class="text-sm text-gray-600 mb-2">選擇可預約時段：</p>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <label 
                    v-for="slot in availableTimeSlots" 
                    :key="slot"
                    class="flex items-center cursor-pointer"
                  >
                    <input 
                      type="checkbox" 
                      :value="slot"
                      v-model="daySchedule.timeSlots"
                      class="mr-2 h-4 w-4 text-[#c68f84] focus:ring-[#c68f84] border-gray-300 rounded"
                    />
                    <span class="text-sm">{{ slot }}</span>
                  </label>
                </div>
              </div>

              <!-- 已選時段預覽 -->
              <div v-if="daySchedule.timeSlots.length > 0">
                <p class="text-sm text-gray-600 mb-2">已選時段：</p>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="slot in daySchedule.timeSlots" 
                    :key="slot"
                    class="bg-[#c68f84] text-white text-sm px-3 py-1 rounded-full flex items-center"
                  >
                    {{ slot }}
                    <button 
                      @click="removeTimeSlot(dayName, slot)"
                      class="ml-2 text-white hover:text-red-200"
                    >
                      ×
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div v-else class="text-gray-400 text-sm py-4">
              此日休息
            </div>
          </div>
        </div>

        <!-- 快速設定 -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 class="text-md font-medium text-gray-700 mb-3">快速設定</h4>
          <div class="flex flex-wrap gap-2 mb-3">
            <button 
              @click="setWeekdaySchedule"
              class="px-3 py-1 bg-[#c68f84] text-white rounded text-sm hover:bg-[#c67868]"
            >
              平日營業 (週一~週五)
            </button>
            <button 
              @click="setWeekendSchedule"
              class="px-3 py-1 bg-[#c68f84] text-white rounded text-sm hover:bg-[#c67868]"
            >
              週末營業 (週六~週日)
            </button>
            <button 
              @click="setAllDaysSchedule"
              class="px-3 py-1 bg-[#c68f84] text-white rounded text-sm hover:bg-[#c67868]"
            >
              全週營業
            </button>
            <button 
              @click="clearAllSchedule"
              class="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              清除全部
            </button>
          </div>
          <p class="text-xs text-gray-500">快速設定會套用標準營業時段：10:00-12:00, 14:00-16:00, 16:00-18:00</p>
        </div>

        <div class="flex space-x-3 mt-6">
          <button 
            @click="saveSchedule"
            class="flex-1 bg-[#c68f84] text-white py-3 rounded-lg hover:bg-[#c67868] font-medium"
          >
            儲存時段設定
          </button>
          <button 
            @click="closeScheduleModal"
            class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
          >
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- 預約彈窗模式 -->
<div v-if="showBookingModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
    <BookingView 
      :artist-id="currentArtist.id" 
      :has-schedule="hasAnySchedule"
      @close="showBookingModal = false"
    />
  </div>
</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue' 
import { useRoute, useRouter } from 'vue-router'
import BookingView from './Booking.vue' 
import { apiRequest } from '../config/api.js' 
import { useLogout } from '../auth.js'

const { handleLogout } = useLogout()

const route = useRoute()
const router = useRouter()

const showMenu = ref(false)
const editMode = ref(false)
const showFallback = ref(false)
const showAddWorkModal = ref(false)
const showEditWorkModal = ref(false)
const showBookingModal = ref(false)
const showScheduleModal = ref(false)
const showOutline = ref(false)
const activeSection = ref('basic-info')

const isLoading = ref(false)

// 新增預覽模式狀態
const isPreviewMode = ref(false)

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 當前登入的美甲師ID (在實際應用中這會來自認證系統)
const currentUserId = ref(localStorage.getItem('userId') || '1')

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const closeMenu = (event) => {
  // 關閉左側選單
  if (!event.target.closest('.fixed') && showMenu.value) {
    showMenu.value = false
  }
  // 關閉大綱浮窗
  if (!event.target.closest('.fixed') && showOutline.value) {
    showOutline.value = false
  }
}

// 切換預覽模式
const togglePreviewMode = () => {
  isPreviewMode.value = !isPreviewMode.value
  // 如果進入預覽模式時正在編輯，則退出編輯模式
  if (isPreviewMode.value && editMode.value) {
    cancelEdit()
  }
  // 關閉所有彈窗
  showAddWorkModal.value = false
  showEditWorkModal.value = false
  showScheduleModal.value = false
  showOutline.value = false
}

// 前往自己的個人檔案
const goToSelfProfile = () => {
  // 判斷用戶類型
  const userType = localStorage.getItem('userType') || 'artist'
  const userId = localStorage.getItem('userId') || '1'
  
  if (userType === 'customer') {
    router.push(`/profile/customer/${userId}`)
  } else {
    router.push(`/profile/${userId}`)
  }
}

// 模擬資料
import design1 from '../assets/temp/design1.jpg'
import design2 from '../assets/temp/design2.jpg'
import design3 from '../assets/temp/design3.jpg'
import work1 from '../assets/temp/work1.jpg'
import work2 from '../assets/temp/work2.jpg'
import work3 from '../assets/temp/work3.jpg'

const artists = ref([
  {
    id: '1',
    studio: 'waka.nail',
    city: '臺北市',
    district: '大安區',
    rating: 4.9, 
    priceLow: 1000, 
    priceHigh: 1800,
    bio: '專精於手繪藝術與流行款式，細心且耐心。',
    styles: ['貓眼', '漸層', '法式', '手繪', '暈染', '日系清新', '金屬光感'],
    image: work1,
    weeklySchedule: {
      monday: { isOpen: true, timeSlots: ['10:00-12:00', '14:00-16:00', '16:00-18:00'] },
      tuesday: { isOpen: true, timeSlots: ['10:00-12:00', '14:00-16:00', '16:00-18:00'] },
      wednesday: { isOpen: true, timeSlots: ['10:00-12:00', '14:00-16:00', '16:00-18:00'] },
      thursday: { isOpen: true, timeSlots: ['10:00-12:00', '14:00-16:00', '16:00-18:00'] },
      friday: { isOpen: true, timeSlots: ['10:00-12:00', '14:00-16:00', '16:00-18:00'] },
      saturday: { isOpen: true, timeSlots: ['10:00-12:00', '14:00-16:00'] },
      sunday: { isOpen: false, timeSlots: [] }
    },
    works: [
      {
        id: 1,
        description: '簡約的日系漸變設計，適合各種場合。',
        date: '2024-05-10',
        image: design1,
        tags: ['日系', '簡約', '漸變', '白色系']
      },
      {
        id: 2,
        description: '柔和的粉色法式設計，充滿少女感。',
        date: '2024-05-08',
        image: design2,
        tags: ['粉色', '法式', '少女', '浪漫']
      },
      {
        id: 3,
        description: '暖色調的秋季設計，散發溫柔氣息。',
        date: '2024-05-05',
        image: design3,
        tags: ['秋季', '暖色調', '溫柔', '大地色']
      },
      {
        id: 4,
        description: '閃耀吸睛的貓眼設計，派對必備款。',
        date: '2024-05-01',
        image: work1,
        tags: ['貓眼', '閃亮', '派對', '特殊效果']
      },
      {
        id: 5,
        description: '清涼的水彩暈染效果，展現夏日氛圍。',
        date: '2024-04-28',
        image: work2,
        tags: ['水彩', '暈染', '夏日', '藍色系']
      }
    ],
    reviews: [
      { reviewer: 'Joyce', comment: '超級細心又溫柔，成品超美！喜歡美甲師的建議，完全符合我的風格，下次還會再訪。', rating: 5, date: '2024-05-01' },
      { reviewer: 'Angela', comment: '環境舒服，款式也很專業！', rating: 4, date: '2024-04-28' },
      { reviewer: 'Lily', comment: '非常推薦這位設計師，為我設計了很適合我的款式，而且手法輕柔不傷指甲。', rating: 4, date: '2024-04-15' },
      { reviewer: 'Abby', comment: '很推薦這位美甲師！', rating: 5, date: '2024-04-15' }
    ]
  },
  {
    id: '4',
    studio: 'test.nail',
    city: '台中市',
    district: '西區',
    rating: 4.5,
    priceLow: 900,
    priceHigh: 1600,
    bio: '新加入的美甲師，尚未設定營業時段。',
    styles: ['簡約', '清新'],
    image: design1,
    weeklySchedule: {
      monday: { isOpen: false, timeSlots: [] },
      tuesday: { isOpen: false, timeSlots: [] },
      wednesday: { isOpen: false, timeSlots: [] },
      thursday: { isOpen: false, timeSlots: [] },
      friday: { isOpen: false, timeSlots: [] },
      saturday: { isOpen: false, timeSlots: [] },
      sunday: { isOpen: false, timeSlots: [] }
    },
    works: [],
    reviews: []
  },
  {
    id: '2',
    studio: 'jolieee_nail',
    city: '新北市',
    district: '板橋區',
    rating: 4.7,
    priceLow: 800,
    priceHigh: 1500,
    bio: '主打簡約美甲與護甲療程，溫柔又高質感。',
    styles: ['護甲', '簡約風', '水鑽', '跳色', '大理石紋'],
    image: design2,
    weeklySchedule: {
      monday: { isOpen: true, timeSlots: ['10:00-12:00', '14:00-16:00', '18:00-20:00'] },
      tuesday: { isOpen: true, timeSlots: ['10:00-12:00', '14:00-16:00', '18:00-20:00'] },
      wednesday: { isOpen: false, timeSlots: [] },
      thursday: { isOpen: true, timeSlots: ['10:00-12:00', '14:00-16:00', '18:00-20:00'] },
      friday: { isOpen: true, timeSlots: ['10:00-12:00', '14:00-16:00', '18:00-20:00'] },
      saturday: { isOpen: true, timeSlots: ['09:00-11:00', '11:00-13:00', '14:00-16:00'] },
      sunday: { isOpen: true, timeSlots: ['14:00-16:00', '16:00-18:00'] }
    },
    works: [
      {
        id: 1,
        description: '高質感的大理石紋理設計，優雅又時尚。',
        date: '2024-05-12',
        image: work3,
        tags: ['大理石', '質感', '優雅', '黑白灰']
      },
      {
        id: 2,
        description: '精緻的手繪花卉圖案，春日氣息滿滿。',
        date: '2024-05-07',
        image: design1,
        tags: ['花卉', '手繪', '春季', '多彩']
      }
    ],
    reviews: [
      { reviewer: 'Sandy', comment: '好喜歡這裡！一定會再來！設計師有豐富的藝術感，推薦給所有重視品質的顧客。', rating: 4.7, date: '2024-05-03' },
      { reviewer: 'Jenny', comment: '美甲品質很好，但等待時間比預期長了一點。', rating: 4.0, date: '2024-04-20' }
    ]
  },
  {
    id: '3',
    studio: '61.nail',
    city: '高雄市',
    district: '鼓山區',
    rating: 4.6,
    priceLow: 1200,
    priceHigh: 1500,
    bio: '主打簡約美甲與護甲療程，溫柔又高質感。',
    styles: ['金屬質感', '鏡面', '幾何', '極簡', '韓風'],
    image: design3,
    weeklySchedule: {
      monday: { isOpen: false, timeSlots: [] },
      tuesday: { isOpen: true, timeSlots: ['13:00-15:00', '15:00-17:00', '17:00-19:00'] },
      wednesday: { isOpen: true, timeSlots: ['13:00-15:00', '15:00-17:00', '17:00-19:00'] },
      thursday: { isOpen: true, timeSlots: ['13:00-15:00', '15:00-17:00', '17:00-19:00'] },
      friday: { isOpen: true, timeSlots: ['13:00-15:00', '15:00-17:00', '17:00-19:00'] },
      saturday: { isOpen: true, timeSlots: ['10:00-12:00', '13:00-15:00', '15:00-17:00'] },
      sunday: { isOpen: true, timeSlots: ['10:00-12:00', '13:00-15:00'] }
    },
    works: [
      {
        id: 1,
        description: '閃亮的金屬光澤設計，打造前衛感。',
        date: '2024-05-11',
        image: design2,
        tags: ['金屬', '光澤', '前衛', '特殊效果']
      }
    ],
    reviews: [
      { reviewer: 'Sandy', comment: '金屬光澤效果超出預期，美甲師技術精湛！', rating: 4.8, date: '2024-05-10' }
    ]
  }
])

const currentArtist = ref({})
const editData = ref({})
const originalData = ref({})

// 新增風格相關
const newStyle = ref('')

// 作品表單相關
const workFormData = ref({
  description: '',
  tags: [],
  image: ''
})
const newWorkTag = ref('')
const editingWork = ref({}) // 正在編輯的作品

// 時段管理相關
const availableTimeSlots = [
  '10:00-12:00', '12:00-14:00', '14:00-16:00', 
  '16:00-18:00', '18:00-20:00'
]

// 預設週間時段設定
const defaultWeeklySchedule = {
  monday: { isOpen: false, timeSlots: [] },
  tuesday: { isOpen: false, timeSlots: [] },
  wednesday: { isOpen: false, timeSlots: [] },
  thursday: { isOpen: false, timeSlots: [] },
  friday: { isOpen: false, timeSlots: [] },
  saturday: { isOpen: false, timeSlots: [] },
  sunday: { isOpen: false, timeSlots: [] }
}

const weeklySchedule = ref({ ...defaultWeeklySchedule })
const tempSchedule = ref({}) // 編輯時的臨時資料

// 縣市資料（從 register.vue 複製）
const cities = [
  { name: '新北市', districts: ['萬里區', '金山區', '板橋區', '汐止區', '深坑區', '石碇區', '瑞芳區', '平溪區', '雙溪區', '貢寮區', '新店區', '坪林區', '烏來區', '永和區', '中和區', '土城區', '三峽區', '樹林區', '鶯歌區', '三重區', '新莊區', '泰山區', '林口區', '蘆洲區', '五股區', '八里區', '淡水區', '三芝區', '石門區'] },
  { name: '臺北市', districts: ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'] },
  { name: '桃園市', districts: ['中壢區', '平鎮區', '龍潭區', '楊梅區', '新屋區', '觀音區', '桃園區', '龜山區', '八德區', '大溪區', '復興區', '大園區', '蘆竹區'] },
  { name: '臺中市', districts: ['中區', '東區', '南區', '西區', '北區', '北屯區', '西屯區', '南屯區', '太平區', '大里區', '霧峰區', '烏日區', '豐原區', '后里區', '石岡區', '東勢區', '和平區', '新社區', '潭子區', '大雅區', '神岡區', '大肚區', '沙鹿區', '龍井區', '梧棲區', '清水區', '大甲區', '外埔區', '大安區'] },
  { name: '臺南市', districts: ['中西區', '東區', '南區', '北區', '安平區', '安南區', '永康區', '歸仁區', '新化區', '左鎮區', '玉井區', '楠西區', '南化區', '仁德區', '關廟區', '龍崎區', '官田區', '麻豆區', '佳里區', '西港區', '七股區', '將軍區', '學甲區', '北門區', '新營區', '後壁區', '白河區', '東山區', '六甲區', '下營區', '柳營區', '鹽水區', '善化區', '大內區', '山上區', '新市區', '安定區'] },
  { name: '高雄市', districts: ['新興區', '前金區', '苓雅區', '鹽埕區', '鼓山區', '旗津區', '前鎮區', '三民區', '楠梓區', '小港區', '左營區', '仁武區', '大社區', '岡山區', '路竹區', '阿蓮區', '田寮區', '燕巢區', '橋頭區', '梓官區', '彌陀區', '永安區', '湖內區', '鳳山區', '大寮區', '林園區', '鳥松區', '大樹區', '旗山區', '美濃區', '六龜區', '內門區', '杉林區', '甲仙區', '桃源區', '那瑪夏區', '茂林區', '茄萣區'] },
  { name: '基隆市', districts: ['仁愛區', '信義區', '中正區', '中山區', '安樂區', '暖暖區', '七堵區'] },
  { name: '新竹市', districts: ['東區', '北區', '香山區'] },
  { name: '嘉義市', districts: ['東區', '西區'] },
  { name: '宜蘭縣', districts: ['宜蘭市', '頭城鎮', '礁溪鄉', '壯圍鄉', '員山鄉', '羅東鎮', '三星鄉', '大同鄉', '五結鄉', '冬山鄉', '蘇澳鎮', '南澳鄉'] },
  { name: '新竹縣', districts: ['竹北市', '湖口鄉', '新豐鄉', '新埔鎮', '關西鎮', '芎林鄉', '寶山鄉', '竹東鎮', '五峰鄉', '橫山鄉', '尖石鄉', '北埔鄉', '峨眉鄉'] },
  { name: '苗栗縣', districts: ['竹南鎮', '頭份市', '三灣鄉', '南庄鄉', '獅潭鄉', '後龍鎮', '通霄鎮', '苑裡鎮', '苗栗市', '造橋鄉', '頭屋鄉', '公館鄉', '大湖鄉', '泰安鄉', '銅鑼鄉', '三義鄉', '西湖鄉', '卓蘭鎮'] },
  { name: '彰化縣', districts: ['彰化市', '芬園鄉', '花壇鄉', '秀水鄉', '鹿港鎮', '福興鄉', '線西鄉', '和美鎮', '伸港鄉', '員林市', '社頭鄉', '永靖鄉', '埔心鄉', '溪湖鎮', '大村鄉', '埔鹽鄉', '田中鎮', '北斗鎮', '田尾鄉', '埤頭鄉', '溪州鄉', '竹塘鄉', '二林鎮', '大城鄉', '芳苑鄉', '二水鄉'] },
  { name: '南投縣', districts: ['南投市', '中寮鄉', '草屯鎮', '國姓鄉', '埔里鎮', '仁愛鄉', '名間鄉', '集集鎮', '水里鄉', '魚池鄉', '信義鄉', '竹山鎮', '鹿谷鄉'] },
  { name: '雲林縣', districts: ['斗南鎮', '大埤鄉', '虎尾鎮', '土庫鎮', '褒忠鄉', '東勢鄉', '臺西鄉', '崙背鄉', '麥寮鄉', '斗六市', '林內鄉', '古坑鄉', '莿桐鄉', '西螺鎮', '二崙鄉', '北港鎮', '水林鄉', '口湖鄉', '四湖鄉', '元長鄉'] },
  { name: '嘉義縣', districts: ['番路鄉', '梅山鄉', '竹崎鄉', '阿里山鄉', '中埔鄉', '大埔鄉', '水上鄉', '鹿草鄉', '太保市', '朴子市', '東石鄉', '六腳鄉', '新港鄉', '民雄鄉', '大林鎮', '溪口鄉', '義竹鄉', '布袋鎮'] },
  { name: '屏東縣', districts: ['屏東市', '三地門鄉', '霧臺鄉', '瑪家鄉', '九如鄉', '里港鄉', '高樹鄉', '鹽埔鄉', '長治鄉', '麟洛鄉', '竹田鄉', '內埔鄉', '萬丹鄉', '潮州鎮', '泰武鄉', '來義鄉', '萬巒鄉', '崁頂鄉', '新埤鄉', '南州鄉', '林邊鄉', '東港鎮', '琉球鄉', '佳冬鄉', '新園鄉', '枋寮鄉', '枋山鄉', '春日鄉', '獅子鄉', '車城鄉', '牡丹鄉', '恆春鎮', '滿州鄉'] },
  { name: '臺東縣', districts: ['臺東市', '綠島鄉', '蘭嶼鄉', '延平鄉', '卑南鄉', '鹿野鄉', '關山鎮', '海端鄉', '池上鄉', '東河鄉', '成功鎮', '長濱鄉', '太麻里鄉', '金峰鄉', '大武鄉', '達仁鄉'] },
  { name: '花蓮縣', districts: ['花蓮市', '新城鄉', '秀林鄉', '吉安鄉', '壽豐鄉', '鳳林鎮', '光復鄉', '豐濱鄉', '瑞穗鄉', '萬榮鄉', '玉里鎮', '卓溪鄉', '富里鄉'] },
  { name: '澎湖縣', districts: ['馬公市', '西嶼鄉', '望安鄉', '七美鄉', '白沙鄉', '湖西鄉'] },
  { name: '金門縣', districts: ['金沙鎮', '金湖鎮', '金寧鄉', '金城鎮', '烈嶼鄉', '烏坵鄉'] },
  { name: '連江縣', districts: ['南竿鄉', '北竿鄉', '莒光鄉', '東引鄉'] }
]

// 目前選擇的區域資料
const districts = ref([])

// 評論排序選項
const reviewSortOption = ref('date-desc')

// 預約管理相關狀態
const appointmentFilter = ref('all')

// 計算屬性 - 檢查是否為自己的檔案
const isOwnProfile = computed(() => {
  return route.params.id === currentUserId.value
})

const sortedWorks = computed(() => {
  if (!currentArtist.value || !currentArtist.value.works) return []
  
  return [...currentArtist.value.works].sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })
})

const sortedReviews = computed(() => {
  if (!currentArtist.value || !currentArtist.value.reviews) return []
  
  return [...currentArtist.value.reviews].sort((a, b) => {
    switch (reviewSortOption.value) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date)
      case 'date-asc':
        return new Date(a.date) - new Date(b.date)
      case 'rating-desc':
        return b.rating - a.rating
      case 'rating-asc':
        return a.rating - b.rating
      default:
        return 0
    }
  })
})

// 模擬預約資料
const appointments = ref([
  {
    id: 'apt1',
    customerId: 'customer1',
    customerName: 'Lily Chen',
    customerImage: work2,
    date: '2025-05-28',
    time: '14:00-16:00',
    status: 'pending',
    notes: '希望做法式美甲，偏粉色系',
    showFallback: false
  },
  {
    id: 'apt2',
    customerId: 'customer2',
    customerName: 'Annie Wang',
    customerImage: null,
    date: '2025-05-30',
    time: '10:00-12:00',
    status: 'pending',
    notes: '',
    showFallback: true
  },
  {
    id: 'apt3',
    customerId: 'customer3',
    customerName: 'Sophie Lin',
    customerImage: work3,
    date: '2025-06-02',
    time: '16:00-18:00',
    status: 'confirmed',
    notes: '過敏體質，請使用低敏材料',
    showFallback: false
  },
  {
    id: 'apt4',
    customerId: 'customer4',
    customerName: 'Emma Huang',
    customerImage: null,
    date: '2025-05-25',
    time: '14:00-16:00',
    status: 'completed',
    notes: '',
    showFallback: true
  },
  {
    id: 'apt5',
    customerId: 'customer5',
    customerName: 'Grace Wu',
    customerImage: null,
    date: '2025-05-20',
    time: '10:00-12:00',
    status: 'cancelled',
    notes: '',
    showFallback: true
  }
])

// 根據過濾條件獲取預約
const filteredAppointments = computed(() => {
  const result = {
    pending: [],
    confirmed: [],
    completed: [],
    cancelled: []
  }
  
  const filtered = appointmentFilter.value === 'all' 
    ? appointments.value 
    : appointments.value.filter(apt => apt.status === appointmentFilter.value)
  
  filtered.forEach(apt => {
    if (result[apt.status]) {
      result[apt.status].push(apt)
    }
  })
  
  return result
})

// 方法
const handleImageError = () => {
  showFallback.value = true
}

const handleWorkImageError = (event) => {
  event.target.style.display = 'none'
  event.target.parentElement.style.backgroundColor = '#f3f4f6'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
}

// 編輯模式相關方法
const startEdit = () => {
  if (isPreviewMode.value) return // 預覽模式下不允許編輯
  
  editMode.value = true
  originalData.value = JSON.parse(JSON.stringify(currentArtist.value))
  editData.value = JSON.parse(JSON.stringify(currentArtist.value))
  updateDistricts()
}

const updateDistricts = () => {
  const city = cities.find(city => city.name === editData.value.city)
  if (city) {
    districts.value = city.districts
  } else {
    districts.value = []
  }
}

const cancelEdit = () => {
  editMode.value = false
  currentArtist.value = JSON.parse(JSON.stringify(originalData.value))
  editData.value = {}
  newStyle.value = ''
}

const saveChanges = async () => {
  if (!editData.value.studio?.trim()) {
    alert('請輸入工作室名稱')
    return
  }
  if (!editData.value.city?.trim() || !editData.value.district?.trim()) {
    alert('請完整填寫地址資訊')
    return
  }
  if (!editData.value.priceLow || !editData.value.priceHigh) {
    alert('請設定價格區間')
    return
  }
  if (editData.value.priceLow >= editData.value.priceHigh) {
    alert('最高價格必須大於最低價格')
    return
  }

  // 準備更新資料
  const updateData = {
    studio_name: editData.value.studio.trim(),
    city: editData.value.city,
    district: editData.value.district,
    bio: editData.value.bio || '',
    styles: editData.value.styles || [],
    priceLow: editData.value.priceLow,
    priceHigh: editData.value.priceHigh
  }
  console.log('準備發送的資料:', updateData) 
  
  // 發送更新請求
  const success = await updateArtistData(updateData)
  
  if (success) {
    // 更新本地資料
    currentArtist.value = JSON.parse(JSON.stringify(editData.value))
    editMode.value = false
    editData.value = {}
    newStyle.value = ''
    alert('資料已成功更新！')
  }
}

// 風格標籤管理
const addStyle = () => {
  if (newStyle.value.trim() && !editData.value.styles.includes(newStyle.value.trim())) {
    editData.value.styles.push(newStyle.value.trim())
    newStyle.value = ''
  }
}

const removeStyle = (index) => {
  editData.value.styles.splice(index, 1)
}

// 頭像上傳
const imageInput = ref(null)

const triggerImageUpload = () => {
  imageInput.value?.click()
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      editData.value.image = e.target.result
      showFallback.value = false
    }
    reader.readAsDataURL(file)
  }
}

// 作品管理
const removeWork = (workId) => {
  if (confirm('確定要刪除這個作品嗎？')) {
    const index = currentArtist.value.works.findIndex(work => work.id === workId)
    if (index > -1) {
      currentArtist.value.works.splice(index, 1)
    }
  }
}

const addWorkTag = () => {
  if (newWorkTag.value.trim() && !workFormData.value.tags.includes(newWorkTag.value.trim())) {
    workFormData.value.tags.push(newWorkTag.value.trim())
    newWorkTag.value = ''
  }
}

const removeWorkTag = (index) => {
  workFormData.value.tags.splice(index, 1)
}

const workImageInput = ref(null)

const handleWorkImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      workFormData.value.image = e.target.result
      analyzeImageAndSuggestTags(file) // ← 加上這行觸發 AI 分析
    }
    reader.readAsDataURL(file)
  }
}

const editWork = (work) => {
  editingWork.value = { ...work }
  workFormData.value = {
    description: work.description,
    tags: [...work.tags],
    image: work.image
  }
  showEditWorkModal.value = true
}

const updateWork = () => {
  if (!workFormData.value.description.trim()) {
    alert('請輸入作品描述')
    return
  }

  const workIndex = currentArtist.value.works.findIndex(work => work.id === editingWork.value.id)
  if (workIndex > -1) {
    currentArtist.value.works[workIndex] = {
      ...editingWork.value,
      description: workFormData.value.description.trim(),
      tags: [...workFormData.value.tags],
      image: workFormData.value.image
    }
    
    alert('作品已成功更新！')
    cancelWorkForm()
  }
}

const addWork = () => {
  if (!workFormData.value.description.trim()) {
    alert('請輸入作品描述')
    return
  }
  if (!workFormData.value.image) {
    alert('請選擇作品圖片')
    return
  }

  const work = {
    id: Date.now(),
    description: workFormData.value.description.trim(),
    date: new Date().toISOString().split('T')[0],
    image: workFormData.value.image,
    tags: [...workFormData.value.tags]
  }

  currentArtist.value.works.unshift(work)
  
  alert('作品已成功新增！')
  cancelWorkForm()
}

const suggestedTags = ref([])

const cancelWorkForm = () => {
  showAddWorkModal.value = false
  showEditWorkModal.value = false
  workFormData.value = {
    description: '',
    tags: [],
    image: ''
  }
  editingWork.value = {}
  newWorkTag.value = ''
  suggestedTags.value = [] 
  if (workImageInput.value) {
    workImageInput.value.value = ''
  }
}

const acceptSuggestedTag = (tag, index) => {
  if (!workFormData.value.tags.includes(tag)) {
    workFormData.value.tags.push(tag)
  }
  suggestedTags.value.splice(index, 1)
}


const analyzeImageAndSuggestTags = (imageFile) => {
  // 假設你未來會丟去後端拿標籤
  // 暫時模擬一下
  suggestedTags.value = ['可愛', '貓眼', '日系'] // ← 根據圖片自動建議
}

// 預約管理方法
const confirmAppointment = (appointmentId) => {
  const index = appointments.value.findIndex(apt => apt.id === appointmentId)
  if (index > -1) {
    appointments.value[index].status = 'confirmed'
    alert('已確認預約！')
  }
}

const completeAppointment = (appointmentId) => {
  const index = appointments.value.findIndex(apt => apt.id === appointmentId)
  if (index > -1) {
    appointments.value[index].status = 'completed'
    alert('已完成預約！')
  }
}

const cancelAppointment = (appointmentId) => {
  if (confirm('確定要取消此預約嗎？')) {
    const index = appointments.value.findIndex(apt => apt.id === appointmentId)
    if (index > -1) {
      appointments.value[index].status = 'cancelled'
      alert('已取消預約！')
    }
  }
}

const chatWithCustomer = (appointment) => {
  console.log('Starting chat with customer:', appointment.customerName, appointment.customerId)
  
  router.push({
    path: '/chat',
    query: { 
      artistId: appointment.customerId,
      artistName: appointment.customerName,
      artistImage: appointment.customerImage,
      fromBooking: 'true'
    }
  })
}

// 時段管理相關方法
const getDayDisplayName = (dayName) => {
  const dayNames = {
    monday: '週一',
    tuesday: '週二', 
    wednesday: '週三',
    thursday: '週四',
    friday: '週五',
    saturday: '週六',
    sunday: '週日'
  }
  return dayNames[dayName] || dayName
}

const updateDayStatus = (dayName) => {
  if (!tempSchedule.value[dayName].isOpen) {
    tempSchedule.value[dayName].timeSlots = []
  }
}

const removeTimeSlot = (dayName, slot) => {
  const index = tempSchedule.value[dayName].timeSlots.indexOf(slot)
  if (index > -1) {
    tempSchedule.value[dayName].timeSlots.splice(index, 1)
  }
}

const setWeekdaySchedule = () => {
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  const defaultSlots = ['10:00-12:00', '14:00-16:00', '16:00-18:00']
  
  weekdays.forEach(day => {
    tempSchedule.value[day].isOpen = true
    tempSchedule.value[day].timeSlots = [...defaultSlots]
  })
}

const setWeekendSchedule = () => {
  const weekends = ['saturday', 'sunday']
  const defaultSlots = ['10:00-12:00', '14:00-16:00']
  
  weekends.forEach(day => {
    tempSchedule.value[day].isOpen = true
    tempSchedule.value[day].timeSlots = [...defaultSlots]
  })
}

const setAllDaysSchedule = () => {
  const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const defaultSlots = ['10:00-12:00', '14:00-16:00', '16:00-18:00']
  
  allDays.forEach(day => {
    tempSchedule.value[day].isOpen = true
    tempSchedule.value[day].timeSlots = [...defaultSlots]
  })
}

const clearAllSchedule = () => {
  const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  
  allDays.forEach(day => {
    tempSchedule.value[day].isOpen = false
    tempSchedule.value[day].timeSlots = []
  })
}

const closeScheduleModal = () => {
  showScheduleModal.value = false
  tempSchedule.value = {}
}

const openScheduleModal = () => {
  tempSchedule.value = JSON.parse(JSON.stringify(weeklySchedule.value))
  showScheduleModal.value = true
}

const saveSchedule = async () => {
  const hasOpenDay = Object.values(tempSchedule.value).some(day => day.isOpen && day.timeSlots.length > 0)
  
  if (!hasOpenDay) {
    alert('請至少設定一天的營業時段')
    return
  }
  
  try {
    const availability = {}
    
    // 星期轉換對照表
    const weekdayMap = {
      'monday': 'Mon',
      'tuesday': 'Tue', 
      'wednesday': 'Wed',
      'thursday': 'Thu',
      'friday': 'Fri',
      'saturday': 'Sat',
      'sunday': 'Sun'
    }
    
    // 轉換前端格式到 API 需要的格式
    Object.keys(tempSchedule.value).forEach(day => {
      const daySchedule = tempSchedule.value[day]
      const dbWeekday = weekdayMap[day] // 轉換成 Mon, Tue 格式
      
      if (daySchedule.isOpen && daySchedule.timeSlots.length > 0) {
        availability[dbWeekday] = daySchedule.timeSlots.map(slot => slot.split('-')[0])
      } else {
        availability[dbWeekday] = []
      }
    })
    
    console.log('準備儲存的時段資料:', availability)
    
    const result = await apiRequest(`/artists/${currentArtist.value.id}/availability`, {
      method: 'POST',
      body: JSON.stringify({ availability })
    })
    
    if (result.success) {
      // 更新本地資料
      weeklySchedule.value = JSON.parse(JSON.stringify(tempSchedule.value))
      console.log('營業時段儲存成功')
      alert('營業時段設定已儲存！')
      closeScheduleModal()
    } else {
      console.error('儲存營業時段失敗:', result.error)
      alert(`儲存失敗：${result.error}`)
    }
  } catch (error) {
    console.error('儲存營業時段錯誤:', error)
    alert('儲存時段時發生錯誤')
  }
}

const openBookingModal = () => {
  showBookingModal.value = true
}

const navigateToChat = () => {
  if (currentArtist.value && currentArtist.value.id) {
    console.log('Navigating to chat with:', currentArtist.value.studio, currentArtist.value.id)
    router.push({
      path: '/chat',
      query: { 
        artistId: currentArtist.value.id,
        artistName: currentArtist.value.studio,
        artistImage: currentArtist.value.image
      }
    })
  }
}

const toggleOutline = () => {
  showOutline.value = !showOutline.value
}

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
    activeSection.value = sectionId
    showOutline.value = false
  }
}

const handleScroll = () => {
  const sections = ['basic-info', 'appointment-management', 'schedule-management', 'portfolio', 'reviews']
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  
  for (const sectionId of sections) {
    const element = document.getElementById(sectionId)
    if (element) {
      const offsetTop = element.offsetTop - 100
      const offsetBottom = offsetTop + element.offsetHeight
      
      if (scrollTop >= offsetTop && scrollTop < offsetBottom) {
        activeSection.value = sectionId
        break
      }
    }
  }
}

// 載入美甲師資料
const loadArtistData = async (artistId) => {
  isLoading.value = true
  
  try {
    const result = await apiRequest(`/artists/${artistId}`)
    
    if (result.success) {
      const artistData = result.data.artist
      currentArtist.value = {
        id: artistData.id,
        studio: artistData.studio,
        city: artistData.city,
        district: artistData.district,
        rating: artistData.rating,
        priceLow: artistData.priceLow,
        priceHigh: artistData.priceHigh,
        bio: artistData.bio,
        styles: artistData.styles || [],
        image: artistData.image,
        created_at: artistData.created_at
      }
      console.log('美甲師資料載入成功:', currentArtist.value)
    } else {
      console.error('載入美甲師資料失敗:', result.error)
      alert(`載入資料失敗：${result.error}`)
      router.push('/home')
    }
  } catch (error) {
    console.error('載入美甲師資料錯誤:', error)
    alert('載入資料時發生錯誤')
    router.push('/home')
  } finally {
    isLoading.value = false
  }
}

// 更新美甲師資料
const updateArtistData = async (updateData) => {
  try {
    const result = await apiRequest(`/artists/${currentArtist.value.id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
    
    if (result.success) {
      console.log('美甲師資料更新成功')
      return true
    } else {
      console.error('更新美甲師資料失敗:', result.error)
      alert(`更新失敗：${result.error}`)
      return false
    }
  } catch (error) {
    console.error('更新美甲師資料錯誤:', error)
    alert('更新資料時發生錯誤')
    return false
  }
}
const getEndTime = (startTime) => {
  const [hours, minutes] = startTime.split(':').map(Number)
  const endHours = hours + 2 // 假設每個時段2小時
  return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const hasAnySchedule = computed(() => {
  const result = Object.values(weeklySchedule.value).some(day => day.isOpen && day.timeSlots.length > 0)
  console.log('🤔 hasAnySchedule 計算:', {
    weeklySchedule: weeklySchedule.value,
    result: result
  })
  return result
})

const loadArtistSchedule = async (artistId) => {
  try {
    console.log('🔍 開始載入營業時段，artistId:', artistId)
    const result = await apiRequest(`/artists/${artistId}/availability`)
    
    console.log('📡 API 完整回應:', result)
    
    // 🔥 修正：處理雙層 data 結構
    const availability = result.data?.data?.availability || result.data?.availability
    
    console.log('📅 提取的 availability 資料:', availability)
    
    if (result.success && availability) {
      weeklySchedule.value = {}
      
      // 反向轉換對照表
      const weekdayReverseMap = {
        'Mon': 'monday',
        'Tue': 'tuesday',
        'Wed': 'wednesday', 
        'Thu': 'thursday',
        'Fri': 'friday',
        'Sat': 'saturday',
        'Sun': 'sunday'
      }
      
      // 初始化所有天為關閉狀態
      const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      allDays.forEach(day => {
        weeklySchedule.value[day] = { isOpen: false, timeSlots: [] }
      })
      
      // 轉換 API 回傳格式到前端使用的格式
      Object.keys(availability).forEach(dbDay => {
        console.log(`🔄 處理星期: ${dbDay}`)
        const frontendDay = weekdayReverseMap[dbDay]
        
        if (frontendDay) {
          const timeSlots = availability[dbDay] || []
          console.log(`   時段資料: ${timeSlots}`)
          
          weeklySchedule.value[frontendDay] = {
            isOpen: timeSlots.length > 0,
            timeSlots: timeSlots.map(time => `${time.replace(':00', '')}-${getEndTime(time.replace(':00', ''))}`)
          }
        }
      })
      
      console.log('✅ 轉換後的完整 weeklySchedule:', weeklySchedule.value)
    } else {
      console.warn('⚠️ API 回傳格式不正確或無資料:', result)
      weeklySchedule.value = { ...defaultWeeklySchedule }
    }
  } catch (error) {
    console.error('💥 載入營業時段錯誤:', error)
    weeklySchedule.value = { ...defaultWeeklySchedule }
  }
}

onMounted(async () => {
  const id = route.params.id
  
  // 載入美甲師資料
  await loadArtistData(id)
  
  // 載入營業時段
  await loadArtistSchedule(id)
  
  // 如果是自己的檔案，設定可編輯狀態
  if (id === currentUserId.value) {
    console.log('這是自己的檔案，可以編輯')
  }
  
  // 初始化臨時時段資料
  tempSchedule.value = JSON.parse(JSON.stringify(weeklySchedule.value))
  
  window.scrollTo(0, 0)
  window.addEventListener('scroll', handleScroll)
})

</script>

<style scoped>
.avatar-container {
  position: relative;
}

.avatar-fallback {
  position: absolute;
  top: 0;
  left: 0;
}

.work-image-container {
  background-color: #f9fafb; 
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

input:focus, textarea:focus, select:focus {
  outline: none;
}
</style>