import React, { useState, useEffect, useCallback } from 'react';
import { admissionAPI } from '../../api';
import { debounce } from 'lodash';
import { FaSearch, FaFilter, FaSort, FaChevronDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './AdmissionQueue.css';

const AdmissionQueue = () => {
  const { t, i18n } = useTranslation();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('full_name');
  const [deletingId, setDeletingId] = useState(null);
  const [sortBy, setSortBy] = useState('queue_number_asc');

  const fetchQueue = useCallback(
    debounce(async (filter, term, field, sort) => {
      try {
        setLoading(true);
        const params = {};
        if (filter !== 'all') params.status = filter;
        if (term && field !== 'programs') {
          const normalizedTerm = term.trim();
          params[field] = normalizedTerm;
        }

        const response = await admissionAPI.getQueue(params);
        let filteredQueue = response.data || [];

        if (term && field === 'programs') {
          const normalizedTerm = term.trim().toLowerCase();
          filteredQueue = filteredQueue.filter((entry) =>
            entry.programs.some((program) =>
              program.toLowerCase().includes(normalizedTerm)
            )
          );
        }

        let sortedQueue = [...filteredQueue];
        switch (sort) {
          case 'queue_number_asc':
            sortedQueue.sort((a, b) => a.queue_number - b.queue_number);
            break;
          case 'queue_number_desc':
            sortedQueue.sort((a, b) => b.queue_number - b.queue_number);
            break;
          case 'created_at_asc':
            sortedQueue.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
          case 'created_at_desc':
            sortedQueue.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
          case 'status_asc':
            sortedQueue.sort((a, b) => a.status.localeCompare(b.status));
            break;
          case 'full_name_asc':
            sortedQueue.sort((a, b) => a.full_name.localeCompare(b.full_name));
            break;
          default:
            sortedQueue.sort((a, b) => a.queue_number - b.queue_number);
        }

        setQueue(sortedQueue);
        setError(null);
      } catch (err) {
        setError(t('admissionQueue.errorLoading'));
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchQueue(activeFilter, searchTerm, searchField, sortBy);
    return () => fetchQueue.cancel();
  }, [activeFilter, searchTerm, searchField, sortBy, fetchQueue]);

  const handleProcessNext = async () => {
    try {
      await admissionAPI.processNext();
      fetchQueue(activeFilter, searchTerm, searchField, sortBy);
    } catch (err) {
      setError(t('admissionQueue.errorProcessing'));
    }
  };

  const handleUpdateStatus = async (queueId, status) => {
    try {
      await admissionAPI.updateEntry(queueId, { status });
      fetchQueue(activeFilter, searchTerm, searchField, sortBy);
    } catch (err) {
      setError(t('admissionQueue.errorUpdatingStatus'));
    }
  };

  const handleDeleteEntry = async (queueId) => {
    if (!window.confirm(t('admissionQueue.confirmDelete'))) return;
    try {
      setDeletingId(queueId);
      await admissionAPI.deleteEntry(queueId);
      fetchQueue(activeFilter, searchTerm, searchField, sortBy);
    } catch (err) {
      const errorMessage = err.response?.data?.detail
        ? Array.isArray(err.response.data.detail)
          ? err.response.data.detail.map((e) => e.msg).join('; ')
          : err.response.data.detail
        : err.message || t('admissionQueue.errorDeletingDefault');
      setError(`${t('admissionQueue.errorDeleting')} ${errorMessage}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusText = (status) => {
    return t(`admissionQueue.status.${status}`);
  };

  // Обработчик смены языка
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="admission-queue">
      <div className="queue-controls">
        <h2>{t('admissionQueue.title')}</h2>

        <div className="control-panel">
          <div className="control-group">
            <label className="control-label">
              <FaSearch className="control-icon" /> {t('admissionQueue.searchLabel')}
            </label>
            <div className="search-controls">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="search-select"
              >
                <option value="full_name">{t('admissionQueue.searchFields.fullName')}</option>
                <option value="phone">{t('admissionQueue.searchFields.phone')}</option>
                <option value="programs">{t('admissionQueue.searchFields.programs')}</option>
              </select>
              <input
                type="text"
                placeholder={t('admissionQueue.searchPlaceholder', {
                  field:
                    searchField === 'full_name'
                      ? t('admissionQueue.searchFields.fullName')
                      : searchField === 'phone'
                      ? t('admissionQueue.searchFields.phone')
                      : t('admissionQueue.searchFields.programs'),
                })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="control-group">
            <label className="control-label">
              <FaSort className="control-icon" /> {t('admissionQueue.sortLabel')}
            </label>
            <div className="sort-controls">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="queue_number_asc">{t('admissionQueue.sortOptions.queueNumberAsc')}</option>
                <option value="queue_number_desc">{t('admissionQueue.sortOptions.queueNumberDesc')}</option>
                <option value="created_at_asc">{t('admissionQueue.sortOptions.createdAtAsc')}</option>
                <option value="created_at_desc">{t('admissionQueue.sortOptions.createdAtDesc')}</option>
                <option value="status_asc">{t('admissionQueue.sortOptions.statusAsc')}</option>
                <option value="full_name_asc">{t('admissionQueue.sortOptions.fullNameAsc')}</option>
              </select>
            </div>
          </div>

          <div className="control-group">
            <label className="control-label">
              <FaFilter className="control-icon" /> {t('admissionQueue.filterLabel')}
            </label>
            <div className="filter-buttons">
              <button
                className={`btn ${activeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveFilter('all')}
              >
                {t('admissionQueue.filters.all')}
              </button>
              <button
                className={`btn ${activeFilter === 'waiting' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveFilter('waiting')}
              >
                {t('admissionQueue.filters.waiting')}
              </button>
              <button
                className={`btn ${activeFilter === 'in_progress' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveFilter('in_progress')}
              >
                {t('admissionQueue.filters.inProgress')}
              </button>
              <button
                className={`btn ${activeFilter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveFilter('completed')}
              >
                {t('admissionQueue.filters.completed')}
              </button>
            </div>
          </div>
        </div>

        <button className="btn btn-success process-next-btn" onClick={handleProcessNext}>
          {t('admissionQueue.processNextButton')}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p className="loading-text">{t('admissionQueue.loading')}</p>
      ) : queue.length === 0 ? (
        <p className="empty-queue">{t('admissionQueue.emptyQueue')}</p>
      ) : (
        <div className="queue-cards">
          {queue.map((entry) => (
            <div key={entry.id} className={`queue-card status-${entry.status}`}>
              <div className="card-header">
                <span className="queue-number">
                  {t('admissionQueue.queueNumber', { number: entry.queue_number })}
                </span>
                <span className={`status-badge status-${entry.status}`}>
                  {getStatusText(entry.status)}
                </span>
              </div>
              <div className="card-body">
                <p>
                  <strong>{t('admissionQueue.card.fullName')}</strong> {entry.full_name}
                </p>
                <p>
                  <strong>{t('admissionQueue.card.phone')}</strong> {entry.phone}
                </p>
                <p>
                  <strong>{t('admissionQueue.card.programs')}</strong> {entry.programs.join(', ')}
                </p>
                <p>
                  <strong>{t('admissionQueue.card.time')}</strong>{' '}
                  {new Date(entry.created_at).toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}{' '}
                  {new Date(entry.created_at).toLocaleTimeString(i18n.language === 'ru' ? 'ru-RU' : 'en-US')}
                </p>
              </div>
              <div className="card-actions">
                {entry.status === 'waiting' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUpdateStatus(entry.id, 'in_progress')}
                  >
                    {t('admissionQueue.actions.start')}
                  </button>
                )}
                {entry.status === 'in_progress' && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleUpdateStatus(entry.id, 'completed')}
                  >
                    {t('admissionQueue.actions.complete')}
                  </button>
                )}
                {(entry.status === 'waiting' || entry.status === 'in_progress') && (
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleUpdateStatus(entry.id, 'paused')}
                  >
                    {t('admissionQueue.actions.pause')}
                  </button>
                )}
                {entry.status === 'paused' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUpdateStatus(entry.id, 'waiting')}
                  >
                    {t('admissionQueue.actions.resume')}
                  </button>
                )}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteEntry(entry.id)}
                  disabled={deletingId === entry.id}
                >
                  {deletingId === entry.id
                    ? t('admissionQueue.actions.deleting')
                    : t('admissionQueue.actions.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdmissionQueue;