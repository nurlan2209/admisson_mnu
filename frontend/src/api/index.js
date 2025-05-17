import axios from 'axios';

// Получаем базовый URL из переменных окружения
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена в заголовки запросов
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API методы для авторизации
export const authAPI = {
  /**
   * Регистрация нового абитуриента
   * @param {Object} userData - Данные пользователя для регистрации
   * @returns {Promise} - Ответ от сервера
   */
  register: (userData) => api.post('/register', userData),
  
  /**
   * Вход в систему
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise} - Ответ от сервера
   */
  login: (email, password) => 
    api.post('/login', new URLSearchParams({
      username: email,
      password,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }),
};

// API методы для абитуриентов
export const queueAPI = {
  /**
   * Добавление в очередь
   * @param {Object} data - Данные для добавления в очередь
   * @returns {Promise} - Ответ от сервера
   */
  joinQueue: (data) => api.post('/queue', data),
  
  /**
   * Получение статуса в очереди
   * @returns {Promise} - Ответ от сервера
   */
  getStatus: () => api.get('/queue/status'),

  /**
   * Отмена очереди
   * @returns {Promise} - Ответ от сервера
   */
  cancelQueue: () => api.delete('/queue/cancel'),
};

// API методы для сотрудников приемной комиссии
export const admissionAPI = {
  /**
   * Получение списка абитуриентов в очереди
   * @param {Object|null} params - Параметры фильтрации (например, { status: 'waiting' })
   * @returns {Promise} - Ответ от сервера
   */
  getQueue: (params = null) => 
    api.get('/admission/queue', { params }),
  
  /**
   * Вызов следующего абитуриента в очереди
   * @returns {Promise} - Ответ от сервера
   */
  processNext: () => api.post('/admission/next'),
  
  /**
   * Обновление статуса заявки
   * @param {string|number} queueId - ID заявки
   * @param {Object} data - Данные для обновления (например, { status: 'completed' })
   * @returns {Promise} - Ответ от сервера
   */
  updateEntry: (queueId, data) => 
    api.put(`/admission/queue/${queueId}`, data),

  /**
   * Удаление заявки из очереди
   * @param {string|number} queueId - ID заявки
   * @returns {Promise} - Ответ от сервера
   */
  deleteEntry: (queueId) => api.delete(`/admission/queue/${queueId}`),
};

// API методы для администратора
export const adminAPI = {
  /**
   * Создание нового сотрудника приемной комиссии
   * @param {Object} userData - Данные сотрудника
   * @returns {Promise} - Ответ от сервера
   */
  createAdmissionStaff: (userData) => 
    api.post('/admin/create-admission', userData),
};

export default api;