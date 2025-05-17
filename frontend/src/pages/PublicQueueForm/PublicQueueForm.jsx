import React, { useState } from 'react';
// import ReCAPTCHA from 'react-google-recaptcha';
import api from '../../api';
import './PublicQueueForm.css';

// Программы по категориям
const BACHELOR_PROGRAMS = [
  'Бухгалтерский учёт',
  'Прикладная лингвистика',
  'Экономика и наука о данных',
  'Финансы',
  'Гостеприимство',
  'Международная журналистика',
  'Международное право',
  'Международные отношения',
  'IT',
  'Юриспруденция',
  'Менеджмент',
  'Маркетинг',
  'Психология',
  'Туризм',
  'Переводческое дело',
];

const MASTER_PROGRAMS = [
  'Политология и международные отношения',
  'Прикладная лингвистика',
  'Конкурентное право',
  'Консультативная психология',
  'Экономика',
  'Финансы',
  'Право интеллектуальной собственности и бизнеса',
  'Международное право',
  'Право IT',
  'Юриспруденция',
  'Переводческое дело',
];

const DOCTORATE_PROGRAMS = [
  'Право',
  'PhD по Экономике'
];

const PublicQueueForm = () => {
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

  // Состояния для сворачивания/разворачивания категорий
  const [categoryStates, setCategoryStates] = useState({
    bachelor: false,
    master: false,
    doctorate: false,
  });

  // Состояние для количества людей в очереди
  const [queueCount, setQueueCount] = useState(null);

  // Получение количества людей в очереди с сервера
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
        programs: [...formData.programs, value]
      });
    } else {
      setFormData({
        ...formData,
        programs: formData.programs.filter(program => program !== value)
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
    //   setError('Пожалуйста, пройдите проверку капчи');
    //   return;
    // }

    try {
      setLoading(true);
      setError(null);

      await api.post('/api/public/queue', {
        ...formData,
        // captcha_token: captchaToken
      });

      setSuccess(true);

      // Получаем количество в очереди только после успешной отправки
      await fetchQueueCount();

      setFormData({
        full_name: '',
        phone: '',
        programs: [],
        notes: ''
      });

    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при отправке формы');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-message">
        <h2>Заявка успешно отправлена!</h2>
        <p>Вы добавлены в очередь. Ожидайте вызова сотрудника приемной комиссии.</p>
        {queueCount !== null && (
          <p>Ваше место в очереди: <strong>{queueCount}</strong></p>
        )}
      </div>
    );
  }

  return (
    <div className="public-form-container">
      <h1>Запись в очередь приемной комиссии</h1>

      <p className="form-description">
        Заполните форму, чтобы занять очередь в приемную комиссию
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="public-queue-form">
        <div className="form-group">
          <label htmlFor="full_name">ФИО</label>
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
          <label htmlFor="phone">Номер телефона</label>
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
          <label>Выберите образовательные программы</label>
          <div className="programs-list">
            {/* Бакалавриат */}
            <div className="category-header" onClick={() => toggleCategory('bachelor')}>
              <h3 className="program-category">Бакалавриат</h3>
              <span className={`toggle-icon ${categoryStates.bachelor ? 'expanded' : ''}`}>
                {categoryStates.bachelor ? '−' : '+'}
              </span>
            </div>
            {categoryStates.bachelor && (
              <div className="category-content">
                {BACHELOR_PROGRAMS.map(program => (
                  <div className="program-item" key={program}>
                    <input
                      type="checkbox"
                      id={`program-${program}`}
                      value={program}
                      checked={formData.programs.includes(program)}
                      onChange={handleProgramChange}
                    />
                    <label htmlFor={`program-${program}`}>{program}</label>
                  </div>
                ))}
              </div>
            )}

            {/* Магистратура */}
            <div className="category-header" onClick={() => toggleCategory('master')}>
              <h3 className="program-category">Магистратура</h3>
              <span className={`toggle-icon ${categoryStates.master ? 'expanded' : ''}`}>
                {categoryStates.master ? '−' : '+'}
              </span>
            </div>
            {categoryStates.master && (
              <div className="category-content">
                {MASTER_PROGRAMS.map(program => (
                  <div className="program-item" key={program}>
                    <input
                      type="checkbox"
                      id={`program-${program}`}
                      value={program}
                      checked={formData.programs.includes(program)}
                      onChange={handleProgramChange}
                    />
                    <label htmlFor={`program-${program}`}>{program}</label>
                  </div>
                ))}
              </div>
            )}

            {/* Докторантура */}
            <div className="category-header" onClick={() => toggleCategory('doctorate')}>
              <h3 className="program-category">Докторантура</h3>
              <span className={`toggle-icon ${categoryStates.doctorate ? 'expanded' : ''}`}>
                {categoryStates.doctorate ? '−' : '+'}
              </span>
            </div>
            {categoryStates.doctorate && (
              <div className="category-content">
                {DOCTORATE_PROGRAMS.map(program => (
                  <div className="program-item" key={program}>
                    <input
                      type="checkbox"
                      id={`program-${program}`}
                      value={program}
                      checked={formData.programs.includes(program)}
                      onChange={handleProgramChange}
                    />
                    <label htmlFor={`program-${program}`}>{program}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Дополнительная информация (опционально)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>

        {/* Капча */}
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
          {loading ? 'Отправка...' : 'Отправить заявку'}
        </button>
      </form>
    </div>
  );
};

export default PublicQueueForm;