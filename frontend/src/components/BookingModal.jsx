import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Clock, CheckCircle, Flame, Copy, Share2 } from 'lucide-react';

const TABLES = [
  { id: 'M1', name: 'M1', zone: 'Main Dining Room', seats: 2, x: 70, y: 110, r: 20 },
  { id: 'M2', name: 'M2', zone: 'Main Dining Room', seats: 4, x: 215, y: 110, r: 26 },
  { id: 'M3', name: 'M3', zone: 'Main Dining Room', seats: 6, x: 142, y: 245, r: 32 },
  { id: 'L1', name: 'L1', zone: 'Ember Lounge', seats: 2, x: 360, y: 100, r: 22 },
  { id: 'L2', name: 'L2', zone: 'Ember Lounge', seats: 4, x: 510, y: 100, r: 26 },
  { id: 'B1', name: 'B1', zone: 'Whiskey Bar', seats: 2, x: 335, y: 270, r: 20 },
  { id: 'B2', name: 'B2', zone: 'Whiskey Bar', seats: 2, x: 400, y: 270, r: 20 },
  { id: 'T1', name: 'T1', zone: 'VIP Terrace', seats: 4, x: 490, y: 235, r: 22 },
  { id: 'T2', name: 'T2', zone: 'VIP Terrace', seats: 6, x: 550, y: 220, r: 26 },
  { id: 'T3', name: 'T3', zone: 'VIP Terrace', seats: 8, x: 525, y: 295, r: 28 }
];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BookingModal = ({ isOpen, onClose }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '2',
    date: todayStr,
    time: '19:00',
    special_requests: '',
    table_id: ''
  });

  const [occupiedTables, setOccupiedTables] = useState([]);
  const [loadingOccupied, setLoadingOccupied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch occupied tables whenever date or time changes
  useEffect(() => {
    if (!formData.date) return;
    
    const fetchOccupied = async () => {
      setLoadingOccupied(true);
      try {
        const response = await fetch(`${API_URL}/api/bookings/occupied?date=${formData.date}&time=${formData.time}`);
        if (response.ok) {
          const data = await response.json();
          setOccupiedTables(data);
          
          // Clear selected table if it becomes occupied
          if (formData.table_id && data.includes(formData.table_id)) {
            setFormData(prev => ({ ...prev, table_id: '' }));
          }
        }
      } catch (err) {
        console.error('Error fetching occupied tables:', err);
      } finally {
        setLoadingOccupied(false);
      }
    };

    fetchOccupied();
  }, [formData.date, formData.time]);

  if (!isOpen) return null;

  const validateForm = () => {
    // Name validation
    if (!formData.name.trim()) {
      return 'Please enter your full name.';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      return 'Please enter a valid email address.';
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s\-()]{7,15}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone)) {
      return 'Please enter a valid phone number (at least 7 digits).';
    }

    // Date validation
    if (formData.date < todayStr) {
      return 'Date cannot be in the past.';
    }

    // Time validation (between 12:00 PM and 11:00 PM)
    const [hours, minutes] = formData.time.split(':').map(Number);
    if (hours < 12 || hours > 22 || (hours === 22 && minutes > 30)) {
      return 'Hours of operation are between 12:00 PM and 11:00 PM. Please select an eligible dining slot.';
    }

    // Table selection validation
    if (!formData.table_id) {
      return 'Please select a table from the restaurant map.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          date: formData.date,
          time: formData.time,
          guests: parseInt(formData.guests, 10),
          special_requests: formData.special_requests,
          table_id: formData.table_id
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessData(result);
      } else {
        setError(result.error || 'Failed to submit reservation. Please try again.');
      }
    } catch (err) {
      setError('Backend server offline or unreachable. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setCopied(false);
    setError('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      guests: '2',
      date: todayStr,
      time: '19:00',
      special_requests: '',
      table_id: ''
    });
    onClose();
  };

  const getGoogleCalendarUrl = (booking) => {
    const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const text = encodeURIComponent('Dinner at Ember & Oak');
    const dateFormatted = booking.date.replace(/-/g, '');
    const [hours, minutes] = booking.time.split(':');
    const startHour = parseInt(hours);
    const endHour = (startHour + 2) % 24;
    const startStr = `${dateFormatted}T${hours}${minutes}00`;
    const endStr = `${dateFormatted}T${String(endHour).padStart(2, '0')}${minutes}00`;
    const details = encodeURIComponent(`Reservation at Ember & Oak.\nTable: ${booking.table_id}\nGuests: ${booking.guests}\nConfirmation ID: EO-${booking.id}`);
    const location = encodeURIComponent('100 Oakwood Avenue, Hearth District, San Francisco, CA 94103');
    return `${base}&text=${text}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  };

  const handleCopyDetails = () => {
    if (!successData) return;
    const text = `Ember & Oak Reservation
ID: EO-${successData.id}
Guest: ${successData.name}
Party: ${successData.guests} Guests
Date: ${successData.date}
Time: ${successData.time}
Table: ${successData.table_id}
Zone: ${TABLES.find(t => t.id === successData.table_id)?.zone || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedTableObj = TABLES.find(t => t.id === formData.table_id);
  const guestCountNum = parseInt(formData.guests, 10);
  const capacityWarning = selectedTableObj && guestCountNum > selectedTableObj.seats;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      {/* Dark Overlay Background */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(5, 5, 6, 0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }} 
      />

      {/* Modal Container */}
      <div className="glass-panel ember-glow-hover" style={{
        position: 'relative',
        zIndex: 1001,
        width: '100%',
        maxWidth: '580px',
        background: 'rgba(12, 12, 16, 0.95)',
        padding: '30px',
        maxHeight: '92vh',
        overflowY: 'auto',
        borderRadius: '8px',
        animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '5px',
            transition: 'color 0.2s',
            zIndex: 10
          }}
          onMouseEnter={e => e.target.style.color = '#ffffff'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >
          <X size={20} />
        </button>

        {!successData ? (
          <>
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.8rem',
              color: '#ffffff',
              marginBottom: '8px',
            }}>
              Table Reservation
            </h3>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              marginBottom: '24px',
            }}>
              Select your date, time, and table location in our fire-lit dining sanctuary.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Name input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Alexander Mercer" 
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '4px',
                    padding: '12px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--gold-primary)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--glass-border)';
                  }}
                />
              </div>

              {/* Row: Email & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="alex@example.com" 
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '4px',
                      padding: '12px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</label>
                  <input 
                    type="tel" 
                    required 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="(415) 555-0198" 
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '4px',
                      padding: '12px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Row: Guests, Date, Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '16px' }} className="form-row-three">
                
                {/* Guests */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={12} /> Guests
                  </label>
                  <select 
                    value={formData.guests}
                    onChange={e => setFormData({...formData, guests: e.target.value})}
                    style={{
                      background: 'rgba(20, 20, 24, 0.95)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '4px',
                      padding: '12px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                    <option value="12">10+ Guests</option>
                  </select>
                </div>

                {/* Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> Date
                  </label>
                  <input 
                    type="date" 
                    required 
                    min={todayStr}
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    style={{
                      background: 'rgba(20, 20, 24, 0.95)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '4px',
                      padding: '11px 12px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Time */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> Time
                  </label>
                  <select 
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    style={{
                      background: 'rgba(20, 20, 24, 0.95)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '4px',
                      padding: '12px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  >
                    {[
                      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
                      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', 
                      '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'
                    ].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special Requests */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Special Requests</label>
                <textarea 
                  value={formData.special_requests}
                  onChange={e => setFormData({...formData, special_requests: e.target.value})}
                  placeholder="Allergies, dietary restrictions, special occasions, or structural preferences..."
                  rows={2}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '4px',
                    padding: '12px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Interactive Seating Layout */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Select Seating Zone & Table
                  </label>
                  {loadingOccupied && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', animation: 'pulse 1.5s infinite' }}>Checking availability...</span>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <svg 
                    viewBox="0 0 600 350" 
                    style={{
                      width: '100%',
                      height: 'auto',
                      background: 'rgba(10, 10, 12, 0.95)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '6px',
                      display: 'block'
                    }}
                  >
                    {/* Zone 1: Main Dining Room (Left) */}
                    <rect x="15" y="15" width="265" height="320" rx="8" fill="rgba(255,255,255,0.01)" stroke="rgba(212, 175, 55, 0.12)" strokeWidth="1" />
                    <text x="147" y="32" fill="var(--gold-primary)" fontSize="9" fontWeight="bold" letterSpacing="2" textAnchor="middle" opacity="0.6">MAIN DINING</text>

                    {/* Zone 2: Ember Lounge (Top Right) */}
                    <rect x="295" y="15" width="290" height="150" rx="8" fill="rgba(255,255,255,0.01)" stroke="rgba(212, 175, 55, 0.12)" strokeWidth="1" />
                    <text x="440" y="32" fill="var(--gold-primary)" fontSize="9" fontWeight="bold" letterSpacing="2" textAnchor="middle" opacity="0.6">EMBER LOUNGE (FIREPLACE)</text>
                    
                    {/* Fireplace glow indicator */}
                    <path d="M 425,15 Q 440,5 455,15 L 450,20 L 430,20 Z" fill="rgba(230, 92, 0, 0.3)" />
                    <text x="440" y="20" fill="var(--ember-primary)" fontSize="7" textAnchor="middle" fontWeight="bold" opacity="0.85">🔥 HEARTH</text>

                    {/* Zone 3: Whiskey Bar (Bottom Left of Right) */}
                    <rect x="295" y="180" width="135" height="155" rx="8" fill="rgba(255,255,255,0.01)" stroke="rgba(212, 175, 55, 0.12)" strokeWidth="1" />
                    <text x="362" y="196" fill="var(--gold-primary)" fontSize="9" fontWeight="bold" letterSpacing="1" textAnchor="middle" opacity="0.6">WHISKEY BAR</text>

                    {/* Zone 4: VIP Terrace (Bottom Right) */}
                    <rect x="445" y="180" width="140" height="155" rx="8" fill="rgba(255,255,255,0.01)" stroke="rgba(212, 175, 55, 0.12)" strokeWidth="1" />
                    <text x="515" y="196" fill="var(--gold-primary)" fontSize="9" fontWeight="bold" letterSpacing="1" textAnchor="middle" opacity="0.6">VIP TERRACE</text>

                    {/* Render Tables */}
                    {TABLES.map(table => {
                      const isOccupied = occupiedTables.includes(table.id);
                      const isSelected = formData.table_id === table.id;

                      let fill = 'rgba(255, 255, 255, 0.02)';
                      let stroke = 'rgba(212, 175, 55, 0.4)';
                      let strokeWidth = '1';
                      let cursor = 'pointer';
                      let filter = 'none';

                      if (isOccupied) {
                        fill = 'rgba(220, 38, 38, 0.1)';
                        stroke = 'rgba(220, 38, 38, 0.5)';
                        cursor = 'not-allowed';
                      } else if (isSelected) {
                        fill = 'rgba(212, 175, 55, 0.2)';
                        stroke = 'var(--gold-primary)';
                        strokeWidth = '2.5';
                        filter = 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.6))';
                      }

                      return (
                        <g 
                          key={table.id}
                          style={{ cursor }}
                          onClick={() => {
                            if (!isOccupied) {
                              setFormData({ ...formData, table_id: table.id });
                            }
                          }}
                        >
                          {/* Chairs around table */}
                          {Array.from({ length: table.seats }).map((_, i) => {
                            const angle = (i * 2 * Math.PI) / table.seats;
                            const chairDistance = table.r + 6;
                            const chairX = table.x + chairDistance * Math.cos(angle);
                            const chairY = table.y + chairDistance * Math.sin(angle);
                            return (
                              <circle 
                                key={i}
                                cx={chairX}
                                cy={chairY}
                                r="4.5"
                                fill={isSelected ? 'var(--gold-primary)' : isOccupied ? 'rgba(220, 38, 38, 0.4)' : 'rgba(255,255,255,0.15)'}
                                stroke="rgba(0,0,0,0.5)"
                                strokeWidth="0.5"
                              />
                            );
                          })}

                          {/* Table Body */}
                          <circle 
                            cx={table.x}
                            cy={table.y}
                            r={table.r}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                            filter={filter}
                            style={{ transition: 'all 0.2s' }}
                          />

                          {/* Table Label */}
                          <text 
                            x={table.x}
                            y={table.y + 4}
                            fill={isSelected ? '#ffffff' : isOccupied ? 'rgba(220, 38, 38, 0.7)' : 'rgba(255,255,255,0.7)'}
                            fontSize="9"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {table.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Seating Map Legend */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '24px',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginTop: '4px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(212, 175, 55, 0.4)' }} />
                    <span>Available</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.5)' }} />
                    <span>Occupied</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.2)', border: '2px solid var(--gold-primary)', boxShadow: '0 0 4px var(--gold-primary)' }} />
                    <span>Selected</span>
                  </div>
                </div>

                {/* Selected Table Info details */}
                {selectedTableObj && (
                  <div style={{
                    background: 'rgba(212, 175, 55, 0.04)',
                    border: '1px dashed rgba(212, 175, 55, 0.2)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    marginTop: '4px'
                  }}>
                    <div>
                      Selected: <strong style={{ color: 'var(--gold-primary)' }}>Table {selectedTableObj.name}</strong> ({selectedTableObj.zone})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Optimal seating limit: {selectedTableObj.seats} guests.
                    </div>
                    {capacityWarning && (
                      <div style={{ color: '#ff9800', fontSize: '0.75rem', marginTop: '2px', fontWeight: 'bold' }}>
                        ⚠️ Warning: Party size ({formData.guests}) exceeds optimal table capacity ({selectedTableObj.seats} seats).
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <div style={{
                  background: 'rgba(220, 38, 38, 0.1)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  color: '#ef4444',
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  lineHeight: '1.4'
                }}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={submitting}
                className="btn-solid-gold"
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  marginTop: '8px', 
                  opacity: submitting ? 0.7 : 1, 
                  cursor: submitting ? 'not-allowed' : 'pointer' 
                }}
              >
                {submitting ? 'Creating Sanctuary Reservation...' : 'Confirm Hearth Reservation'}
              </button>
            </form>
          </>
        ) : (
          /* Glassmorphic confirmation receipt ticket */
          <div style={{
            textAlign: 'center',
            padding: '10px 5px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle size={52} style={{ color: 'var(--gold-primary)', filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.35))' }} />
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.8rem',
                color: '#ffffff',
                letterSpacing: '0.04em'
              }}>
                Reservation Confirmed
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Your place is prepared. Presentation details below.
              </p>
            </div>

            {/* Gorgeous Retro Ticket */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '12px',
              width: '100%',
              textAlign: 'left',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              overflow: 'hidden'
            }}>
              {/* Ticket Top Banner */}
              <div style={{
                background: 'rgba(212, 175, 55, 0.1)',
                padding: '16px 20px',
                borderBottom: '1px dashed rgba(212, 175, 55, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={16} style={{ color: '#e65c00' }} />
                  <span style={{ fontFamily: 'var(--font-serif)', color: '#ffffff', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                    EMBER & OAK
                  </span>
                </div>
                <div style={{
                  color: 'var(--gold-primary)',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  letterSpacing: '0.05em'
                }}>
                  EO-{successData.id}
                </div>
              </div>

              {/* Ticket Details */}
              <div style={{
                padding: '24px 20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px 20px',
                fontSize: '0.85rem'
              }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2px' }}>Guest Name</div>
                  <div style={{ color: '#ffffff', fontWeight: '500' }}>{successData.name}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2px' }}>Party Size</div>
                  <div style={{ color: '#ffffff', fontWeight: '500' }}>{successData.guests} Guests</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2px' }}>Date</div>
                  <div style={{ color: '#ffffff', fontWeight: '500' }}>{successData.date}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2px' }}>Time</div>
                  <div style={{ color: '#ffffff', fontWeight: '500' }}>{successData.time}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2px' }}>Table Reserved</div>
                  <div style={{ color: 'var(--gold-primary)', fontWeight: 'bold' }}>Table {successData.table_id}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2px' }}>Dining Zone</div>
                  <div style={{ color: '#ffffff', fontWeight: '500' }}>{TABLES.find(t => t.id === successData.table_id)?.zone || 'Main Dining'}</div>
                </div>

                {successData.special_requests && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2px' }}>Special Requests</div>
                    <div style={{ color: '#ffffff', fontSize: '0.8rem', lineHeight: '1.4', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      {successData.special_requests}
                    </div>
                  </div>
                )}
              </div>

              {/* Ticket Barcode Mock */}
              <div style={{
                padding: '16px 20px',
                background: 'rgba(0,0,0,0.2)',
                borderTop: '1px dashed rgba(212, 175, 55, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '2px',
                  height: '35px',
                  width: '75%',
                  alignItems: 'stretch',
                  opacity: 0.7
                }}>
                  {[
                    2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 1, 2, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 1, 2, 4, 2, 3, 1
                  ].map((w, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        flexGrow: w, 
                        background: idx % 2 === 0 ? 'var(--gold-primary)' : 'transparent' 
                      }} 
                    />
                  ))}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '2px' }}>
                  *EO{successData.id}D{successData.date.replace(/-/g, '')}T{successData.time.replace(':', '')}*
                </div>
              </div>
            </div>

            {/* Receipt Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              width: '100%',
              marginTop: '10px'
            }}>
              <a 
                href={getGoogleCalendarUrl(successData)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
                style={{ 
                  flex: 1, 
                  textDecoration: 'none', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  padding: '12px'
                }}
              >
                <Calendar size={15} /> Add to Calendar
              </a>
              <button 
                onClick={handleCopyDetails}
                className="btn-gold"
                style={{ 
                  flex: 1, 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  padding: '12px',
                  background: copied ? 'rgba(78, 140, 111, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: copied ? 'var(--jade-primary)' : 'var(--glass-border)',
                  color: copied ? 'var(--jade-primary)' : '#ffffff'
                }}
              >
                {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
                {copied ? 'Copied!' : 'Copy Receipt'}
              </button>
            </div>

            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              lineHeight: '1.5',
              padding: '0 10px'
            }}>
              A notification has been registered for <span style={{ color: '#ffffff' }}>{successData.email}</span>. Bring this digital receipt or mention confirmation ID <strong style={{ color: '#ffffff' }}>EO-{successData.id}</strong> upon arrival.
            </p>

            <button 
              onClick={handleReset}
              className="btn-solid-gold"
              style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            >
              Complete & Close
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 500px) {
          .form-row {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .form-row-three {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingModal;
