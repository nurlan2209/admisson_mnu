// frontend/src/components/QueueStatusCheck/QueueStatusCheck.jsx
import React, { useState } from 'react';
import { queueAPI } from '../../api';
import './QueueStatusCheck.css';

const QueueStatusCheck = () => {
  const [fullName, setFullName] = useState('');
  const [queueEntry, setQueueEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Состояние для отображения модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Проверка статуса заявки по ФИО
  const handleCheckQueue = async (e) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      setError('Введите ФИО');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setQueueEntry(null);
      
      const response = await queueAPI.checkQueueByName(fullName);
      setQueueEntry(response.data);
      setIsModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Заявка не найдена');
    } finally {
      setLoading(false);
    }
  };

  // Отмена заявки
  const handleCancelQueue = async (queueId) => {
    if (!window.confirm('Вы уверены, что хотите отменить заявку?')) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await queueAPI.cancelQueueById(queueId);
      setSuccess('Заявка успешно отменена');
      setQueueEntry(null);
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при отмене заявки');
    } finally {
      setLoading(false);
    }
  };

  // Перемещение назад в очереди
  const handleMoveBack = async (queueId) => {
    if (!window.confirm('Переместить заявку в конец очереди?')) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await queueAPI.moveBackInQueue(queueId);
      setQueueEntry(response.data);
      setSuccess('Позиция в очереди изменена');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при изменении позиции');
    } finally {
      setLoading(false);
    }
  };

  // Закрытие модального окна
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Получение текстового представления статуса
  const getStatusText = (status) => {
    switch (status) {
      case 'waiting':
        return 'В ожидании';
      case 'in_progress':
        return 'Обрабатывается';
      case 'completed':
        return 'Завершено';
      case 'paused':
        return 'Приостановлено';
      default:
        return 'Неизвестный статус';
    }
  };

  return (
    <div className="queue-status-check">
      {success && (
        <div className="alert alert-success">{success}</div>
      )}
      
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      
      <form onSubmit={handleCheckQueue} className="status-check-form">
        <div className="form-group">
          <label htmlFor="fullName">ФИО для проверки статуса</label>
          <div className="input-with-button">
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Введите своё ФИО"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Поиск...' : 'Проверить статус'}
            </button>
          </div>
        </div>
      </form>
      
      {/* Модальное окно с информацией о заявке */}
      {isModalOpen && queueEntry && (
        <div className="status-modal-overlay" onClick={closeModal}>
          <div className="status-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>&times;</button>
            
            <div className="modal-header">
              <h3>Информация о заявке</h3>
              <span className={`status-badge status-${queueEntry.status}`}>
                {getStatusText(queueEntry.status)}
              </span>
            </div>
            
            <div className="modal-body">
              <div className="info-row">
                <span className="info-label">ФИО:</span>
                <span className="info-value">{queueEntry.full_name}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Номер телефона:</span>
                <span className="info-value">{queueEntry.phone}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Номер в очереди:</span>
                <span className="info-value">{queueEntry.queue_number}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Программы:</span>
                <span className="info-value">{queueEntry.programs.join(', ')}</span>
              </div>
              
              {queueEntry.position && (
                <div className="info-row">
                  <span className="info-label">Текущая позиция:</span>
                  <span className="info-value">{queueEntry.position}</span>
                </div>
              )}
              
              {queueEntry.people_ahead !== undefined && (
                <div className="info-row">
                  <span className="info-label">Людей впереди:</span>
                  <span className="info-value">{queueEntry.people_ahead}</span>
                </div>
              )}
              
              {queueEntry.estimated_time && (
                <div className="info-row">
                  <span className="info-label">Примерное время ожидания:</span>
                  <span className="info-value">{queueEntry.estimated_time} мин.</span>
                </div>
              )}
              
              <div className="info-row">
                <span className="info-label">Создано:</span>
                <span className="info-value">
                  {new Date(queueEntry.created_at).toLocaleString('ru-RU')}
                </span>
              </div>
            </div>
            
            <div className="modal-footer">
              {queueEntry.status === 'waiting' && (
                <button 
                  className="btn btn-warning"
                  onClick={() => handleMoveBack(queueEntry.id)}
                  disabled={loading}
                >
                  {loading ? 'Обработка...' : 'Переместить в конец'}
                </button>
              )}
              
              {(queueEntry.status === 'waiting' || queueEntry.status === 'in_progress') && (
                <button 
                  className="btn btn-danger"
                  onClick={() => handleCancelQueue(queueEntry.id)}
                  disabled={loading}
                >
                  {loading ? 'Отмена...' : 'Отменить заявку'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueStatusCheck;