import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Header.css'

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">Электронная очередь</Link>
          </div>
          <nav className="nav">
            {isAuthenticated ? (
              <div className="user-nav">
                <span className="user-name">
                  {user.full_name} ({user.role === 'applicant' 
                    ? 'Абитуриент' 
                    : user.role === 'admission' 
                      ? 'Сотрудник' 
                      : 'Администратор'})
                </span>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Выйти
                </button>
              </div>
            ) : (
              <div className="auth-nav">
                <Link to="/login" className="btn btn-primary">
                  Вход
                </Link>
                <Link to="/register" className="btn btn-secondary">
                  Регистрация
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header