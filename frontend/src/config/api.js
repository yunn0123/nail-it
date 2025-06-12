// src/config/api.js
// 根據環境變數設定 API base URL

/**
 * - 正式環境：Railway 會經由 VITE_BACKEND_API_URL 注入
 *   例：https://nail-it-backend.up.railway.app
 * - 開發環境：若沒設定，退回 '/api' 走 Vite proxy
 */
const RAW_BASE = import.meta.env.VITE_BACKEND_API_URL?.trim();   // '' | undefined | 'https://…'

export const API_BASE_URL = RAW_BASE
  ? `${RAW_BASE.replace(/\/$/, '')}/api`   // 確保只加一個 /
  : '/api';

// 通用的 API 請求函數
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('🔗 完整 API URL:', url);

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('API Request Error:', error);
    return { success: false, error: error.message };
  }
};
