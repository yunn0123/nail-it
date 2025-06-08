#!/usr/bin/env node

/**
 * API 文檔測試腳本
 * 這個腳本會測試 API 文檔的各個端點是否正常運作
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:4000';

// 顏色輸出函式
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 測試 HTTP 端點
function testEndpoint(path, expectedContentType = 'text/html') {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const success = res.statusCode === 200;
        const contentType = res.headers['content-type'] || '';
        
        resolve({
          path,
          success,
          statusCode: res.statusCode,
          contentType,
          hasContent: data.length > 0,
          dataLength: data.length
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        path,
        success: false,
        error: err.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        path,
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

// 檢查文件是否存在
function checkFiles() {
  const files = [
    'openapi.yaml',
    'swagger-ui.html',
    'API_DOCS_README.md'
  ];

  log('blue', '\n📁 檢查 API 文檔文件...');
  
  for (const file of files) {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    
    if (exists) {
      const stats = fs.statSync(filePath);
      log('green', `✅ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    } else {
      log('red', `❌ ${file} (文件不存在)`);
    }
  }
}

// 主要測試函式
async function runTests() {
  log('blue', '🚀 開始測試美甲標註 API 文檔...\n');

  // 檢查文件
  checkFiles();

  // 測試端點
  log('blue', '\n🌐 測試 HTTP 端點...');
  
  const endpoints = [
    { path: '/', description: '首頁' },
    { path: '/swagger-ui.html', description: 'Swagger UI' },
    { path: '/openapi.yaml', description: 'OpenAPI 規格', contentType: 'text/yaml' },
    { path: '/api/tag', description: 'API 標註端點 (應該是 405 Method Not Allowed)' }
  ];

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.path, endpoint.contentType);
    
    if (result.success) {
      log('green', `✅ ${endpoint.description} (${result.statusCode}) - ${result.dataLength} bytes`);
    } else if (result.statusCode === 405 && endpoint.path === '/api/tag') {
      // POST 端點用 GET 請求會返回 405，這是正常的
      log('yellow', `⚠️  ${endpoint.description} (${result.statusCode}) - Method Not Allowed (正常)`);
    } else {
      log('red', `❌ ${endpoint.description} - ${result.error || `Status: ${result.statusCode}`}`);
    }
  }

  // 檢查 OpenAPI 規格有效性
  log('blue', '\n📋 檢查 OpenAPI 規格...');
  try {
    const yamlContent = fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8');
    
    // 基本檢查
    const hasOpenAPI = yamlContent.includes('openapi:');
    const hasInfo = yamlContent.includes('info:');
    const hasPaths = yamlContent.includes('paths:');
    const hasComponents = yamlContent.includes('components:');
    
    if (hasOpenAPI && hasInfo && hasPaths && hasComponents) {
      log('green', '✅ OpenAPI 規格格式正確');
    } else {
      log('red', '❌ OpenAPI 規格格式可能有問題');
    }
    
    // 檢查美甲標註相關內容
    const hasNailContent = yamlContent.includes('美甲標註') || yamlContent.includes('nail');
    const hasTagEndpoint = yamlContent.includes('/tag:');
    
    if (hasNailContent && hasTagEndpoint) {
      log('green', '✅ 包含美甲標註相關內容');
    } else {
      log('red', '❌ 缺少美甲標註相關內容');
    }
    
  } catch (error) {
    log('red', `❌ 無法讀取 OpenAPI 文件: ${error.message}`);
  }

  // 提供使用說明
  log('blue', '\n📚 使用說明:');
  log('green', `1. 確保伺服器正在運行: ${BASE_URL}`);
  log('green', `2. 開啟瀏覽器訪問: ${BASE_URL}/swagger-ui.html`);
  log('green', `3. 或訪問首頁: ${BASE_URL}/`);
  log('green', `4. 查看 API 文檔: ${BASE_URL}/openapi.yaml`);

  log('blue', '\n✨ 測試完成！');
}

// 檢查伺服器是否運行
async function checkServer() {
  log('blue', '🔍 檢查伺服器狀態...');
  
  const result = await testEndpoint('/');
  
  if (result.success) {
    log('green', '✅ 伺服器正在運行');
    await runTests();
  } else {
    log('red', '❌ 伺服器未運行或無法連接');
    log('yellow', '請先啟動伺服器: npm run dev 或 npm start');
    log('yellow', `確保伺服器運行在 ${BASE_URL}`);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  checkServer().catch(console.error);
}

module.exports = {
  testEndpoint,
  checkFiles,
  runTests
}; 