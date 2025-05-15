import React, { useState } from 'react'
import QueueStatus from '../../components/QueueStatus/QueueStatus'
import { queueAPI } from '../../api'
import './ApplicantDashboard.css'

const ApplicantDashboard = () => {
  const [inQueue, setInQueue] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [notes, setNotes] = useState('')

  const handleJoinQueue = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      
      await queueAPI.joinQueue({ notes })
      
      setSuccess('Вы успешно добавлены в очередь')
      setInQueue(true)
      setNotes('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при добавлении в очередь')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="applicant-dashboard">
      <h1>Личный кабинет абитуриента</h1>
      
      {/* Секция статуса очереди */}
      <div className="dashboard-section">
        <h2>Ваш статус</h2>
        
        {inQueue ? (
          <QueueStatus />
        ) : (
          <div className="not-in-queue">
            <p>Вы не находитесь в очереди</p>
          </div>
        )}
      </div>
      
      {/* Секция присоединения к очереди */}
      <div className="dashboard-section">
        <h2>Встать в очередь</h2>
        
        {success && (
          <div className="alert alert-success">{success}</div>
        )}
        
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        
        <form onSubmit={handleJoinQueue} className="join-queue-form">
          <div className="form-group">
            <label htmlFor="notes">Примечание (опционально)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Дополнительная информация для сотрудников приемной комиссии"
              rows="3"
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || inQueue}
          >
            {loading ? 'Загрузка...' : 'Встать в очередь'}
          </button>
        </form>
      </div>
      
      {/* Инструкции */}
      <div className="dashboard-section info-section">
        <h2>Информация</h2>
        <div className="info-card">
          <h3>Как работает электронная очередь?</h3>
          <ol>
            <li>Нажмите кнопку "Встать в очередь", чтобы получить номер</li>
            <li>Следите за статусом вашей очереди на этой странице</li>
            <li>Когда ваша очередь подойдет, вы увидите соответствующее уведомление</li>
            <li>Обратитесь к сотруднику приемной комиссии</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default ApplicantDashboard