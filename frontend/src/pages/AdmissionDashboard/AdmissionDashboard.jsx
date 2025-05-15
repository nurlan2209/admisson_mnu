import React from 'react'
import AdmissionQueue from '../../components/AdmissionQueue/AdmissionQueue'
import './AdmissionDashboard.css'

const AdmissionDashboard = () => {
  return (
    <div className="admission-dashboard">
      <h1>Панель управления очередью</h1>
      
      <div className="dashboard-content">
        <div className="queue-management">
          <AdmissionQueue />
        </div>
        
        <div className="sidebar">
          <div className="sidebar-section">
            <h2>Инструкция</h2>
            <div className="instruction-card">
              <h3>Управление очередью:</h3>
              <ul>
                <li><strong>Фильтр "Все"</strong> - показывает все заявки</li>
                <li><strong>Фильтр "Ожидающие"</strong> - показывает ожидающих абитуриентов</li>
                <li><strong>Фильтр "В обработке"</strong> - показывает абитуриентов, с которыми сейчас работают</li>
                <li><strong>Кнопка "Вызвать следующего"</strong> - автоматически перемещает следующего ожидающего абитуриента в статус "В обработке"</li>
              </ul>
              
              <h3>Действия с заявками:</h3>
              <ul>
                <li><strong>Начать</strong> - начать работу с абитуриентом</li>
                <li><strong>Завершить</strong> - отметить заявку как обработанную</li>
                <li><strong>Пауза</strong> - временно приостановить обработку заявки</li>
                <li><strong>Вернуть</strong> - вернуть заявку в очередь из паузы</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdmissionDashboard