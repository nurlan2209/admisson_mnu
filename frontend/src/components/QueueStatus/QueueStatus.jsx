import React, { useState, useEffect } from 'react'
import { queueAPI } from '../../api'
import './QueueStatus.css'

const QueueStatus = () => {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true)
        const response = await queueAPI.getStatus()
        setStatus(response.data)
      } catch (err) {
        setError('Вы не находитесь в очереди')
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()

    // Обновляем статус каждые 30 секунд
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="queue-status-loading">Загрузка статуса очереди...</div>
  }

  if (error) {
    return <div className="queue-status-error">{error}</div>
  }

  const getStatusText = (statusCode) => {
    switch (statusCode) {
      case 'waiting':
        return 'В ожидании'
      case 'in_progress':
        return 'Обрабатывается'
      case 'completed':
        return 'Завершено'
      case 'paused':
        return 'Приостановлено'
      default:
        return 'Неизвестный статус'
    }
  }

  return (
    <div className="queue-status-container">
      <h2>Ваш статус в очереди</h2>
      
      <div className={`status-badge status-${status.status}`}>
        {getStatusText(status.status)}
      </div>
      
      <div className="queue-info">
        {status.status === 'waiting' && (
          <>
            <p className="position">
              <span>Ваша позиция:</span> {status.queue_position} из {status.total_waiting}
            </p>
            <p className="wait-time">
              <span>Примерное время ожидания:</span> 
              {status.estimated_wait_time ? `${status.estimated_wait_time} мин.` : 'Неизвестно'}
            </p>
          </>
        )}
        
        {status.status === 'in_progress' && (
          <p className="in-progress-message">
            Ваша заявка обрабатывается в данный момент
          </p>
        )}
      </div>
    </div>
  )
}

export default QueueStatus