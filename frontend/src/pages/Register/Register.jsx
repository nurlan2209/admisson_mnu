import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthForm from '../../components/AuthForm/AuthForm'
import './Register.css'

const Register = () => {
  const { register, login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleRegister = async (formData) => {
    try {
      setLoading(true)
      setError(null)
      
      // Регистрация пользователя
      await register(formData)
      
      // После успешной регистрации выполняем автоматический вход
      await login(formData.email, formData.password)
      
      // Перенаправляем на страницу абитуриента
      navigate('/applicant')
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="auth-container">
        <h1>Регистрация</h1>
        <p className="auth-description">
          Создайте аккаунт, чтобы использовать систему электронной очереди
        </p>
        
        <AuthForm 
          isLogin={false}
          onSubmit={handleRegister}
          loading={loading}
          error={error}
        />
        
        <div className="auth-footer">
          <p>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register