import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthForm from '../../components/AuthForm/AuthForm'
import './Login.css'

const Login = () => {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (formData) => {
    try {
      setLoading(true)
      setError(null)
      await login(formData.email, formData.password)
    } catch (err) {
      setError('Неверный email или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="auth-container">
        <h1>Вход в систему</h1>
        <p className="auth-description">
          Введите ваши учетные данные для входа в электронную очередь
        </p>
        
        <AuthForm 
          isLogin={true}
          onSubmit={handleLogin}
          loading={loading}
          error={error}
        />
        
        <div className="auth-footer">
          <p>
            Еще не зарегистрированы? <Link to="/register">Создать аккаунт</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login