import React, { useEffect, useState } from 'react';

import type { FormEvent } from 'react';
import styles from './AdminNew.module.css';
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
  units: Unit[];          // Unità a cui appartiene
  managed_units: Unit[];  // Unità che gestisce
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AdminNew: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [units, setUnits] = useState<Unit[]>([]);
  const [newUnitName, setNewUnitName] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [editState, setEditState] = useState<Record<number, { 
    is_manager: boolean; 
    managed_unit_ids: number[];
    member_unit_ids: number[];
  }>>({});
  const [loading, setLoading] = useState(true);
  const [draggedUnit, setDraggedUnit] = useState<Unit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
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
        const init: Record<number, { 
          is_manager: boolean; 
          managed_unit_ids: number[];
          member_unit_ids: number[];
        }> = {};
        data.forEach((u) => {
          init[u.id] = { 
            is_manager: u.is_manager, 
            managed_unit_ids: u.managed_units.map((m) => m.id),
            member_unit_ids: u.units.map((m) => m.id)
          };
        });
        setEditState(init);
      }
      setLoading(false);
    };

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
      // Refresh units data
      const unitsRes = await fetch(`${API_URL}/admin/units`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (unitsRes.ok) setUnits(await unitsRes.json());
    } else {
      alert('Errore creazione unità');
    }
  };

  const handleUserUpdate = async (userId: number) => {
    if (!token) return;
    const { is_manager, managed_unit_ids, member_unit_ids } = editState[userId];
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_manager, managed_unit_ids, member_unit_ids }),
    });
    if (res.ok) {
      // Refresh user data
      const userRes = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        const data: User[] = await userRes.json();
        setUsers(data);
        const init: Record<number, { 
          is_manager: boolean; 
          managed_unit_ids: number[];
          member_unit_ids: number[];
        }> = {};
        data.forEach((u) => {
          init[u.id] = { 
            is_manager: u.is_manager, 
            managed_unit_ids: u.managed_units.map((m) => m.id),
            member_unit_ids: u.units.map((m) => m.id)
          };
        });
        setEditState(init);
      }
      alert('Utente aggiornato con successo!');
    } else {
      alert('Errore aggiornamento utente');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Drag and Drop handlers
  const handleDragStart = (unit: Unit) => {
    setDraggedUnit(unit);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnMember = (userId: number) => {
    if (!draggedUnit) return;
    
    setEditState(prev => {
      const userState = prev[userId];
      // Add to member units if not already there
      if (!userState.member_unit_ids.includes(draggedUnit.id)) {
        return {
          ...prev,
          [userId]: {
            ...userState,
            member_unit_ids: [...userState.member_unit_ids, draggedUnit.id]
          }
        };
      }
      return prev;
    });
    setDraggedUnit(null);
  };

  const handleDropOnManaged = (userId: number) => {
    if (!draggedUnit) return;
    
    setEditState(prev => {
      const userState = prev[userId];
      // Add to managed units if not already there
      if (!userState.managed_unit_ids.includes(draggedUnit.id)) {
        return {
          ...prev,
          [userId]: {
            ...userState,
            managed_unit_ids: [...userState.managed_unit_ids, draggedUnit.id]
          }
        };
      }
      return prev;
    });
    setDraggedUnit(null);
  };

  const removeFromMember = (userId: number, unitId: number) => {
    setEditState(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        member_unit_ids: prev[userId].member_unit_ids.filter(id => id !== unitId)
      }
    }));
  };

  const removeFromManaged = (userId: number, unitId: number) => {
    setEditState(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        managed_unit_ids: prev[userId].managed_unit_ids.filter(id => id !== unitId)
      }
    }));
  };

  // Filtra gli utenti in base al termine di ricerca
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>⚙️</span>
            Pannello Amministratore
          </h1>
          <div className={styles.headerActions}>
            <button className={styles.dashboardButton} onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button className={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.gridLayout}>
          {/* Left Sidebar - Units */}
          <div className={styles.sidebar}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <span className={styles.cardIcon}>🏢</span>
                  Unità Disponibili
                </h2>
              </div>

              <form className={styles.form} onSubmit={handleCreateUnit}>
                <input
                  className={styles.input}
                  placeholder="Nome nuova unità..."
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  required
                />
                <button className={styles.submitButton} type="submit">
                  Crea
                </button>
              </form>

              <div className={styles.unitsList}>
                <p className={styles.hint}>Trascina le unità sugli utenti per assegnarle</p>
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className={styles.draggableUnit}
                    draggable
                    onDragStart={() => handleDragStart(unit)}
                  >
                    <span className={styles.unitIcon}>📁</span>
                    {unit.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Area - Users */}
          <div className={styles.mainArea}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <span className={styles.cardIcon}>👥</span>
                  Gestione Utenti
                </h2>
                <span className={styles.badge}>{filteredUsers.length} / {users.length} utenti</span>
              </div>

              {/* Barra di ricerca */}
              <div className={styles.searchBar}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="🔍 Cerca per email o nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className={styles.clearButton}
                    onClick={() => setSearchTerm('')}
                  >
                    ×
                  </button>
                )}
              </div>

              {loading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner}></div>
                  <span>Caricamento utenti...</span>
                </div>
              ) : (
                <div className={styles.usersList}>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                    <div key={user.id} className={styles.userCard}>
                      <div className={styles.userHeader}>
                        <div className={styles.userInfo}>
                          <span className={styles.userIcon}>👤</span>
                          <div>
                            <div className={styles.userEmail}>{user.email}</div>
                            {user.full_name && <div className={styles.userName}>{user.full_name}</div>}
                          </div>
                        </div>
                        <div className={styles.userActions}>
                          <label className={styles.managerLabel}>
                            <input
                              type="checkbox"
                              checked={editState[user.id]?.is_manager || false}
                              onChange={(e) =>
                                setEditState((s) => ({
                                  ...s,
                                  [user.id]: {
                                    ...s[user.id],
                                    is_manager: e.target.checked,
                                  },
                                }))
                              }
                            />
                            <span>Manager</span>
                          </label>
                          <button 
                            className={styles.saveButton}
                            onClick={() => handleUserUpdate(user.id)}
                          >
                            💾 Salva
                          </button>
                        </div>
                      </div>

                      <div className={styles.userBody}>
                        {/* Member Units */}
                        <div className={styles.unitSection}>
                          <h3 className={styles.sectionTitle}>🏢 Appartiene a:</h3>
                          <div 
                            className={styles.dropZone}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDropOnMember(user.id)}
                          >
                            {editState[user.id]?.member_unit_ids.length === 0 ? (
                              <p className={styles.dropHint}>Trascina qui le unità di appartenenza</p>
                            ) : (
                              <div className={styles.unitTags}>
                                {editState[user.id]?.member_unit_ids.map(unitId => {
                                  const unit = units.find(u => u.id === unitId);
                                  return unit ? (
                                    <div key={unitId} className={styles.unitTag}>
                                      {unit.name}
                                      <button 
                                        className={styles.removeButton}
                                        onClick={() => removeFromMember(user.id, unitId)}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Managed Units */}
                        <div className={styles.unitSection}>
                          <h3 className={styles.sectionTitle}>👔 Gestisce:</h3>
                          <div 
                            className={`${styles.dropZone} ${styles.managerZone}`}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDropOnManaged(user.id)}
                          >
                            {editState[user.id]?.managed_unit_ids.length === 0 ? (
                              <p className={styles.dropHint}>Trascina qui le unità da gestire</p>
                            ) : (
                              <div className={styles.unitTags}>
                                {editState[user.id]?.managed_unit_ids.map(unitId => {
                                  const unit = units.find(u => u.id === unitId);
                                  return unit ? (
                                    <div key={unitId} className={`${styles.unitTag} ${styles.managedTag}`}>
                                      {unit.name}
                                      <button 
                                        className={styles.removeButton}
                                        onClick={() => removeFromManaged(user.id, unitId)}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))) : (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>🔍</div>
                      <p className={styles.emptyText}>
                        {searchTerm 
                          ? `Nessun utente trovato per "${searchTerm}"`
                          : 'Nessun utente registrato'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminNew;
