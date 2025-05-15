import React, { useState } from 'react'
import { adminAPI } from '../../api'
import './AdminPanel.css'

const AdminPanel = () => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      await adminAPI.createAdmissionStaff(formData)
      
      setSuccess('Сотрудник приемной комиссии успешно создан')
      
      // Сбрасываем форму
      setFormData({
        email: '',
        full_name: '',
        phone: '',
        password: '',
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при создании сотрудника')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-panel">
      <h2>Создать сотрудника приемной комиссии</h2>
      
      {success && (
        <div className="alert alert-success">{success}</div>
      )}
      
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="full_name">ФИО сотрудника</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Телефон</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Создание...' : 'Создать сотрудника'}
        </button>
      </form>
    </div>
  )
}

export default AdminPanel