import React from 'react';
import AdmissionQueue from '../../components/AdmissionQueue/AdmissionQueue';
import { useTranslation } from 'react-i18next';
import { FaChevronDown } from 'react-icons/fa';
import './AdmissionDashboard.css';

const AdmissionDashboard = () => {
  const { t, i18n } = useTranslation();

  // Обработчик смены языка
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="admission-dashboard">

      <h1>{t('admissionDashboard.title')}</h1>

      <div className="dashboard-content">
        <div className="queue-management">
          <AdmissionQueue />
        </div>

        <div className="sidebar">
          <div className="sidebar-section">
            <h2>{t('admissionDashboard.instructionsTitle')}</h2>
            <div className="instruction-card">
              <h3>{t('admissionDashboard.queueManagementTitle')}</h3>
              <ul>
                <li>
                  <strong>{t('admissionDashboard.allFilter')}</strong> - {t('admissionDashboard.allFilterDesc')}
                </li>
                <li>
                  <strong>{t('admissionDashboard.waitingFilter')}</strong> -{' '}
                  {t('admissionDashboard.waitingFilterDesc')}
                </li>
                <li>
                  <strong>{t('admissionDashboard.inProgressFilter')}</strong> -{' '}
                  {t('admissionDashboard.inProgressFilterDesc')}
                </li>
                <li>
                  <strong>{t('admissionDashboard.processNextButton')}</strong> -{' '}
                  {t('admissionDashboard.processNextDesc')}
                </li>
              </ul>

              <h3>{t('admissionDashboard.actionsTitle')}</h3>
              <ul>
                <li>
                  <strong>{t('admissionDashboard.startAction')}</strong> -{' '}
                  {t('admissionDashboard.startActionDesc')}
                </li>
                <li>
                  <strong>{t('admissionDashboard.completeAction')}</strong> -{' '}
                  {t('admissionDashboard.completeActionDesc')}
                </li>
                <li>
                  <strong>{t('admissionDashboard.pauseAction')}</strong> -{' '}
                  {t('admissionDashboard.pauseActionDesc')}
                </li>
                <li>
                  <strong>{t('admissionDashboard.resumeAction')}</strong> -{' '}
                  {t('admissionDashboard.resumeActionDesc')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionDashboard;