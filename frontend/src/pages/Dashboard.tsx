import React, { useEffect, useState } from 'react';

import type { FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface TimeOffRequest {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  type: 'leave' | 'permit';
  status: 'pending' | 'approved' | 'rejected';
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

  return (
    <div>
      <h2>Buongiorno, {currentUser?.full_name || currentUser?.email}</h2>
      <button onClick={handleLogout}>Logout</button>
      {currentUser?.is_superuser && (
        <button onClick={() => navigate('/admin')}>Admin</button>
      )}

      <h3>Ferie/Permessi futuri approvati</h3>
      {loading ? (
        <p>Caricamento...</p>
      ) : approvedFuture.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Da</th>
              <th>A</th>
            </tr>
          </thead>
          <tbody>
            {approvedFuture.map((r) => (
              <tr key={r.id}>
                <td>{r.type}</td>
                <td>{new Date(r.start_date).toLocaleString()}</td>
                <td>{new Date(r.end_date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nessuna richiesta approvata.</p>
      )}

      <h3>Nuova richiesta ferie/permessi</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tipo: </label>
          <select value={type} onChange={(e) => setType(e.target.value as TimeOffRequest['type'])}>
            <option value="leave">Ferie</option>
            <option value="permit">Permesso</option>
          </select>
        </div>
        <div>
          <label>Data inizio: </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Data fine: </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        <button type="submit">Invia richiesta</button>
      </form>
    </div>
  );
};

export default Dashboard;
