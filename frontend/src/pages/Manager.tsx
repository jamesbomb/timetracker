import React, { useEffect, useState } from 'react';

import styles from './Manager.module.css';
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
  user?: {
    email: string;
    full_name?: string;
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Manager: React.FC = () => {
  const { currentUser, token, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/manager/requests`, {
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

    if (token) {
      fetchRequests();
    }
  }, [token, refreshKey]);

  const handleApprove = async (requestId: number) => {
    if (!token) return;
    setProcessingId(requestId);
    try {
      const res = await fetch(`${API_URL}/manager/requests/${requestId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to approve request');
      alert('Richiesta approvata con successo!');
      setRefreshKey(prev => prev + 1); // Trigger refetch
    } catch (err) {
      console.error(err);
      alert('Errore durante l\'approvazione della richiesta');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    if (!token) return;
    const reason = prompt('Inserisci il motivo del rifiuto (obbligatorio):');
    if (reason === null) return; // User cancelled
    if (!reason || reason.trim() === '') {
      alert('Il motivo del rifiuto è obbligatorio');
      return;
    }
    
    setProcessingId(requestId);
    try {
      const res = await fetch(`${API_URL}/manager/requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejection_reason: reason.trim() }),
      });
      if (!res.ok) throw new Error('Failed to reject request');
      alert('Richiesta rifiutata');
      setRefreshKey(prev => prev + 1); // Trigger refetch
    } catch (err) {
      console.error(err);
      alert('Errore durante il rifiuto della richiesta');
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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

  // Calcola giorni di differenza
  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end day
  };

  // Filtra richieste
  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  // Conta richieste per stato
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.userInfo}>
            <h1 className={styles.greeting}>
              Pannello Manager
            </h1>
            <p className={styles.userEmail}>
              Gestisci le richieste del tuo team
            </p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.dashboardButton} onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            {currentUser?.is_superuser && (
              <button className={styles.adminButton} onClick={() => navigate('/admin')}>
                Admin
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
            <div className={styles.statIcon}>⏳</div>
            <div className={styles.statLabel}>In Attesa</div>
            <div className={styles.statValue}>{pendingCount}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statLabel}>Approvate</div>
            <div className={styles.statValue}>{approvedCount}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>❌</div>
            <div className={styles.statLabel}>Rifiutate</div>
            <div className={styles.statValue}>{rejectedCount}</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          <button 
            className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            Tutte ({requests.length})
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'pending' ? styles.active : ''}`}
            onClick={() => setFilter('pending')}
          >
            In Attesa ({pendingCount})
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'approved' ? styles.active : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approvate ({approvedCount})
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'rejected' ? styles.active : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rifiutate ({rejectedCount})
          </button>
        </div>

        {/* Requests List */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <span className={styles.titleIcon}>📋</span>
              Richieste del Team
            </h2>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <span>Caricamento richieste...</span>
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className={styles.requestsList}>
              {filteredRequests.map((request) => (
                <div key={request.id} className={styles.requestCard}>
                  <div className={styles.requestHeader}>
                    <div className={styles.requestUser}>
                      <span className={styles.userIcon}>👤</span>
                      <div>
                        <div className={styles.userName}>
                          {request.user?.full_name || request.user?.email || 'Utente'}
                        </div>
                        <div className={styles.userEmail}>{request.user?.email}</div>
                      </div>
                    </div>
                    <div className={styles.requestStatus}>
                      <span className={`${styles.statusBadge} ${styles[request.status]}`}>
                        {request.status === 'pending' && '⏳ In Attesa'}
                        {request.status === 'approved' && '✅ Approvata'}
                        {request.status === 'rejected' && '❌ Rifiutata'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.requestBody}>
                    <div className={styles.requestDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Tipo:</span>
                        <span className={`${styles.typeTag} ${styles[request.type]}`}>
                          {request.type === 'leave' ? '🏖️ Ferie' : '📋 Permesso'}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Dal:</span>
                        <span>{formatDate(request.start_date)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Al:</span>
                        <span>{formatDate(request.end_date)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Durata:</span>
                        <span className={styles.duration}>
                          {calculateDays(request.start_date, request.end_date)} giorni
                        </span>
                      </div>
                    </div>

                    {request.status === 'rejected' && request.rejection_reason && (
                      <div className={styles.rejectionReason}>
                        <span className={styles.rejectionIcon}>⚠️</span>
                        <div>
                          <strong>Motivo del rifiuto:</strong>
                          <p>{request.rejection_reason}</p>
                        </div>
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className={styles.requestActions}>
                        <button 
                          className={styles.approveButton}
                          onClick={() => handleApprove(request.id)}
                          disabled={processingId === request.id}
                        >
                          {processingId === request.id ? 'Elaborazione...' : '✅ Approva'}
                        </button>
                        <button 
                          className={styles.rejectButton}
                          onClick={() => handleReject(request.id)}
                          disabled={processingId === request.id}
                        >
                          {processingId === request.id ? 'Elaborazione...' : '❌ Rifiuta'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.requestFooter}>
                    <span className={styles.requestDate}>
                      Richiesta creata il {formatDate(request.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <p className={styles.emptyText}>
                {filter === 'pending' 
                  ? 'Nessuna richiesta in attesa di approvazione'
                  : `Nessuna richiesta ${filter === 'approved' ? 'approvata' : filter === 'rejected' ? 'rifiutata' : ''}`
                }
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Manager;
