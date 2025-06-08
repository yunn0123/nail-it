import { useRouter } from 'vue-router'
import { apiRequest } from './config/api.js'  // 改成 ./ 

export const logout = async () => {
  try {
    // 呼叫後端登出 API
    const result = await apiRequest('/logout', { method: 'POST' })
    
    if (result.success) {
      // 清除本地儲存的用戶資料
      localStorage.removeItem('userId')
      localStorage.removeItem('userType')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userName')
      
      console.log('登出成功，已清除本地資料')
      return true
    } else {
      throw new Error(result.error || '登出失敗')
    }
  } catch (error) {
    console.error('登出錯誤:', error)
    // 即使後端登出失敗，也要清除本地資料
    localStorage.removeItem('userId')
    localStorage.removeItem('userType')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    alert('登出時發生錯誤，但已清除本地資料')
    return true
  }
}

export const useLogout = () => {
  const router = useRouter()
  
  const handleLogout = async () => {
    const success = await logout()
    if (success) {
      alert('已成功登出')
      router.push('/login')
    }
  }
  
  return { handleLogout }
}