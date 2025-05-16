import axios from 'axios'

// Получаем базовый URL из переменных окружения
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Интерцептор для добавления токена в заголовки запросов
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// API методы для авторизации
export const authAPI = {
  // Регистрация нового абитуриента
  register: (userData) => api.post('/register', userData),
  
  // Вход в систему
  login: (email, password) => 
    api.post('/login', new URLSearchParams({
      'username': email,
      'password': password,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }),
}

// API методы для абитуриентов
export const queueAPI = {
  // Добавление в очередь
  joinQueue: (data) => api.post('/queue', data),
  
  // Получение статуса в очереди
  getStatus: () => api.get('/queue/status'),

  // Отмена очереди
  cancelQueue: () => api.delete('/queue/cancel'),
}

// API методы для сотрудников приемной комиссии
export const admissionAPI = {
  // Получение списка абитуриентов в очереди
  getQueue: (status = null) => 
    api.get('/admission/queue', { params: { status } }),
  
  // Вызов следующего абитуриента в очереди
  processNext: () => api.post('/admission/next'),
  
  // Обновление статуса заявки
  updateEntry: (queueId, data) => 
    api.put(`/admission/queue/${queueId}`, data),
}

// API методы для администратора
export const adminAPI = {
  // Создание нового сотрудника приемной комиссии
  createAdmissionStaff: (userData) => 
    api.post('/admin/create-admission', userData),
}

export default api