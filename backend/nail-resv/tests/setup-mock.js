// 測試環境設定檔案
require('dotenv').config({ path: '.env.test' });

// 設定測試環境變數
process.env.NODE_ENV = 'test';
process.env.PORT = 3001; // 使用不同的端口避免衝突
process.env.SUPABASE_URL = 'https://mock-supabase-url.supabase.co';
process.env.SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.SUPABASE_SERVICE_KEY = 'mock-service-key';

// 測試超時設定
jest.setTimeout(15000);

// Mock 數據回應 - 模擬不同表格的回應
const mockResponses = {
  customers: {
    single: {
      user_id: 'customer-123',
      user_name: 'Test Customer',
      avatar_url: 'https://example.com/avatar.jpg',
      email: 'customer@test.com',
      phone: '0912345678'
    },
    list: [
      {
        user_id: 'customer-123',
        user_name: 'Test Customer',
        avatar_url: 'https://example.com/avatar.jpg'
      }
    ],
    error: null
  },
  artists: {
    single: {
      user_id: 'artist-123',
      studio_name: 'Test Studio',
      rating: 4.7,
      styles: ['法式', '光療'],
      city: '台北市',
      district: '信義區',
      price_min: 800,
      price_max: 1500
    },
    list: [
      {
        user_id: 'artist-1',
        studio_name: 'Beautiful Nails',
        rating: 4.8,
        styles: ['法式', '光療'],
        city: '台北市',
        district: '信義區'
      },
      {
        user_id: 'artist-2',
        studio_name: 'Elegant Nails',
        rating: 4.6,
        styles: ['手繪', '水晶'],
        city: '台北市',
        district: '大安區'
      }
    ],
    search: [
      {
        user_id: 'artist-1',
        studio_name: '法式美甲專門店',
        city: '台北市',
        district: '信義區',
        styles: ['法式', '光療'],
        price_min: 800,
        price_max: 1500,
        rating: 4.8
      }
    ],
    error: null
  },
  availability: {
    single: {
      artist_id: 'artist-123',
      date: '2025-06-10',
      available_slots: [
        { time: '10:00', available: true },
        { time: '14:00', available: true }
      ]
    },
    list: [
      {
        artist_id: 'artist-123',
        date: '2025-06-10',
        available_slots: [
          { time: '10:00', available: true },
          { time: '14:00', available: true }
        ]
      },
      {
        artist_id: 'artist-123',
        date: '2025-06-11',
        available_slots: [
          { time: '11:00', available: true },
          { time: '15:00', available: true }
        ]
      }
    ],
    error: null
  },
  reservations: {
    single: {
      id: 'reservation-123',
      service_type: '法式美甲',
      status: 'confirmed',
      appointment_date: '2025-06-10',
      appointment_time: '10:00',
      customer: {
        user_name: 'Test Customer'
      },
      artist: {
        studio_name: 'Test Studio'
      }
    },
    list: [
      {
        id: 'reservation-123',
        service_type: '法式美甲',
        status: 'confirmed',
        appointment_date: '2025-06-10',
        appointment_time: '10:00'
      }
    ],
    error: null
  },
  works: {
    list: [
      {
        id: 'work-1',
        artist_id: 'artist-123',
        title: '法式美甲作品',
        description: '優雅的法式美甲設計',
        image_url: 'https://example.com/work1.jpg',
        tags: ['法式', '簡約'],
        created_at: '2025-06-01T10:00:00Z'
      }
    ],
    error: null
  }
};

// 創建智能 Mock - 根據測試上下文回傳適當數據
function createSmartMock(tableName) {
  const tableData = mockResponses[tableName] || { single: null, list: [], error: null };
  
  // 創建鏈式方法模擬器
  const createChainableMethods = (data = tableData.list, error = null) => ({
    select: jest.fn().mockReturnValue(createChainableMethods(data, error)),
    eq: jest.fn((column, value) => {
      const shouldReturnData = value !== 'nonexistent-id' && value !== 'nonexistent-artist';
      const resultData = shouldReturnData ? data : [];
      const resultError = shouldReturnData ? null : { message: 'No rows returned' };
      
      return {
        ...createChainableMethods(resultData, resultError),
        single: jest.fn().mockResolvedValue({
          data: shouldReturnData ? tableData.single : null,
          error: resultError
        })
      };
    }),
    not: jest.fn((column, operator, value) => createChainableMethods(data, error)),
    ilike: jest.fn((column, pattern) => createChainableMethods(tableData.search || data, error)),
    order: jest.fn(() => createChainableMethods(data, error)),
    limit: jest.fn(() => Promise.resolve({ data, error })),
    single: jest.fn(() => Promise.resolve({ 
      data: data?.[0] || tableData.single, 
      error: data?.length ? null : { message: 'No rows returned' }
    })),
    then: jest.fn((callback) => callback({ data, error })),
    // 添加 Promise 接口支持
    [Symbol.toStringTag]: 'Promise'
  });
  
  return {
    select: jest.fn((columns = '*') => {
      return {
        ...createChainableMethods(),
        eq: jest.fn((column, value) => {
          const shouldReturnData = value !== 'nonexistent-id' && value !== 'nonexistent-artist';
          const resultData = shouldReturnData ? tableData.list : [];
          const resultError = shouldReturnData ? null : { message: 'No rows returned' };
          
          return {
            ...createChainableMethods(resultData, resultError),
            single: jest.fn().mockResolvedValue({
              data: shouldReturnData ? tableData.single : null,
              error: resultError
            })
          };
        }),
        not: jest.fn((column, operator, value) => createChainableMethods()),
        ilike: jest.fn((column, pattern) => createChainableMethods(tableData.search || tableData.list)),
        order: jest.fn(() => createChainableMethods()),
        limit: jest.fn(() => Promise.resolve({ data: tableData.list, error: null })),
        single: jest.fn(() => Promise.resolve({ data: tableData.single, error: null }))
      };
    }),
    insert: jest.fn((data) => ({
      select: jest.fn().mockResolvedValue({
        data: [{ 
          id: 'mock-id-' + Date.now(), 
          ...data,
          created_at: new Date().toISOString() 
        }],
        error: null
      })
    })),
    update: jest.fn((data) => ({
      eq: jest.fn((column, value) => ({
        select: jest.fn().mockResolvedValue({
          data: [{ 
            id: value,
            ...data,
            updated_at: new Date().toISOString() 
          }],
          error: null
        })
      }))
    })),
    delete: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null
      })
    })
  };
}

// 全域 Supabase Mock - 完全不會連接真實數據庫
global.mockSupabase = {
  from: jest.fn((tableName) => createSmartMock(tableName)),
  auth: {
    signUp: jest.fn(({ email, password }) => {
      // 模擬成功註冊
      return Promise.resolve({
        data: { 
          user: { 
            id: email.includes('test') ? 'test-user-id' : 'test-artist-id', 
            email: email,
            created_at: new Date().toISOString()
          } 
        },
        error: null
      });
    }),
    signInWithPassword: jest.fn(({ email, password }) => {
      // 模擬成功登入
      return Promise.resolve({
        data: { 
          user: { 
            id: 'test-user-id', 
            email: email,
            last_sign_in_at: new Date().toISOString()
          },
          session: {
            access_token: 'mock-access-token'
          }
        },
        error: null
      });
    }),
    signOut: jest.fn(() => Promise.resolve({
      error: null
    }))
  }
};

// 全域測試設定
beforeAll(async () => {
  console.log('🧪 開始執行單元測試...');
  console.log('使用 Mock 模式 - 不會操作真實數據庫');
});

afterAll(async () => {
  console.log('單元測試執行完成');
});

// 全域錯誤處理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未處理的 Promise 拒絕:', reason);
});

module.exports = {
  mockResponses,
  createSmartMock
};
