// Конфигурация API endpoints
// Для работы с разных устройств в локальной сети используйте IP адрес вместо localhost

// Автоматическое определение API URL
// В development: использует localhost или IP из window.location
// В production: использует window.location.origin
function getApiUrl(): string {
  // Проверяем переменную окружения безопасно
  try {
    const envApiUrl = (import.meta as any)?.env?.VITE_API_URL;
    if (envApiUrl) {
      return envApiUrl;
    }
  } catch {
    // Игнорируем ошибку если import.meta.env недоступен
  }

  // В браузере используем текущий hostname для определения IP
  // Это работает если frontend и backend на одном домене/порту
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  // Если это localhost, используем localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3030';
  }
  
  // Иначе используем IP адрес с портом backend
  return `http://${hostname}:3030`;
}

function getWsUrl(): string {
  const apiUrl = getApiUrl();
  // Заменяем http:// на ws://
  return apiUrl.replace(/^http/, 'ws');
}

export const API_URL = getApiUrl();
export const WS_URL = getWsUrl();

// Для отладки - можно вручную указать IP
// Раскомментируйте и замените на ваш IP адрес:
// export const API_URL = 'http://192.168.1.100:3030';
// export const WS_URL = 'ws://192.168.1.100:3030';

if (typeof window !== 'undefined') {
  console.log('🔧 API URL:', API_URL);
  console.log('🔧 WS URL:', WS_URL);
}

