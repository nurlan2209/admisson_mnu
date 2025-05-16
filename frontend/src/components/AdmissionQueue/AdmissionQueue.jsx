import React, { useState, useEffect } from 'react'
import { admissionAPI } from '../../api'
import './AdmissionQueue.css'

const AdmissionQueue = () => {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    fetchQueue()
  }, [activeFilter])

const fetchQueue = async () => {
  try {
    setLoading(true)
    const response = await admissionAPI.getQueue(
      activeFilter !== 'all' ? activeFilter : null
    )
    
    // Детальное логирование
    console.log('Full API response:', response)
    console.log('Queue data:', response.data)
    
    // Если у нас есть данные, проверим первый элемент (если он есть)
    if (response.data && response.data.length > 0) {
      console.log('First queue entry:', response.data[0])
      console.log('User data in first entry:', response.data[0].user)
    }
    
    setQueue(response.data || []) // Защита от null/undefined
    setError(null)
  } catch (err) {
    console.error('Error fetching queue:', err)
    setError('Ошибка при загрузке очереди')
  } finally {
    setLoading(false)
  }
}

  const handleProcessNext = async () => {
    try {
      await admissionAPI.processNext()
      // Обновляем очередь после успешного вызова
      fetchQueue()
    } catch (err) {
      setError('Ошибка при обработке следующего абитуриента')
    }
  }

  const handleUpdateStatus = async (queueId, status) => {
    try {
      await admissionAPI.updateEntry(queueId, { status })
      // Обновляем очередь после изменения статуса
      fetchQueue()
    } catch (err) {
      setError('Ошибка при обновлении статуса')
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'waiting':
        return 'В ожидании'
      case 'in_progress':
        return 'Обрабатывается'
      case 'completed':
        return 'Завершено'
      case 'paused':
        return 'Приостановлено'
      default:
        return 'Неизвестно'
    }
  }

  return (
    <div className="admission-queue">
      <div className="queue-controls">
        <h2>Управление очередью</h2>
        
        <div className="filter-buttons">
          <button 
            className={`btn ${activeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter('all')}
          >
            Все
          </button>
          <button 
            className={`btn ${activeFilter === 'waiting' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter('waiting')}
          >
            Ожидающие
          </button>
          <button 
            className={`btn ${activeFilter === 'in_progress' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter('in_progress')}
          >
            В обработке
          </button>
        </div>
        
        <button 
          className="btn btn-success process-next-btn"
          onClick={handleProcessNext}
        >
          Вызвать следующего
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p className="loading-text">Загрузка очереди...</p>
      ) : queue.length === 0 ? (
        <p className="empty-queue">В очереди никого нет</p>
      ) : (
        <table className="queue-table">
          <thead>
            <tr>
              <th>№</th>
              <th>ФИО</th>
              <th>Статус</th>
              <th>Время</th>
              <th>Действия</th>
            </tr>
          </thead>
            <tbody>
            {queue && queue.length > 0 ? (
                queue.map((entry) => (
                <tr key={entry?.id || Math.random()} className={`status-${entry?.status || 'unknown'}`}>
                    <td>{entry?.queue_number || 'N/A'}</td>
                    <td>{entry?.user?.full_name || 'Неизвестно'}</td>
                    <td>
                    <span className={`status-badge status-${entry?.status || 'unknown'}`}>
                        {getStatusText(entry?.status || 'unknown')}
                    </span>
                    </td>
                    <td>{entry?.created_at ? new Date(entry.created_at).toLocaleTimeString() : 'N/A'}</td>
                    <td className="actions">
                    {entry?.status === 'waiting' && (
                        <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleUpdateStatus(entry.id, 'in_progress')}
                        >
                        Начать
                        </button>
                    )}
                    
                    {entry?.status === 'in_progress' && (
                        <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleUpdateStatus(entry.id, 'completed')}
                        >
                        Завершить
                        </button>
                    )}
                    
                    {(entry?.status === 'waiting' || entry?.status === 'in_progress') && (
                        <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleUpdateStatus(entry.id, 'paused')}
                        >
                        Пауза
                        </button>
                    )}
                    
                    {entry?.status === 'paused' && (
                        <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleUpdateStatus(entry.id, 'waiting')}
                        >
                        Вернуть
                        </button>
                    )}
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                <td colSpan="5" className="text-center">Нет данных для отображения</td>
                </tr>
            )}
            </tbody>
        </table>
      )}
    </div>
  )
}

export default AdmissionQueue