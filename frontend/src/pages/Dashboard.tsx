import React, { useEffect, useState } from 'react';

import type { FormEvent } from 'react';
import styles from './Dashboard.module.css';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface TimeOffRequest {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  type: 'leave' | 'permit';
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Dashboard: React.FC = () => {
  const { currentUser, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<TimeOffRequest['type']>('leave');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchRequests = async () => {
      try {
        const res = await fetch(`${API_URL}/users/me/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch requests');
        const data: TimeOffRequest[] = await res.json();
        setRequests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/users/me/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ start_date: startDate, end_date: endDate, type }),
      });
      if (!res.ok) throw new Error('Failed to create request');
      const newRequest: TimeOffRequest = await res.json();
      setRequests((prev) => [...prev, newRequest]);
      setStartDate('');
      setEndDate('');
      setType('leave');
    } catch (err) {
      console.error(err);
      alert('Errore durante la creazione della richiesta');
    }
  };

  // mostra solo richieste approvate e future
  const approvedFuture = requests.filter(
    (r) => r.status === 'approved' && new Date(r.start_date) > new Date()
  );

  // Calcola statistiche
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const totalRequests = requests.length;

  // Formatta data per visualizzazione
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Ottieni saluto basato sull'ora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.userInfo}>
            <h1 className={styles.greeting}>
              {getGreeting()}, {currentUser?.full_name || currentUser?.email?.split('@')[0]}
            </h1>
            <p className={styles.userEmail}>{currentUser?.email}</p>
          </div>
          <div className={styles.headerActions}>
            {currentUser?.is_manager && (
              <button className={styles.adminButton} onClick={() => navigate('/manager')}>
                Manager Panel
              </button>
            )}
            {currentUser?.is_superuser && (
              <button className={styles.adminButton} onClick={() => navigate('/admin')}>
                Admin Panel
              </button>
            )}
            <button className={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statLabel}>Totale Richieste</div>
            <div className={styles.statValue}>{totalRequests}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statLabel}>Approvate</div>
            <div className={styles.statValue}>{approvedCount}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏳</div>
            <div className={styles.statLabel}>In Attesa</div>
            <div className={styles.statValue}>{pendingCount}</div>
          </div>
          {currentUser?.is_manager && (
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👔</div>
              <div className={styles.statLabel}>Ruolo</div>
              <div className={styles.statValue}>Manager</div>
            </div>
          )}
        </div>

        {/* Approved Future Requests */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <span className={styles.titleIcon}>📅</span>
              Ferie/Permessi Futuri Approvati
            </h2>
            <span className={styles.badge}>{approvedFuture.length} attivi</span>
          </div>
          
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <span>Caricamento...</span>
            </div>
          ) : approvedFuture.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Data Inizio</th>
                  <th>Data Fine</th>
                </tr>
              </thead>
              <tbody>
                {approvedFuture.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className={`${styles.typeTag} ${styles[r.type]}`}>
                        {r.type === 'leave' ? '🏖️ Ferie' : '📋 Permesso'}
                      </span>
                    </td>
                    <td>{formatDate(r.start_date)}</td>
                    <td>{formatDate(r.end_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <p className={styles.emptyText}>Nessuna richiesta approvata per il futuro</p>
            </div>
          )}
        </div>

        {/* New Request Form */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <span className={styles.titleIcon}>➕</span>
              Nuova Richiesta
            </h2>
          </div>
          
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="type">
                  Tipo di Richiesta
                </label>
                <select 
                  id="type"
                  className={styles.select}
                  value={type} 
                  onChange={(e) => setType(e.target.value as TimeOffRequest['type'])}
                >
                  <option value="leave">🏖️ Ferie</option>
                  <option value="permit">📋 Permesso</option>
                </select>
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="startDate">
                  Data e Ora Inizio
                </label>
                <input
                  id="startDate"
                  className={styles.input}
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="endDate">
                  Data e Ora Fine
                </label>
                <input
                  id="endDate"
                  className={styles.input}
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button className={styles.submitButton} type="submit">
              Invia Richiesta
            </button>
          </form>
        </div>

        {/* All Requests History */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <span className={styles.titleIcon}>📝</span>
              Storico Richieste
            </h2>
            <span className={styles.badge}>{requests.length} totali</span>
          </div>
          
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <span>Caricamento...</span>
            </div>
          ) : requests.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Data Inizio</th>
                  <th>Data Fine</th>
                  <th>Stato</th>
                  <th>Data Richiesta</th>
                </tr>
              </thead>
              <tbody>
                {requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className={`${styles.typeTag} ${styles[r.type]}`}>
                        {r.type === 'leave' ? '🏖️ Ferie' : '📋 Permesso'}
                      </span>
                    </td>
                    <td>{formatDate(r.start_date)}</td>
                    <td>{formatDate(r.end_date)}</td>
                    <td>
                      <div>
                        <span className={`${styles.statusTag} ${styles[r.status]}`}>
                          {r.status === 'approved' ? '✅ Approvata' : 
                           r.status === 'pending' ? '⏳ In Attesa' : 
                           '❌ Rifiutata'}
                        </span>
                        {r.status === 'rejected' && r.rejection_reason && (
                          <div className={styles.rejectionReason}>
                            <small><strong>Motivo:</strong> {r.rejection_reason}</small>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <p className={styles.emptyText}>Nessuna richiesta presente</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
