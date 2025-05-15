import React from 'react'
import AdminPanel from '../../components/AdminPanel/AdminPanel'
import './AdminDashboard.css'

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Панель администратора</h1>
      
      <div className="dashboard-content">
        <div className="admin-main">
          <AdminPanel />
        </div>
        
        <div className="sidebar">
          <div className="sidebar-section">
            <h2>Инструкция</h2>
            <div className="instruction-card">
              <h3>Управление сотрудниками:</h3>
              <ul>
                <li>
                  <strong>Создание сотрудника</strong> - заполните форму, чтобы создать нового сотрудника приемной комиссии
                </li>
                <li>
                  <strong>ФИО</strong> - полное имя сотрудника
                </li>
                <li>
                  <strong>Email</strong> - будет использоваться для входа в систему
                </li>
                <li>
                  <strong>Телефон</strong> - контактный номер телефона сотрудника
                </li>
                <li>
                  <strong>Пароль</strong> - временный пароль для первого входа (рекомендуется сменить после первого входа)
                </li>
              </ul>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h2>Примечание</h2>
            <div className="note-card">
              <p>
                После создания сотрудника, он сможет войти в систему с указанными учетными данными и получит доступ к панели управления очередью.
              </p>
              <p>
                Сотрудники приемной комиссии могут:
              </p>
              <ul>
                <li>Просматривать очередь абитуриентов</li>
                <li>Управлять статусами заявок</li>
                <li>Вызывать следующего абитуриента</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard