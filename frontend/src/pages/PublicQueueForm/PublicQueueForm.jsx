import React, { useState, useEffect } from 'react';
// import ReCAPTCHA from 'react-google-recaptcha';
import api from '../../api';
import QueueStatusCheck from '../../components/QueueStatusCheck/QueueStatusCheck';
import { useTranslation } from 'react-i18next';
import { FaChevronDown } from 'react-icons/fa';
import './PublicQueueForm.css';

// Программы по категориям (ключи для переводов)
const BACHELOR_PROGRAMS = [
  'accounting',
  'appliedLinguistics',
  'economicsDataScience',
  'finance',
  'hospitality',
  'internationalJournalism',
  'internationalLaw',
  'internationalRelations',
  'it',
  'jurisprudence',
  'management',
  'marketing',
  'psychology',
  'tourism',
  'translation',
];

const MASTER_PROGRAMS = [
  'politicalInternationalRelations',
  'appliedLinguistics',
  'competitionLaw',
  'consultingPsychology',
  'economics',
  'finance',
  'intellectualPropertyLaw',
  'internationalLaw',
  'itLaw',
  'jurisprudence',
  'translation',
];

const DOCTORATE_PROGRAMS = ['law', 'phdEconomics'];

const PublicQueueForm = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    programs: [],
    notes: '',
  });

  // const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [categoryStates, setCategoryStates] = useState({
    bachelor: false,
    master: false,
    doctorate: false,
  });

  const [queueCount, setQueueCount] = useState(null);

  const fetchQueueCount = async () => {
    try {
      const response = await api.get('/api/public/queue/count');
      setQueueCount(response.data.count);
    } catch (e) {
      setQueueCount(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProgramChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        programs: [...formData.programs, value],
      });
    } else {
      setFormData({
        ...formData,
        programs: formData.programs.filter((program) => program !== value),
      });
    }
  };

  // const handleCaptchaChange = (token) => {
  //   setCaptchaToken(token);
  // };

  const toggleCategory = (category) => {
    setCategoryStates({
      ...categoryStates,
      [category]: !categoryStates[category],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!captchaToken) {
    //   setError(t('publicQueueForm.captchaError'));
    //   return;
    // }

    try {
      setLoading(true);
      setError(null);

      await api.post('/api/public/queue', {
        ...formData,
        // captcha_token: captchaToken,
      });

      setSuccess(true);

      await fetchQueueCount();

      setFormData({
        full_name: '',
        phone: '',
        programs: [],
        notes: '',
      });
    } catch (err) {
      setError(err.response?.data?.detail || t('publicQueueForm.error'));
    } finally {
      setLoading(false);
    }
  };

  // Обработчик смены языка
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  if (success) {
    return (
      <div className="public-form-container">
        <div className="success-message">

          <h2>{t('publicQueueForm.successTitle')}</h2>
          <p>{t('publicQueueForm.successMessage')}</p>
          {queueCount !== null && (
            <p>
              {t('publicQueueForm.queuePosition')}{' '}
              <strong>{queueCount}</strong>
            </p>
          )}

          <button
            className="btn btn-primary"
            onClick={() => setSuccess(false)}
            style={{ marginTop: '1rem' }}
          >
            {t('publicQueueForm.backButton')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-form-container">

      <h1>{t('publicQueueForm.title')}</h1>

      <p className="form-description">{t('publicQueueForm.description')}</p>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="public-queue-form">
        <div className="form-group">
          <label htmlFor="full_name">{t('publicQueueForm.fullNameLabel')}</label>
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
          <label htmlFor="phone">{t('publicQueueForm.phoneLabel')}</label>
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
          <label>{t('publicQueueForm.programsLabel')}</label>
          <div className="programs-list">
            <div className="category-header" onClick={() => toggleCategory('bachelor')}>
              <h3 className="program-category">{t('publicQueueForm.bachelor')}</h3>
              <span className={`toggle-icon ${categoryStates.bachelor ? 'expanded' : ''}`}>
                {categoryStates.bachelor ? '−' : '+'}
              </span>
            </div>
            {categoryStates.bachelor && (
              <div className="category-content">
                {BACHELOR_PROGRAMS.map((program) => (
                  <div className="program-item" key={program}>
                    <input
                      type="checkbox"
                      id={`program-${program}`}
                      value={program}
                      checked={formData.programs.includes(program)}
                      onChange={handleProgramChange}
                    />
                    <label htmlFor={`program-${program}`}>
                      {t(`publicQueueForm.programs.bachelor.${program}`)}
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="category-header" onClick={() => toggleCategory('master')}>
              <h3 className="program-category">{t('publicQueueForm.master')}</h3>
              <span className={`toggle-icon ${categoryStates.master ? 'expanded' : ''}`}>
                {categoryStates.master ? '−' : '+'}
              </span>
            </div>
            {categoryStates.master && (
              <div className="category-content">
                {MASTER_PROGRAMS.map((program) => (
                  <div className="program-item" key={program}>
                    <input
                      type="checkbox"
                      id={`program-${program}`}
                      value={program}
                      checked={formData.programs.includes(program)}
                      onChange={handleProgramChange}
                    />
                    <label htmlFor={`program-${program}`}>
                      {t(`publicQueueForm.programs.master.${program}`)}
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="category-header" onClick={() => toggleCategory('doctorate')}>
              <h3 className="program-category">{t('publicQueueForm.doctorate')}</h3>
              <span className={`toggle-icon ${categoryStates.doctorate ? 'expanded' : ''}`}>
                {categoryStates.doctorate ? '−' : '+'}
              </span>
            </div>
            {categoryStates.doctorate && (
              <div className="category-content">
                {DOCTORATE_PROGRAMS.map((program) => (
                  <div className="program-item" key={program}>
                    <input
                      type="checkbox"
                      id={`program-${program}`}
                      value={program}
                      checked={formData.programs.includes(program)}
                      onChange={handleProgramChange}
                    />
                    <label htmlFor={`program-${program}`}>
                      {t(`publicQueueForm.programs.doctorate.${program}`)}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 
        <div className="form-group captcha-container">
          <ReCAPTCHA
            sitekey="6LdkwT0rAAAAAAPWoQweToNny7P4FHheyz2SZIr8"
            onChange={handleCaptchaChange}
          />
        </div> 
        */}

        <button
          type="submit"
          className="btn btn-primary btn-submit"
          disabled={loading /* || !captchaToken */}
        >
          {loading ? t('publicQueueForm.submitting') : t('publicQueueForm.submitButton')}
        </button>
      </form>

      <div className="queue-check-section">
        <h2>{t('publicQueueForm.checkTitle')}</h2>
        <QueueStatusCheck />
      </div>
    </div>
  );
};

export default PublicQueueForm;