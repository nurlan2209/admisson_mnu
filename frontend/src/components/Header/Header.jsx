import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { FaChevronDown } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Состояние для управления видимостью выпадающего меню
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Обработчик смены языка
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLanguageMenuOpen(false); // Закрываем меню после выбора
  };

  // Текущий язык для отображения
  const currentLanguageLabel = () => {
    switch (i18n.language) {
      case 'ru':
        return 'Русский';
      case 'kk':
        return 'Қазақша';
      case 'en':
        return 'English';
      default:
        return 'Русский';
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              <img src="/logo.svg" alt="MNU Logo" className="logo-image" />
            </Link>
          </div>
          <nav className="nav">
            {/* Переключатель языка */}
            <div
              className="language-switcher"
              onMouseEnter={() => setIsLanguageMenuOpen(true)}
              onMouseLeave={() => setIsLanguageMenuOpen(false)}
            >
              <span className="language-text">
                {currentLanguageLabel()}
                <FaChevronDown className={`chevron-icon ${isLanguageMenuOpen ? 'rotated' : ''}`} />
              </span>
              {isLanguageMenuOpen && (
                <ul className="language-menu">
                  <li>
                    <button onClick={() => changeLanguage('ru')}>
                      Русский
                    </button>
                  </li>
                  <li>
                    <button onClick={() => changeLanguage('kk')}>
                      Қазақша
                    </button>
                  </li>
                  <li>
                    <button onClick={() => changeLanguage('en')}>
                      English
                    </button>
                  </li>
                </ul>
              )}
            </div>

            {isAuthenticated ? (
              <div className="user-nav">
                <span className="user-name">
                  {user.full_name} (
                  {user.role === 'admission'
                    ? t('header.roleAdmission')
                    : t('header.roleAdmin')}
                  )
                </span>
                <button onClick={handleLogout} className="btn btn-secondary">
                  {t('header.logoutButton')}
                </button>
              </div>
            ) : (
              <div className="auth-nav">
                {window.location.pathname !== '/queue' && (
                  <Link to="/queue" className="btn btn-primary">
                    {t('header.joinQueueButton')}
                  </Link>
                )}
                <Link to="/login" className="btn btn-secondary2">
                  {t('header.staffLoginButton')}
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;