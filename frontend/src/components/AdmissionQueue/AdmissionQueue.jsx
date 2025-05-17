import React, { useState, useEffect, useCallback } from 'react';
import { admissionAPI } from '../../api';
import { debounce } from 'lodash';
import './AdmissionQueue.css';

const AdmissionQueue = () => {
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
        if (term && field !== 'programs') { // Для programs фильтрацию сделаем на клиенте
          const normalizedTerm = term.trim();
          console.log(`Sending search: field=${field}, term=${normalizedTerm}`);
          params[field] = normalizedTerm;
        }

        const response = await admissionAPI.getQueue(params);
        console.log('Queue response:', response.data);

        let filteredQueue = response.data || [];

        // Клиентская фильтрация для programs
        if (term && field === 'programs') {
          const normalizedTerm = term.trim().toLowerCase();
          filteredQueue = filteredQueue.filter((entry) =>
            entry.programs.some((program) =>
              program.toLowerCase().includes(normalizedTerm)
            )
          );
        }

        // Сортировка
        let sortedQueue = [...filteredQueue];
        switch (sort) {
          case 'queue_number_asc':
            sortedQueue.sort((a, b) => a.queue_number - b.queue_number);
            break;
          case 'queue_number_desc':
            sortedQueue.sort((a, b) => b.queue_number - a.queue_number);
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
        console.error('Ошибка загрузки очереди:', err);
        setError('Ошибка при загрузке очереди');
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
      setError('Ошибка при обработке следующего абитуриента');
    }
  };

  const handleUpdateStatus = async (queueId, status) => {
    try {
      await admissionAPI.updateEntry(queueId, { status });
      fetchQueue(activeFilter, searchTerm, searchField, sortBy);
    } catch (err) {
      setError('Ошибка при обновлении статуса');
    }
  };

  const handleDeleteEntry = async (queueId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту заявку?')) return;
    try {
      setDeletingId(queueId);
      console.log(`Попытка удаления заявки с ID: ${queueId}`);
      await admissionAPI.deleteEntry(queueId);
      fetchQueue(activeFilter, searchTerm, searchField, sortBy);
    } catch (err) {
      const errorMessage = err.response?.data?.detail 
        ? Array.isArray(err.response.data.detail) 
          ? err.response.data.detail.map(e => e.msg).join('; ')
          : err.response.data.detail
        : err.message || 'Не удалось удалить заявку';
      console.error('Ошибка удаления:', errorMessage);
      setError(`Ошибка при удалении заявки: ${errorMessage}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'waiting':
        return 'В ожидании';
      case 'in_progress':
        return 'Обрабатывается';
      case 'completed':
        return 'Завершено';
      case 'paused':
        return 'Приостановлено';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <div className="admission-queue">
      <div className="queue-controls">
        <h2>Управление очередью</h2>
        
        <div className="search-controls">
          <select 
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="search-select"
          >
            <option value="full_name">ФИО</option>
            <option value="phone">Телефон</option>
            <option value="programs">Программы</option>
          </select>
          <input
            type="text"
            placeholder={`Поиск по ${searchField === 'full_name' ? 'ФИО' : searchField === 'phone' ? 'телефону' : 'программам'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="queue_number_asc">Номер заявки (по возрастанию)</option>
            <option value="queue_number_desc">Номер заявки (по убыванию)</option>
            <option value="created_at_asc">Время создания (по возрастанию)</option>
            <option value="created_at_desc">Время создания (по убыванию)</option>
            <option value="status_asc">Статус (алфавитный порядок)</option>
            <option value="full_name_asc">ФИО (алфавитный порядок)</option>
          </select>
        </div>

        <div className="filter-buttons">
          <button 
            className={`btn ${activeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter('all')}
          >
            Все
          </button>
          <button 
            className={`btn ${activeFilter === 'waiting' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter('waiting')}
          >
            Ожидающие
          </button>
          <button 
            className={`btn ${activeFilter === 'in_progress' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter('in_progress')}
          >
            В обработке
          </button>
          <button 
            className={`btn ${activeFilter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter('completed')}
          >
            Завершено
          </button>
        </div>
        
        <button 
          className="btn btn-success process-next-btn"
          onClick={handleProcessNext}
        >
          Вызвать следующего
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p className="loading-text">Загрузка очереди...</p>
      ) : queue.length === 0 ? (
        <p className="empty-queue">В очереди никого нет</p>
      ) : (
        <div className="queue-cards">
          {queue.map((entry) => (
            <div key={entry.id} className={`queue-card status-${entry.status}`}>
              <div className="card-header">
                <span className="queue-number">№ {entry.queue_number}</span>
                <span className={`status-badge status-${entry.status}`}>
                  {getStatusText(entry.status)}
                </span>
              </div>
              <div className="card-body">
                <p><strong>ФИО:</strong> {entry.full_name}</p>
                <p><strong>Телефон:</strong> {entry.phone}</p>
                <p><strong>Программы:</strong> {entry.programs.join(', ')}</p>
                <p><strong>Время:</strong> {new Date(entry.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date(entry.created_at).toLocaleTimeString('ru-RU')}</p>
              </div>
              <div className="card-actions">
                {entry.status === 'waiting' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUpdateStatus(entry.id, 'in_progress')}
                  >
                    Начать
                  </button>
                )}
                {entry.status === 'in_progress' && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleUpdateStatus(entry.id, 'completed')}
                  >
                    Завершить
                  </button>
                )}
                {(entry.status === 'waiting' || entry.status === 'in_progress') && (
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleUpdateStatus(entry.id, 'paused')}
                  >
                    Пауза
                  </button>
                )}
                {entry.status === 'paused' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUpdateStatus(entry.id, 'waiting')}
                  >
                    Вернуть
                  </button>
                )}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteEntry(entry.id)}
                  disabled={deletingId === entry.id}
                >
                  {deletingId === entry.id ? 'Удаление...' : 'Удалить'}
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