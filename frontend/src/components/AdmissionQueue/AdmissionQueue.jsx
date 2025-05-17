import React, { useState, useEffect } from 'react';
import { admissionAPI } from '../../api';
import './AdmissionQueue.css';

const AdmissionQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('full_name');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchQueue();
  }, [activeFilter, searchTerm, searchField]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeFilter !== 'all') params.status = activeFilter;
      if (searchTerm) params[searchField] = searchTerm;

      const response = await admissionAPI.getQueue(params);
      
      setQueue(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Ошибка загрузки очереди:', err);
      setError('Ошибка при загрузке очереди');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessNext = async () => {
    try {
      await admissionAPI.processNext();
      fetchQueue();
    } catch (err) {
      setError('Ошибка при обработке следующего абитуриента');
    }
  };

  const handleUpdateStatus = async (queueId, status) => {
    try {
      await admissionAPI.updateEntry(queueId, { status });
      fetchQueue();
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
      fetchQueue();
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
            Завершенные
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
        <table className="queue-table">
          <thead>
            <tr>
              <th>№</th>
              <th>ФИО</th>
              <th>Телефон</th>
              <th>Программы</th>
              <th>Статус</th>
              <th>Время</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((entry) => (
              <tr key={entry.id} className={`status-${entry.status}`}>
                <td>{entry.queue_number}</td>
                <td>{entry.full_name}</td>
                <td>{entry.phone}</td>
                <td>{entry.programs.join(', ')}</td>
                <td>
                  <span className={`status-badge status-${entry.status}`}>
                    {getStatusText(entry.status)}
                  </span>
                </td>
                <td>{new Date(entry.created_at).toLocaleTimeString()}</td>
                <td className="actions">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdmissionQueue;