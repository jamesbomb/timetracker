import React, { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Unit {
  id: number;
  name: string;
}

interface User {
  id: number;
  email: string;
  full_name?: string;
  is_manager: boolean;
  managed_units: Unit[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Admin: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [units, setUnits] = useState<Unit[]>([]);
  const [newUnitName, setNewUnitName] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [editState, setEditState] = useState<Record<number, { is_manager: boolean; unit_ids: number[] }>>({});
  const [loading, setLoading] = useState(true);

  const fetchUnits = async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/admin/units`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setUnits(await res.json());
  };

  const fetchUsers = async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data: User[] = await res.json();
      setUsers(data);
      const init: Record<number, { is_manager: boolean; unit_ids: number[] }> = {};
      data.forEach((u) => {
        init[u.id] = { is_manager: u.is_manager, unit_ids: u.managed_units.map((m) => m.id) };
      });
      setEditState(init);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUnits();
    fetchUsers();
  }, [token]);

  const handleCreateUnit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !newUnitName) return;
    const res = await fetch(`${API_URL}/admin/units`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newUnitName }),
    });
    if (res.ok) {
      setNewUnitName('');
      fetchUnits();
    } else {
      alert('Errore creazione unità');
    }
  };

  const handleUserUpdate = async (userId: number) => {
    if (!token) return;
    const { is_manager, unit_ids } = editState[userId];
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_manager, unit_ids }),
    });
    if (res.ok) {
      fetchUsers();
    } else {
      alert('Errore aggiornamento utente');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div>
      <h2>Admin</h2>
      <button onClick={handleLogout}>Logout</button>

      <h3>Unità</h3>
      <form onSubmit={handleCreateUnit} style={{ marginBottom: 12 }}>
        <input
          placeholder="Nome unità"
          value={newUnitName}
          onChange={(e) => setNewUnitName(e.target.value)}
        />
        <button type="submit">Crea unità</button>
      </form>
      <ul>
        {units.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>

      <h3>Utenti</h3>
      {loading ? (
        <p>Caricamento utenti...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Manager?</th>
              <th>Unità</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={editState[u.id]?.is_manager || false}
                    onChange={(e) =>
                      setEditState((s) => ({
                        ...s,
                        [u.id]: {
                          ...s[u.id],
                          is_manager: e.target.checked,
                        },
                      }))
                    }
                  />
                </td>
                <td>
                  <select
                    multiple
                    value={editState[u.id]?.unit_ids.map(String) || []}
                    onChange={(e) => {
                      const opts = Array.from(
                        e.target.selectedOptions,
                        (opt) => Number(opt.value)
                      );
                      setEditState((s) => ({
                        ...s,
                        [u.id]: {
                          ...s[u.id],
                          unit_ids: opts,
                        },
                      }));
                    }}
                  >
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button onClick={() => handleUserUpdate(u.id)}>
                    Salva
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

export default Admin;