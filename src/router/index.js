import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Home from '../pages/Home.vue'
import Search from '../pages/Search.vue'
import Profile from '../pages/Profile.vue' 
import Booking from '../pages/Booking.vue' 
import Chat from '../pages/Chat.vue'
import Register from '../pages/Register.vue'
import Appointments from '../pages/Appointments.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/home', component: Home },
  { path: '/search', component: Search },
  { path: '/profile/:id', component: Profile },
  { path: '/booking/:id', component: Booking },
  { path: '/chat', component: Chat },
  { path: '/appointments', component: Appointments },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})


