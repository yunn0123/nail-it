import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Home from '../pages/Home.vue'
import Search from '../pages/Search.vue'
import Profile from '../pages/Profile.vue' // 保留原有的美甲師檔案
import CustomerProfile from '../pages/CustomerProfile.vue' // 新增的顧客檔案
import Booking from '../pages/Booking.vue' 
import Chat from '../pages/Chat.vue'
import Register from '../pages/Register.vue'
import Appointments from '../pages/Appointments.vue'
import Reviews from '../pages/Reviews.vue'
import Settings from '../pages/Settings.vue'
import DebugEnv from '../pages/DebugEnv.vue' // 新增環境變數偵錯頁面

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/home', component: Home },
  { path: '/search', component: Search },
  
  // 美甲師檔案 (保持原有路徑)
  { path: '/profile/:id', component: Profile },
  // 顧客檔案 (新增路徑)
  { path: '/profile/customer/:id', component: CustomerProfile },
  
  { path: '/booking/:id', component: Booking },
  { path: '/chat', component: Chat },
  { path: '/appointments', component: Appointments },
  { path: '/reviews', component: Reviews },
  { path: '/settings', component: Settings },
  
  // 偵錯頁面 (僅在開發或測試時使用)
  { path: '/debug-env', component: DebugEnv },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})