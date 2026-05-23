import React, { useState, useEffect } from 'react';
import { Shield, Key, Calendar, BookOpen, Trash2, Edit, Plus, Check, X, AlertCircle } from 'lucide-react';

const TABLES = ['M1', 'M2', 'M3', 'L1', 'L2', 'B1', 'B2', 'T1', 'T2', 'T3'];
const CATEGORIES = ['Appetizers', 'Signature Manchurian', 'Entrees', 'Rice & Noodles', 'Beverages', 'Desserts', 'Sides'];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'menu'
  const [bookings, setBookings] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  
  // Loading & Error States for Data Fetching
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // CRUD Menu Item Modal/Form State
  const [isMenuFormOpen, setIsMenuFormOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null); // null means creating
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    description: '',
    price: 15,
    category: 'Appetizers',
    spice_level: 0,
    is_veg: true,
    image_url: ''
  });

  // Verify Admin Key and Fetch Initial Data
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setAuthError('Please enter the admin key.');
      return;
    }

    setVerifying(true);
    setAuthError('');

    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        headers: {
          'x-admin-key': passcode
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
        // Save to sessionStorage so reload doesn't kick them out instantly
        sessionStorage.setItem('ember_admin_key', passcode);
        const data = await response.json();
        setBookings(data);
        fetchMenu();
      } else {
        const errData = await response.json();
        setAuthError(errData.error || 'Authentication failed. Invalid passcode.');
      }
    } catch (err) {
      setAuthError('Could not reach backend server.');
    } finally {
      setVerifying(false);
    }
  };

  // Auto-login from session storage if available
  useEffect(() => {
    const savedKey = sessionStorage.getItem('ember_admin_key');
    if (savedKey) {
      setPasscode(savedKey);
      // Trigger a simulated submit
      const verifySaved = async () => {
        try {
          const response = await fetch(`${API_URL}/api/bookings`, {
            headers: { 'x-admin-key': savedKey }
          });
          if (response.ok) {
            setIsAuthenticated(true);
            const data = await response.json();
            setBookings(data);
            fetchMenu();
          }
        } catch (e) {
          sessionStorage.removeItem('ember_admin_key');
        }
      };
      verifySaved();
    }
  }, []);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        headers: {
          'x-admin-key': passcode
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        throw new Error('Failed to fetch bookings');
      }
    } catch (err) {
      showTemporaryFeedback('error', 'Error fetching bookings list.');
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchMenu = async () => {
    setLoadingMenu(true);
    try {
      const response = await fetch(`${API_URL}/api/menu`);
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      } else {
        throw new Error('Failed to fetch menu');
      }
    } catch (err) {
      showTemporaryFeedback('error', 'Error fetching menu items.');
    } finally {
      setLoadingMenu(false);
    }
  };

  const showTemporaryFeedback = (type, message) => {
    if (type === 'success') {
      setActionSuccess(message);
      setTimeout(() => setActionSuccess(''), 4000);
    } else {
      setActionError(message);
      setTimeout(() => setActionError(''), 4000);
    }
  };

  // Booking Update Actions
  const handleUpdateBooking = async (id, status, tableId) => {
    try {
      const response = await fetch(`${API_URL}/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': passcode
        },
        body: JSON.stringify({ status, table_id: tableId || null })
      });

      if (response.ok) {
        showTemporaryFeedback('success', `Booking #${id} updated successfully.`);
        fetchBookings();
      } else {
        const err = await response.json();
        showTemporaryFeedback('error', err.error || 'Failed to update booking.');
      }
    } catch (err) {
      showTemporaryFeedback('error', 'Network error. Could not update booking.');
    }
  };

  // Menu Creation/Editing
  const handleOpenMenuForm = (item = null) => {
    if (item) {
      setEditingMenuItem(item);
      setMenuFormData({
        name: item.name,
        description: item.description || '',
        price: item.price,
        category: item.category,
        spice_level: item.spice_level,
        is_veg: item.is_veg,
        image_url: item.image_url || ''
      });
    } else {
      setEditingMenuItem(null);
      setMenuFormData({
        name: '',
        description: '',
        price: 15,
        category: 'Appetizers',
        spice_level: 0,
        is_veg: true,
        image_url: ''
      });
    }
    setIsMenuFormOpen(true);
  };

  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    setActionError('');
    
    const isEditing = editingMenuItem !== null;
    const url = isEditing 
      ? `${API_URL}/api/menu/${editingMenuItem.id}`
      : `${API_URL}/api/menu`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': passcode
        },
        body: JSON.stringify(menuFormData)
      });

      const result = await response.json();
      if (response.ok) {
        showTemporaryFeedback('success', `Menu item ${isEditing ? 'updated' : 'created'} successfully.`);
        setIsMenuFormOpen(false);
        fetchMenu();
      } else {
        setActionError(result.error || 'Failed to save menu item details.');
      }
    } catch (err) {
      setActionError('Could not process request. Backend connection failure.');
    }
  };

  const handleDeleteMenuItem = async (id) => {
    if (!window.confirm('Are you sure you want to extinguish this culinary menu item?')) return;

    try {
      const response = await fetch(`${API_URL}/api/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': passcode
        }
      });

      if (response.ok) {
        showTemporaryFeedback('success', 'Menu item extinguished successfully.');
        fetchMenu();
      } else {
        const err = await response.json();
        showTemporaryFeedback('error', err.error || 'Failed to delete menu item.');
      }
    } catch (err) {
      showTemporaryFeedback('error', 'Network failure. Could not delete selection.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ember_admin_key');
    setIsAuthenticated(false);
    setPasscode('');
  };

  if (!isAuthenticated) {
    /* Obsidian Login Screen */
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div className="glass-panel ember-glow-hover" style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(12, 12, 16, 0.95)',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.05)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            marginBottom: '20px',
            color: 'var(--gold-primary)'
          }}>
            <Shield size={28} />
          </div>

          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.6rem',
            color: '#ffffff',
            marginBottom: '6px'
          }}>
            Admin Sanctuary
          </h3>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            marginBottom: '28px'
          }}>
            Authenticating as the Keeper of Ember & Oak.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={12} /> Access Secret Key
              </label>
              <input 
                type="password"
                required
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="e.g. ember-oak-admin-secret"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '4px',
                  padding: '12px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            {authError && (
              <div style={{
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                color: '#ef4444',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{authError}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={verifying}
              className="btn-solid-gold"
              style={{
                width: '100%',
                padding: '14px',
                opacity: verifying ? 0.7 : 1,
                cursor: verifying ? 'not-allowed' : 'pointer'
              }}
            >
              {verifying ? 'Verifying Credentials...' : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 24px',
      minHeight: '80vh'
    }}>
      {/* Header Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        borderBottom: '1px solid var(--glass-border)',
        paddingBottom: '24px',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)' }}>
            <Shield size={18} />
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 'bold' }}>EMBER & OAK KEEPER</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#ffffff', marginTop: '4px' }}>Management Control</h2>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={activeTab === 'bookings' ? "btn-solid-gold" : "btn-gold"}
            style={{ padding: '10px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Calendar size={14} /> Bookings ({bookings.length})
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={activeTab === 'menu' ? "btn-solid-gold" : "btn-gold"}
            style={{ padding: '10px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <BookOpen size={14} /> Menu Canvas ({menuItems.length})
          </button>
          <button 
            onClick={handleLogout}
            style={{
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              color: '#ef4444',
              padding: '10px 16px',
              fontSize: '0.85rem',
              borderRadius: '4px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(220, 38, 38, 0.2)'}
            onMouseLeave={e => e.target.style.background = 'rgba(220, 38, 38, 0.1)'}
          >
            Extinguish Access
          </button>
        </div>
      </div>

      {/* Action Notification banners */}
      {actionSuccess && (
        <div style={{
          background: 'rgba(78, 140, 111, 0.1)',
          border: '1px solid rgba(78, 140, 111, 0.3)',
          color: 'var(--jade-primary)',
          padding: '12px 20px',
          borderRadius: '4px',
          fontSize: '0.9rem',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} /> {actionSuccess}
        </div>
      )}
      {actionError && (
        <div style={{
          background: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          color: '#ef4444',
          padding: '12px 20px',
          borderRadius: '4px',
          fontSize: '0.9rem',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} /> {actionError}
        </div>
      )}

      {/* TAB CONTENT: BOOKINGS MANAGER */}
      {activeTab === 'bookings' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>Reservations Journal</h3>
            <button 
              onClick={fetchBookings} 
              className="btn-gold" 
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              disabled={loadingBookings}
            >
              {loadingBookings ? 'Refreshing...' : 'Refresh List'}
            </button>
          </div>

          {loadingBookings ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Reading bookings ledger...</div>
          ) : bookings.length === 0 ? (
            <div style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid var(--glass-border)',
              borderRadius: '6px',
              padding: '60px 24px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              No bookings have been logged in the system.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid var(--glass-border)', borderRadius: '6px' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem',
                textAlign: 'left',
                background: 'rgba(12,12,14,0.4)'
              }}>
                <thead>
                  <tr style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid var(--glass-border)',
                    color: 'var(--gold-primary)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}>
                    <th style={{ padding: '16px' }}>Ref ID</th>
                    <th style={{ padding: '16px' }}>Guest Details</th>
                    <th style={{ padding: '16px' }}>Date & Time</th>
                    <th style={{ padding: '16px' }}>Seats</th>
                    <th style={{ padding: '16px' }}>Allocated Table</th>
                    <th style={{ padding: '16px' }}>Status</th>
                    <th style={{ padding: '16px' }}>Special Requests</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => {
                    const statusColor = booking.status === 'confirmed' 
                      ? 'var(--jade-primary)' 
                      : booking.status === 'pending' 
                        ? '#ff9800' 
                        : '#ef4444';

                    return (
                      <tr 
                        key={booking.id}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '16px', fontFamily: 'monospace', fontWeight: 'bold' }}>EO-{booking.id}</td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: '500', color: '#ffffff' }}>{booking.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{booking.email}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{booking.phone}</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ color: '#ffffff' }}>{booking.date}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', marginTop: '2px' }}>{booking.time}</div>
                        </td>
                        <td style={{ padding: '16px', fontWeight: 'bold' }}>{booking.guests}</td>
                        <td style={{ padding: '16px' }}>
                          <select
                            defaultValue={booking.table_id || ''}
                            onChange={(e) => handleUpdateBooking(booking.id, booking.status, e.target.value)}
                            style={{
                              background: 'rgba(20, 20, 24, 0.95)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '4px',
                              padding: '6px 8px',
                              color: booking.table_id ? 'var(--gold-primary)' : 'rgba(255,255,255,0.4)',
                              fontSize: '0.8rem',
                              outline: 'none',
                              fontWeight: 'bold'
                            }}
                          >
                            <option value="">Unassigned</option>
                            {TABLES.map(t => (
                              <option key={t} value={t}>Table {t}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            border: `1px solid ${statusColor}`,
                            background: `${statusColor}10`,
                            color: statusColor,
                            padding: '3px 8px',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            fontWeight: '600',
                            borderRadius: '4px'
                          }}>
                            {booking.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px', maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={booking.special_requests}>
                          <span style={{ fontSize: '0.8rem', color: booking.special_requests ? '#ffffff' : 'var(--text-muted)' }}>
                            {booking.special_requests || 'None'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleUpdateBooking(booking.id, 'confirmed', booking.table_id)}
                              disabled={booking.status === 'confirmed'}
                              style={{
                                background: 'none',
                                border: '1px solid var(--jade-primary)',
                                color: 'var(--jade-primary)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                cursor: booking.status === 'confirmed' ? 'not-allowed' : 'pointer',
                                opacity: booking.status === 'confirmed' ? 0.4 : 1
                              }}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleUpdateBooking(booking.id, 'cancelled', booking.table_id)}
                              disabled={booking.status === 'cancelled'}
                              style={{
                                background: 'none',
                                border: '1px solid #ef4444',
                                color: '#ef4444',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                cursor: booking.status === 'cancelled' ? 'not-allowed' : 'pointer',
                                opacity: booking.status === 'cancelled' ? 0.4 : 1
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MENU MANAGER CRUD */}
      {activeTab === 'menu' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>Culinary Canvas Entries</h3>
            <button 
              onClick={() => handleOpenMenuForm(null)}
              className="btn-solid-gold" 
              style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Add New Offering
            </button>
          </div>

          {loadingMenu ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Retrieving culinary registry...</div>
          ) : menuItems.length === 0 ? (
            <div style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid var(--glass-border)',
              borderRadius: '6px',
              padding: '60px 24px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              No menu items present in database. Click Add New Offering.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {menuItems.map(item => (
                <div 
                  key={item.id} 
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    background: 'rgba(12,12,14,0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid var(--glass-border)',
                    position: 'relative'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        color: 'var(--gold-primary)',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontWeight: '600'
                      }}>
                        {item.category}
                      </span>
                      <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1.05rem' }}>
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </div>

                    <h4 style={{ color: '#ffffff', fontFamily: 'var(--font-serif)', fontSize: '1.15rem', marginBottom: '8px' }}>{item.name}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.5', marginBottom: '16px' }}>{item.description || 'No description provided.'}</p>
                    
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        color: item.is_veg ? 'var(--jade-primary)' : 'var(--text-muted)',
                        background: item.is_veg ? 'rgba(78, 140, 111, 0.1)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${item.is_veg ? 'rgba(78, 140, 111, 0.2)' : 'var(--glass-border)'}`,
                        padding: '2px 6px',
                        borderRadius: '3px'
                      }}>
                        {item.is_veg ? '🟢 Vegetarian' : '🔴 Non-Veg'}
                      </span>
                      
                      {item.spice_level > 0 && (
                        <span style={{
                          fontSize: '0.7rem',
                          color: 'var(--ember-primary)',
                          background: 'rgba(230, 92, 0, 0.1)',
                          border: '1px solid rgba(230, 92, 0, 0.2)',
                          padding: '2px 6px',
                          borderRadius: '3px'
                        }}>
                          Spice: {'🌶️'.repeat(item.spice_level)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    borderTop: '1px solid rgba(255,255,255,0.03)',
                    paddingTop: '12px',
                    marginTop: '8px'
                  }}>
                    <button
                      onClick={() => handleOpenMenuForm(item)}
                      style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--glass-border)',
                        color: '#ffffff',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Edit size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMenuItem(item.id)}
                      style={{
                        flex: 1,
                        background: 'rgba(220, 38, 38, 0.05)',
                        border: '1px solid rgba(220, 38, 38, 0.2)',
                        color: '#ef4444',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={e => e.target.style.background = 'rgba(220, 38, 38, 0.15)'}
                      onMouseLeave={e => e.target.style.background = 'rgba(220, 38, 38, 0.05)'}
                    >
                      <Trash2 size={12} /> Extinguish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CRUD SUB-MODAL OR FORM DRAWER FOR MENU CREATION/EDITING */}
      {isMenuFormOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div 
            onClick={() => setIsMenuFormOpen(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(5, 5, 6, 0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }} 
          />

          <div className="glass-panel" style={{
            position: 'relative',
            zIndex: 2001,
            width: '100%',
            maxWidth: '500px',
            background: 'rgba(12, 12, 16, 0.98)',
            padding: '30px',
            borderRadius: '8px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button 
              onClick={() => setIsMenuFormOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.5rem',
              color: '#ffffff',
              marginBottom: '4px'
            }}>
              {editingMenuItem ? 'Modify Offering' : 'Register New Offering'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '24px' }}>
              Populate the canvas fields below.
            </p>

            <form onSubmit={handleSaveMenuItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', textTransform: 'uppercase' }}>Offering Name</label>
                <input 
                  type="text"
                  required
                  value={menuFormData.name}
                  onChange={e => setMenuFormData({ ...menuFormData, name: e.target.value })}
                  placeholder="e.g. Chili Crisp Dumplings"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '4px',
                    padding: '10px',
                    color: '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', textTransform: 'uppercase' }}>Description</label>
                <textarea 
                  value={menuFormData.description}
                  onChange={e => setMenuFormData({ ...menuFormData, description: e.target.value })}
                  placeholder="Describe the textures, fire level, smoke aroma..."
                  rows={3}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '4px',
                    padding: '10px',
                    color: '#ffffff',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Row: Price & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', textTransform: 'uppercase' }}>Price ($)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={menuFormData.price}
                    onChange={e => setMenuFormData({ ...menuFormData, price: parseFloat(e.target.value) || 0 })}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '4px',
                      padding: '10px',
                      color: '#ffffff',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', textTransform: 'uppercase' }}>Category</label>
                  <select 
                    value={menuFormData.category}
                    onChange={e => setMenuFormData({ ...menuFormData, category: e.target.value })}
                    style={{
                      background: 'rgba(20, 20, 24, 0.95)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '4px',
                      padding: '10px',
                      color: '#ffffff',
                      outline: 'none'
                    }}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row: Spice Level & Veg Option */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', textTransform: 'uppercase' }}>Spice Level</label>
                  <select 
                    value={menuFormData.spice_level}
                    onChange={e => setMenuFormData({ ...menuFormData, spice_level: parseInt(e.target.value, 10) })}
                    style={{
                      background: 'rgba(20, 20, 24, 0.95)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '4px',
                      padding: '10px',
                      color: '#ffffff',
                      outline: 'none'
                    }}
                  >
                    {[0, 1, 2, 3].map(lvl => (
                      <option key={lvl} value={lvl}>
                        {lvl === 0 ? 'Not Spicy' : `${lvl} - ${'🌶️'.repeat(lvl)}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '100%', paddingTop: '16px' }}>
                  <input 
                    type="checkbox"
                    id="isVegCheckbox"
                    checked={menuFormData.is_veg}
                    onChange={e => setMenuFormData({ ...menuFormData, is_veg: e.target.checked })}
                    style={{
                      accentColor: 'var(--gold-primary)',
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer'
                    }}
                  />
                  <label htmlFor="isVegCheckbox" style={{ fontSize: '0.85rem', color: '#ffffff', cursor: 'pointer', userSelect: 'none' }}>
                    Vegetarian Selection
                  </label>
                </div>
              </div>

              {/* Image URL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', textTransform: 'uppercase' }}>Image Path (Optional)</label>
                <input 
                  type="text"
                  value={menuFormData.image_url}
                  onChange={e => setMenuFormData({ ...menuFormData, image_url: e.target.value })}
                  placeholder="/images/example.jpg"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '4px',
                    padding: '10px',
                    color: '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsMenuFormOpen(false)}
                  className="btn-gold"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-solid-gold"
                  style={{ flex: 1, padding: '12px' }}
                >
                  {editingMenuItem ? 'Save Alterations' : 'Ignite Offering'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
